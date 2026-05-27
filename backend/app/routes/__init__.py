from flask import Blueprint

main = Blueprint('main', __name__)

from .user_routes import *
from .event_routes import *
from .ticket_routes import *
from .mpesa_routes_secured import *
from .scan_routes import *
from .admin_routes import *
from .organiser_routes import *
from .transaction_routes import *
from .analytics_routes import *