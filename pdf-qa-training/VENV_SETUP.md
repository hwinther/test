# Virtual Environment Setup for PDF Q&A Training

## Windows Setup (PowerShell)

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate

## Unix/Linux/Mac Setup

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate

## VS Code Integration

1. Open Command Palette (Ctrl+Shift+P)
2. Type "Python: Select Interpreter"
3. Choose the interpreter from your venv folder:
   - Windows: `.\venv\Scripts\python.exe`
   - Unix/Linux/Mac: `./venv/bin/python`

## Git Integration

The venv/ folder is already in .gitignore to avoid committing virtual environment files.