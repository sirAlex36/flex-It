"""
Payment Service Layer
Issue #17: Monolithic File Structure → Separation of Concerns

Handles all M-Pesa payment logic in a testable, reusable service.
Routes layer calls this, routes don't know implementation details.
"""

import logging
from datetime import datetime
from app import db
from app.models import Ticket, Transaction, Event
from app.security import QRSecurity

logger = logging.getLogger(__name__)
qr_security = QRSecurity()


class PaymentService:
    """
    Service for handling payment operations
    
    Encapsulates:
    - Payment initiation
    - Transaction management
    - Idempotency checks
    - QR code generation
    """
    
    @staticmethod
    def initiate_stk_push(ticket_id, user_id, amount, phone):
        """
        Initiate M-Pesa STK push payment
        
        Args:
            ticket_id: Ticket to pay for
            user_id: User making payment (ownership check)
            amount: Payment amount in KSh
            phone: M-Pesa phone number (normalized)
        
        Returns:
            dict: {
                'status': 'success|already_paid|pending|error',
                'request_id': 'STK...',
                'message': '...',
                'error': '...' (if error)
            }
        """
        try:
            # Verify ticket ownership
            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return {"status": "error", "error": "Ticket not found"}
            
            if ticket.user_id != user_id:
                logger.warning(f"Unauthorized payment attempt for ticket {ticket_id}")
                return {"status": "error", "error": "Unauthorized"}
            
            # Check payment status
            if ticket.mpesa_status == "confirmed":
                logger.info(f"Payment already confirmed for ticket {ticket_id}")
                return {
                    "status": "already_paid",
                    "message": "This ticket is already paid"
                }
            
            # Check for recent pending payment (prevent duplicate STK)
            recent_transaction = Transaction.query.filter_by(
                ticket_id=ticket_id,
                status="pending"
            ).order_by(Transaction.initiated_at.desc()).first()
            
            if recent_transaction:
                age = (datetime.utcnow() - recent_transaction.initiated_at).total_seconds()
                if age < 300:  # 5 minutes
                    logger.info(f"Recent pending payment for ticket {ticket_id}")
                    return {
                        "status": "pending",
                        "request_id": recent_transaction.mpesa_reference,
                        "message": "Payment already in progress"
                    }
            
            # Create transaction record
            timestamp = datetime.utcnow()
            request_id = f"STK{ticket_id}{timestamp.strftime('%Y%m%d%H%M%S')}"
            
            transaction = Transaction(
                ticket_id=ticket_id,
                amount=amount,
                mpesa_reference=request_id,
                status="pending",
                payment_method="mpesa",
                initiated_at=timestamp
            )
            
            db.session.add(transaction)
            db.session.commit()
            
            logger.info(f"✓ STK Push initiated - Ticket #{ticket_id}, Ref: {request_id}")
            
            return {
                "status": "success",
                "request_id": request_id,
                "message": f"STK Push sent to {phone}",
                "phone": phone,
                "amount": amount
            }
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"STK push error: {str(e)}", exc_info=True)
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    def process_payment_callback(checkout_request_id, result_code, result_desc, 
                                receipt_number=None, amount=None):
        """
        Process M-Pesa payment callback
        
        Args:
            checkout_request_id: M-Pesa request ID
            result_code: 0 = success, other = failure
            result_desc: Result description
            receipt_number: M-Pesa receipt (if success)
            amount: Amount paid (if success)
        
        Returns:
            dict: {
                'status': 'success|failed|duplicate',
                'ticket_id': ...,
                'message': '...'
            }
        """
        try:
            # Find transaction
            transaction = Transaction.query.filter_by(
                mpesa_reference=checkout_request_id
            ).first()
            
            if not transaction:
                logger.warning(f"Transaction not found: {checkout_request_id}")
                return {"status": "not_found"}
            
            # Check if already processed (idempotency)
            if transaction.status == "success":
                logger.info(f"Transaction already processed: {transaction.id}")
                return {"status": "duplicate"}
            
            # Payment success
            if result_code == 0:
                try:
                    with db.session.begin_nested():
                        # Update transaction
                        transaction.status = "success"
                        transaction.mpesa_receipt = receipt_number
                        transaction.confirmed_at = datetime.utcnow()
                        db.session.flush()
                        
                        # Update ticket
                        ticket = transaction.ticket
                        ticket.mpesa_status = "confirmed"
                        ticket.mpesa_transaction_id = receipt_number
                        
                        # Generate QR code with signature
                        qr_payload = qr_security.create_signed_qr_payload(
                            ticket.uuid,
                            ticket.event_id
                        )
                        
                        # Store signature for validation
                        ticket.qr_signature = qr_security.generate_qr_signature(
                            ticket.uuid,
                            ticket.event_id
                        )
                        
                        db.session.flush()
                        
                        logger.info(f"✓ Transaction {transaction.id} → SUCCESS")
                        logger.info(f"✓ Ticket {ticket.id} → CONFIRMED")
                    
                    db.session.commit()
                    
                    return {
                        "status": "success",
                        "ticket_id": ticket.id,
                        "ticket_uuid": ticket.uuid,
                        "message": "Payment confirmed"
                    }
                
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Error processing success: {str(e)}", exc_info=True)
                    return {"status": "error"}
            
            # Payment failure
            else:
                try:
                    with db.session.begin():
                        transaction.status = "failed"
                        transaction.error_message = result_desc
                        db.session.flush()
                        
                        ticket = transaction.ticket
                        ticket.mpesa_status = "failed"
                        db.session.flush()
                        
                        logger.warning(f"✓ Ticket {ticket.id} marked as FAILED: {result_desc}")
                    
                    db.session.commit()
                    
                    return {
                        "status": "failed",
                        "ticket_id": ticket.id,
                        "message": f"Payment failed: {result_desc}"
                    }
                
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Error processing failure: {str(e)}", exc_info=True)
                    return {"status": "error"}
        
        except Exception as e:
            logger.error(f"Callback processing error: {str(e)}", exc_info=True)
            return {"status": "error"}
    
    @staticmethod
    def get_ticket_payment_status(ticket_id, user_id):
        """
        Get current payment status for a ticket
        
        Args:
            ticket_id: Ticket ID
            user_id: User ID (for ownership check)
        
        Returns:
            dict: Payment status and transaction history
        """
        try:
            ticket = Ticket.query.get(ticket_id)
            if not ticket or ticket.user_id != user_id:
                return {"status": "error", "error": "Not found"}
            
            transactions = Transaction.query.filter_by(ticket_id=ticket_id).all()
            
            return {
                "status": "success",
                "ticket_id": ticket_id,
                "mpesa_status": ticket.mpesa_status,
                "transactions": [
                    {
                        "id": t.id,
                        "status": t.status,
                        "amount": t.amount,
                        "initiated_at": t.initiated_at.isoformat(),
                        "confirmed_at": t.confirmed_at.isoformat() if t.confirmed_at else None,
                        "error": t.error_message
                    }
                    for t in transactions
                ]
            }
        
        except Exception as e:
            logger.error(f"Error fetching payment status: {str(e)}")
            return {"status": "error", "error": str(e)}
