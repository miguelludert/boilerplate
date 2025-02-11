#!/bin/bash
set -e

# Define the virtual environment directory
VENV_DIR="venv"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment in '$VENV_DIR'..."
  python3 -m venv "$VENV_DIR"
else
  echo "Using existing virtual environment in '$VENV_DIR'."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Optionally, upgrade pip and install requirements if a requirements.txt exists
echo "Upgrading pip..."
pip install --upgrade pip

if [ -f "requirements.txt" ]; then
  echo "Installing dependencies from requirements.txt..."
  pip install -r requirements.txt
fi

# Run the bootstrap.py script
echo "Running bootstrap.py..."
python3 bootstrap.py
