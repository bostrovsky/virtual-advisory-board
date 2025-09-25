#!/bin/bash
# Setup script to ensure pip works correctly
alias pip="python3 -m pip"
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
cd frontend && npm install && npm run build