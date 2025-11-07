# RAG Approach - Recommended for Browser Deployment

import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from typing import List, Dict, Tuple
import pickle

class RAGProcessor:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize with a lightweight embedding model"""
        self.embedding_model = SentenceTransformer(model_name)
        self.dimension = self.embedding_model.get_sentence_embedding_dimension()
        self.index = None
        self.chunks = []
        
    def create_embeddings(self, chunks: List[Dict]) -> np.ndarray:
        """Create embeddings for all text chunks"""
        texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        return embeddings
    
    def build_index(self, embeddings: np.ndarray):
        """Build FAISS index for similarity search"""
        self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype('float32'))
    
    def search_similar(self, query: str, top_k: int = 3) -> List[Tuple[Dict, float]]:
        """Search for most similar chunks"""
        if self.index is None:
            raise ValueError("Index not built. Call build_index first.")
        
        query_embedding = self.embedding_model.encode([query])
        faiss.normalize_L2(query_embedding)
        
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:  # Valid result
                results.append((self.chunks[idx], float(score)))
        
        return results
    
    def prepare_for_browser(self, output_dir: str = "browser-assets"):
        """Prepare embeddings and chunks for browser deployment"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert FAISS index to a format that can be used in browser
        # We'll use a simple approach with pre-computed embeddings
        embeddings = np.zeros((self.index.ntotal, self.dimension))
        for i in range(self.index.ntotal):
            embeddings[i] = self.index.reconstruct(i)
        
        # Save embeddings as JSON (for small datasets)
        embeddings_list = embeddings.tolist()
        
        browser_data = {
            'embeddings': embeddings_list,
            'chunks': self.chunks,
            'dimension': self.dimension
        }
        
        # For larger datasets, you might want to split this
        with open(f"{output_dir}/embeddings_and_chunks.json", 'w', encoding='utf-8') as f:
            json.dump(browser_data, f, ensure_ascii=False)
        
        print(f"Browser assets saved to {output_dir}/")
        print(f"File size: {os.path.getsize(f'{output_dir}/embeddings_and_chunks.json') / 1024 / 1024:.2f} MB")

def main():
    # Load processed chunks
    with open('../pdf-processing/processed_chunks.json', 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    print(f"Loaded {len(chunks)} chunks")
    
    # Initialize RAG processor
    rag = RAGProcessor()
    rag.chunks = chunks
    
    # Create embeddings
    print("Creating embeddings...")
    embeddings = rag.create_embeddings(chunks)
    
    # Build search index
    print("Building search index...")
    rag.build_index(embeddings)
    
    # Test search
    test_query = "What is the main topic discussed?"
    results = rag.search_similar(test_query, top_k=3)
    
    print(f"\nTest search for: '{test_query}'")
    for i, (chunk, score) in enumerate(results, 1):
        print(f"\n{i}. Score: {score:.3f}, Page: {chunk['page']}")
        print(f"Text: {chunk['text'][:150]}...")
    
    # Prepare for browser deployment
    print("\nPreparing browser assets...")
    rag.prepare_for_browser()
    
    # Save the model for later use
    with open('rag_processor.pkl', 'wb') as f:
        pickle.dump(rag, f)

if __name__ == "__main__":
    main()