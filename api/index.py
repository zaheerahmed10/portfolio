# api/index.py
import sys
import os

# Parent directory ko path mein add karo taake app.py import ho sake
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel `app` variable dhundta hai — already imported