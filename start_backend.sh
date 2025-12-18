#!/bin/bash

# Start SkillForge AI Backend Servers

echo "Starting SkillForge AI Backend..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Activate virtual environment
source "$PROJECT_ROOT/myvenv/bin/activate"

# Change to backend directory
cd "$PROJECT_ROOT/backend"

# Start notification server in background
echo "Starting notification server on port 8001..."
python notification_server.py &
NOTIFICATION_PID=$!

# Wait a moment for notification server to start
sleep 2

# Start Jac backend server
echo "Starting Jac backend server on port 8000..."
jac serve skillforge.jac

# Cleanup on exit
trap "kill $NOTIFICATION_PID" EXIT
