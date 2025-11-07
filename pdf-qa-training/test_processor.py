#!/usr/bin/env python3
"""
Quick test of the enhanced RAG processor
"""

import pickle
import os
import sys

# Add the rag-approach directory to Python path so we can import the class
sys.path.append('rag-approach')

try:
    from improved_create_embeddings import ImprovedRAGProcessor
    print("✓ Successfully imported ImprovedRAGProcessor")
except ImportError as e:
    print(f"❌ Could not import ImprovedRAGProcessor: {e}")
    print("This is needed to unpickle the processor object")

def test_processor():
    print("Testing enhanced RAG processor...")
    
    # Check if file exists
    if not os.path.exists('improved_rag_processor.pkl'):
        print("❌ improved_rag_processor.pkl not found")
        return False
    
    print("✓ Found improved_rag_processor.pkl")
    
    try:
        # Load the processor
        with open('improved_rag_processor.pkl', 'rb') as f:
            rag = pickle.load(f)
        
        print(f"✓ Loaded processor with {len(rag.chunks)} chunks")
        
        # Test a simple search
        if hasattr(rag, 'enhanced_search'):
            results = rag.enhanced_search('§ 35', top_k=2)
            print(f"✓ Test search returned {len(results)} results")
            
            if results:
                best_result = results[0]
                chunk = best_result[0]
                score = best_result[1]
                print(f"✓ Best match: Page {chunk['page']}, Score: {score:.3f}")
                print(f"  Type: {chunk.get('chunk_type', 'unknown')}")
                print(f"  Text: {chunk['text'][:100]}...")
        else:
            print("❌ enhanced_search method not found")
            return False
            
        print("✓ All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading processor: {e}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_processor()