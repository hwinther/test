#!/usr/bin/env python3
"""
Enhanced setup for Norwegian legal documents (Stortingets forretningsorden)
This script uses improved processing for better paragraph and section recognition
"""

import os
import sys
import subprocess
import json
import pickle

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the class definition needed for pickle loading
try:
    # Try importing from rag-approach directory
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag-approach'))
    from improved_create_embeddings import ImprovedRAGProcessor
except ImportError:
    print("Warning: Could not import ImprovedRAGProcessor class")
    ImprovedRAGProcessor = None

def run_improved_processing(pdf_path: str):
    """Run the improved processing pipeline"""
    
    print("=== Enhanced Norwegian Legal Document Processing ===")
    
    # Step 1: Process PDF with improved structure recognition
    print("\n1. Processing PDF with enhanced structure recognition...")
    result = subprocess.run([
        sys.executable, "pdf-processing/improved_process_pdf.py", pdf_path
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error in PDF processing: {result.stderr}")
        return False
    
    print("✓ PDF processed with enhanced structure recognition")
    print(result.stdout)
    
    # Step 2: Create enhanced embeddings
    print("\n2. Creating enhanced embeddings with Norwegian language support...")
    result = subprocess.run([
        sys.executable, "rag-approach/improved_create_embeddings.py"
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error creating embeddings: {result.stderr}")
        return False
    
    print("✓ Enhanced embeddings created")
    print(result.stdout)
    
    # Step 3: Test the enhanced system
    print("\n3. Testing enhanced search capabilities...")
    test_enhanced_search()
    
    return True

def test_enhanced_search():
    """Test the enhanced search with Norwegian queries"""
    try:
        if ImprovedRAGProcessor is None:
            print("❌ ImprovedRAGProcessor class not available, cannot test")
            return
        
        # Check both possible locations for the pickle file
        pickle_paths = [
            'improved_rag_processor.pkl',
            'rag-approach/improved_rag_processor.pkl'
        ]
        
        rag = None
        for pickle_path in pickle_paths:
            if os.path.exists(pickle_path):
                with open(pickle_path, 'rb') as f:
                    rag = pickle.load(f)
                print(f"✓ Loaded processor from: {pickle_path}")
                break
        
        if rag is None:
            print("❌ Could not find improved_rag_processor.pkl in expected locations")
            return
        
        # Test queries specific to Norwegian parliamentary procedures
        test_queries = [
            "§ 35",
            "votering og avstemming", 
            "Stortingspresident",
            "komité behandling",
            "fremmøte representanter",
            "sakgang",
            "debatt",
            "innstilling"
        ]
        
        print("\nTesting Norwegian-specific queries:")
        for query in test_queries:
            results = rag.enhanced_search(query, top_k=2)
            print(f"\n--- '{query}' ---")
            if results:
                best_result = results[0]
                chunk = best_result[0]
                score = best_result[1]
                print(f"Best match: Score {score:.3f}, Page {chunk['page']}")
                print(f"Type: {chunk.get('chunk_type', 'unknown')}")
                print(f"Sections: {chunk.get('section_numbers', [])}")
                print(f"Text preview: {chunk['text'][:100]}...")
            else:
                print("No results found")
    
    except Exception as e:
        print(f"Test failed: {e}")

def install_norwegian_requirements():
    """Install additional requirements for Norwegian language support"""
    print("Installing Norwegian language support...")
    
    additional_packages = [
        "sentence-transformers",  # For Norwegian SBERT models
    ]
    
    for package in additional_packages:
        print(f"Installing {package}...")
        result = subprocess.run([sys.executable, "-m", "pip", "install", package], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Warning: Could not install {package}")

def main():
    print("Enhanced Norwegian Legal Document Q&A Setup")
    print("=" * 60)
    
    # Check if we're in virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in virtual environment")
        print("   For PowerShell: .\\venv\\Scripts\\Activate.ps1")
        print("   For Command Prompt: .\\venv\\Scripts\\activate.bat")
        print("   Then run this script again")
        return
    
    # Get PDF path
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        print("Please provide the path to Stortingets forretningsorden PDF:")
        pdf_path = input("PDF path: ").strip()
        
        if not pdf_path:
            print("No PDF path provided. Exiting.")
            return
    
    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        return
    
    # Install Norwegian language support
    install_norwegian_requirements()
    
    # Run enhanced processing
    success = run_improved_processing(pdf_path)
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 Enhanced Norwegian Legal Document Q&A Setup Complete!")
        print("\nNext steps:")
        print("1. Start web server: python -m http.server 8000 -d web-interface")
        print("2. Open browser: http://localhost:8000/norwegian-legal.html")
        print("3. Test specific Norwegian queries:")
        print("   - '§ 35' (for specific paragraphs)")
        print("   - 'votering' (for voting procedures)")
        print("   - 'komité' (for committee procedures)")
        print("   - 'Stortingspresident' (for presidential duties)")
        
        print("\nFiles created:")
        print("- improved_chunks.json: Enhanced structured chunks")
        print("- improved_rag_processor.pkl: Enhanced search processor")
        print("- web-interface/browser-assets/embeddings_and_chunks.json: Browser-ready data")
        print("- web-interface/norwegian-legal.html: Norwegian-optimized interface")
        
    else:
        print("\n❌ Setup failed. Check the errors above.")

if __name__ == "__main__":
    main()