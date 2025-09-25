#!/bin/bash
# Build frontend
cd frontend && npm install && npm run build && cd ..
echo "Frontend build complete!"