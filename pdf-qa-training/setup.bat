@echo off
REM Setup script for Windows (batch file)

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo To activate the virtual environment in the future, run:
echo   venv\Scripts\activate.bat
echo.
echo Or in PowerShell:
echo   .\venv\Scripts\Activate.ps1
echo.
echo To deactivate, simply run: deactivate