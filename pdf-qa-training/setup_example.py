#!/usr/bin/env python3
"""
Complete workflow example for PDF Q&A system
This script demonstrates the entire process from PDF to browser-ready Q&A system
"""

import os
import sys
import json
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'PyPDF2', 'sentence_transformers', 'faiss', 'numpy', 'tiktoken'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_').lower())
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"Missing packages: {', '.join(missing)}")
        print("Make sure your virtual environment is activated and run:")
        print("  pip install -r requirements.txt")
        return False
    return True

def setup_venv():
    """Setup virtual environment if it doesn't exist"""
    import subprocess
    import sys
    
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Virtual environment not found. Creating one...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
        print("Virtual environment created!")
        print("\nPlease activate it and install dependencies:")
        if os.name == 'nt':  # Windows
            print("  .\\venv\\Scripts\\Activate.ps1")
        else:  # Unix/Linux/Mac
            print("  source venv/bin/activate")
        print("  pip install -r requirements.txt")
        print("\nThen run this script again.")
        return False
    return True

def process_pdf_example(pdf_path: str):
    """Process a PDF and create Q&A system"""
    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        return False
    
    print(f"Processing PDF: {pdf_path}")
    
    # Step 1: Extract text from PDF
    print("Step 1: Extracting text from PDF...")
    result = subprocess.run([
        sys.executable, "pdf-processing/process_pdf.py", pdf_path
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error processing PDF: {result.stderr}")
        return False
    
    print("✓ PDF processed successfully")
    
    # Step 2: Create embeddings
    print("Step 2: Creating embeddings...")
    result = subprocess.run([
        sys.executable, "rag-approach/create_embeddings.py"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error creating embeddings: {result.stderr}")
        return False
    
    print("✓ Embeddings created successfully")
    
    # Step 3: Test the system
    print("Step 3: Testing Q&A system...")
    test_qa_system()
    
    print("✓ Setup complete!")
    print("\nNext steps:")
    print("1. Run: npm run serve (or python -m http.server 8000 -d web-interface)")
    print("2. Open browser to http://localhost:8000")
    print("3. Ask questions about your PDF!")
    
    return True

def test_qa_system():
    """Test the Q&A system with sample queries"""
    try:
        # Import our RAG processor
        sys.path.append('rag-approach')
        import pickle
        
        with open('rag-approach/rag_processor.pkl', 'rb') as f:
            rag = pickle.load(f)
        
        # Test queries
        test_queries = [
            "What is this document about?",
            "What are the main topics covered?",
            "Can you summarize the content?"
        ]
        
        print("\nTesting with sample queries:")
        for query in test_queries:
            results = rag.search_similar(query, top_k=2)
            print(f"\nQuery: {query}")
            if results:
                print(f"Best match (Page {results[0][0]['page']}): {results[0][0]['text'][:100]}...")
            else:
                print("No results found")
    
    except Exception as e:
        print(f"Test failed: {e}")

def create_sample_pdf():
    """Create a sample PDF for testing if none provided"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        filename = "sample_document.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        
        # Create a multi-page sample document
        sample_content = [
            "Introduction to Machine Learning",
            "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
            "Chapter 1: Supervised Learning",
            "Supervised learning uses labeled data to train models.",
            "Chapter 2: Unsupervised Learning", 
            "Unsupervised learning finds patterns in unlabeled data.",
            "Chapter 3: Deep Learning",
            "Deep learning uses neural networks with multiple layers.",
            "Conclusion",
            "This document provides an overview of machine learning concepts."
        ]
        
        for i, content in enumerate(sample_content):
            c.drawString(100, 750 - (i % 10) * 50, content)
            if (i + 1) % 10 == 0:  # New page every 10 lines
                c.showPage()
        
        c.save()
        print(f"Created sample PDF: {filename}")
        return filename
        
    except ImportError:
        print("reportlab not installed. Cannot create sample PDF.")
        print("Install with: pip install reportlab")
        return None

def main():
    print("PDF Q&A System Setup")
    print("=" * 50)
    
    # Check if virtual environment exists
    if not setup_venv():
        return
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Get PDF path
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        print("No PDF provided. Options:")
        print("1. Provide PDF path: python setup_example.py path/to/your.pdf")
        print("2. Create sample PDF for testing")
        
        choice = input("Create sample PDF? [y/N]: ").lower().strip()
        if choice == 'y':
            pdf_path = create_sample_pdf()
            if not pdf_path:
                return
        else:
            print("Please provide a PDF path and run again.")
            return
    
    # Process the PDF
    success = process_pdf_example(pdf_path)
    
    if success:
        print("\n🎉 Setup completed successfully!")
        print("\nYour PDF Q&A system is ready to use.")
    else:
        print("\n❌ Setup failed. Check the errors above.")

if __name__ == "__main__":
    main()