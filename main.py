# Force Railway to detect this as a Python project
# This file serves as the main entry point for Railway deployment
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)