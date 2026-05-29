import os
from backend.app import create_app

app = create_app()

if __name__ == "__main__":
   
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    port = int(os.environ.get("PORT", 5000))
    
    app.run(debug=debug_mode, port=port, host="0.0.0.0")
# 74.220.48.0/24
# 74.220.56.0/24