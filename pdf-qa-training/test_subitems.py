import pickle
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'rag-approach'))
from improved_create_embeddings import ImprovedRAGProcessor

# Load the enhanced processor
try:
    with open('improved_rag_processor.pkl', 'rb') as f:
        processor = pickle.load(f)
    print("✓ Enhanced processor loaded successfully")
    
    # Test specific sub-item searches
    test_queries = [
        "§ 39a",
        "§ 39b", 
        "§ 39c",
        "§ 45a",
        "§ 45b"
    ]
    
    for query in test_queries:
        print(f"\n--- Testing: '{query}' ---")
        results = processor.enhanced_search(query, top_k=3)
        
        for i, result in enumerate(results, 1):
            keywords_str = ', '.join(result['keywords'][:5]) + ('...' if len(result['keywords']) > 5 else '')
            print(f"{i}. Score: {result['similarity_score']:.3f}, Page: {result['page']}")
            print(f"   Keywords: [{keywords_str}]")
            print(f"   Text: {result['text'][:200]}...")
            print()

except Exception as e:
    print(f"Error: {e}")
    print("Make sure the enhanced processor was created successfully.")