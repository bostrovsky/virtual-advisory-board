#!/bin/bash
# Setup script to ensure pip works correctly
echo "Starting setup..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
cd frontend && npm install && npm run build
echo "Setup complete!"