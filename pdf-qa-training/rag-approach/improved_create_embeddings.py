import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from typing import List, Dict, Tuple
import pickle
import re

class ImprovedRAGProcessor:
    def __init__(self, model_name: str = "NbAiLab/nb-sbert-base"):
        """Initialize with Norwegian-capable embedding model"""
        # Use Norwegian SBERT model if available, fallback to multilingual
        try:
            self.embedding_model = SentenceTransformer(model_name)
            print(f"Using Norwegian model: {model_name}")
        except:
            print(f"Norwegian model not found, using multilingual alternative")
            self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        
        self.dimension = self.embedding_model.get_sentence_embedding_dimension()
        self.index = None
        self.chunks = []
        
    def enhanced_chunk_preprocessing(self, chunks: List[Dict]) -> List[Dict]:
        """Enhanced preprocessing for Norwegian legal text"""
        enhanced_chunks = []
        
        for chunk in chunks:
            enhanced_chunk = chunk.copy()
            
            # Create enhanced text for embedding that includes context
            enhanced_text = self.create_enhanced_text(chunk)
            enhanced_chunk['enhanced_text'] = enhanced_text
            
            # Extract more specific metadata
            enhanced_chunk['section_numbers'] = self.extract_section_numbers(chunk['text'])
            enhanced_chunk['importance_score'] = self.calculate_importance_score(chunk)
            
            enhanced_chunks.append(enhanced_chunk)
        
        return enhanced_chunks
    
    def create_enhanced_text(self, chunk: Dict) -> str:
        """Create enhanced text for better embeddings"""
        text = chunk['text']
        chunk_type = chunk.get('chunk_type', 'regular')
        keywords = chunk.get('keywords', [])
        
        # Add context prefixes based on chunk type
        if chunk_type == 'section':
            prefix = "Paragraf i Stortingets forretningsorden: "
        elif chunk_type == 'procedural':
            prefix = "Prosedyre i Stortinget: "
        elif chunk_type == 'chapter_heading':
            prefix = "Kapittel i forretningsorden: "
        else:
            prefix = "Regel i Stortingets forretningsorden: "
        
        # Add keywords for better matching
        keyword_text = " ".join(keywords) if keywords else ""
        
        enhanced_text = f"{prefix}{text}"
        if keyword_text:
            enhanced_text += f" Nøkkelord: {keyword_text}"
        
        return enhanced_text
    
    def extract_section_numbers(self, text: str) -> List[str]:
        """Extract section/paragraph numbers from text"""
        section_numbers = []
        
        # Find § references
        paragraphs = re.findall(r'§\s*(\d+(?:-\d+)?)', text)
        section_numbers.extend([f"§{p}" for p in paragraphs])
        
        # Find numbered items
        numbered = re.findall(r'^\d+\.', text, re.MULTILINE)
        section_numbers.extend(numbered)
        
        return section_numbers
    
    def calculate_importance_score(self, chunk: Dict) -> float:
        """Calculate importance score for ranking"""
        score = 1.0
        
        # Boost score for different chunk types
        chunk_type = chunk.get('chunk_type', 'regular')
        if chunk_type == 'section':
            score += 2.0
        elif chunk_type == 'procedural':
            score += 1.5
        elif chunk_type == 'chapter_heading':
            score += 1.0
        
        # Boost based on keywords
        keywords = chunk.get('keywords', [])
        score += len(keywords) * 0.2
        
        # Boost if contains section references
        if '§' in chunk['text']:
            score += 0.5
        
        return score
    
    def create_embeddings(self, chunks: List[Dict]) -> np.ndarray:
        """Create embeddings using enhanced text"""
        enhanced_chunks = self.enhanced_chunk_preprocessing(chunks)
        self.chunks = enhanced_chunks  # Store enhanced chunks
        
        # Use enhanced text for embeddings
        texts = [chunk['enhanced_text'] for chunk in enhanced_chunks]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        return embeddings
    
    def build_index(self, embeddings: np.ndarray):
        """Build FAISS index for similarity search"""
        self.index = faiss.IndexFlatIP(self.dimension)
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings.astype('float32'))
    
    def enhanced_search(self, query: str, top_k: int = 5) -> List[Tuple[Dict, float]]:
        """Enhanced search with Norwegian language support"""
        if self.index is None:
            raise ValueError("Index not built. Call build_index first.")
        
        # Enhance query for better matching
        enhanced_query = self.enhance_query(query)
        
        # Create embedding for enhanced query
        query_embedding = self.embedding_model.encode([enhanced_query])
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k * 2)  # Get more results initially
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:  # Valid result
                chunk = self.chunks[idx]
                # Adjust score based on importance
                adjusted_score = float(score) * chunk.get('importance_score', 1.0)
                results.append((chunk, adjusted_score))
        
        # Sort by adjusted score and return top_k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
    
    def enhance_query(self, query: str) -> str:
        """Enhance query for better matching with Norwegian legal terms"""
        query_lower = query.lower()
        
        # Add context for Norwegian parliamentary terms
        enhancements = []
        
        if any(term in query_lower for term in ['paragraf', '§']):
            enhancements.append("Stortingets forretningsorden paragraf")
        
        if any(term in query_lower for term in ['votering', 'stemme', 'avstemming']):
            enhancements.append("votering prosedyre Stortinget")
        
        if any(term in query_lower for term in ['komité', 'komite', 'utvalg']):
            enhancements.append("komité behandling Stortinget")
        
        if any(term in query_lower for term in ['president', 'møteleder']):
            enhancements.append("Stortingspresident møteledelse")
        
        if any(term in query_lower for term in ['fremmøte', 'fravær']):
            enhancements.append("fremmøte representant Stortinget")
        
        # Combine original query with enhancements
        enhanced_query = query
        if enhancements:
            enhanced_query += " " + " ".join(enhancements)
        
        return enhanced_query
    
    def search_by_section(self, section_ref: str) -> List[Tuple[Dict, float]]:
        """Search specifically by section/paragraph reference"""
        results = []
        
        for i, chunk in enumerate(self.chunks):
            section_numbers = chunk.get('section_numbers', [])
            
            # Check if this chunk contains the requested section
            if any(section_ref in sec for sec in section_numbers):
                results.append((chunk, 1.0))  # Perfect match
            elif section_ref in chunk['text']:
                results.append((chunk, 0.8))  # Text contains reference
        
        return results
    
    def prepare_for_browser(self, output_dir: str = "browser-assets"):
        """Prepare enhanced embeddings and chunks for browser deployment"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Get embeddings from index
        embeddings = np.zeros((self.index.ntotal, self.dimension))
        for i in range(self.index.ntotal):
            embeddings[i] = self.index.reconstruct(i)
        
        # Prepare browser-compatible data
        browser_chunks = []
        for chunk in self.chunks:
            browser_chunk = {
                'text': chunk['text'],
                'page': chunk['page'],
                'chunk_id': chunk['chunk_id'],
                'token_count': chunk['token_count'],
                'chunk_type': chunk.get('chunk_type', 'regular'),
                'keywords': chunk.get('keywords', []),
                'section_numbers': chunk.get('section_numbers', []),
                'importance_score': chunk.get('importance_score', 1.0)
            }
            browser_chunks.append(browser_chunk)
        
        browser_data = {
            'embeddings': embeddings.tolist(),
            'chunks': browser_chunks,
            'dimension': self.dimension,
            'metadata': {
                'total_chunks': len(browser_chunks),
                'chunk_types': list(set(chunk.get('chunk_type', 'regular') for chunk in browser_chunks)),
                'processing_date': __import__('datetime').datetime.now().isoformat()
            }
        }
        
        with open(f"{output_dir}/embeddings_and_chunks.json", 'w', encoding='utf-8') as f:
            json.dump(browser_data, f, ensure_ascii=False, indent=2)
        
        print(f"Enhanced browser assets saved to {output_dir}/")
        print(f"File size: {os.path.getsize(f'{output_dir}/embeddings_and_chunks.json') / 1024 / 1024:.2f} MB")

def main():
    # Load chunks from improved processing
    chunks_file = 'improved_chunks.json'
    if not __import__('os').path.exists(chunks_file):
        print(f"Please run improved_process_pdf.py first to create {chunks_file}")
        return
    
    with open(chunks_file, 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    print(f"Loaded {len(chunks)} enhanced chunks")
    
    # Initialize improved RAG processor
    rag = ImprovedRAGProcessor()
    rag.chunks = chunks
    
    # Create embeddings
    print("Creating enhanced embeddings...")
    embeddings = rag.create_embeddings(chunks)
    
    # Build search index
    print("Building search index...")
    rag.build_index(embeddings)
    
    # Test searches
    test_queries = [
        "§ 35",
        "votering og avstemming",
        "komité behandling",
        "Stortingspresident",
        "fremmøte representanter"
    ]
    
    print("\nTesting enhanced search:")
    for query in test_queries:
        print(f"\n--- Query: '{query}' ---")
        results = rag.enhanced_search(query, top_k=3)
        
        for i, (chunk, score) in enumerate(results, 1):
            print(f"{i}. Score: {score:.3f}, Page: {chunk['page']}, Type: {chunk.get('chunk_type', 'unknown')}")
            print(f"   Keywords: {chunk.get('keywords', [])}")
            print(f"   Sections: {chunk.get('section_numbers', [])}")
            print(f"   Text: {chunk['text'][:100]}...")
    
    # Prepare browser assets
    print("\nPreparing enhanced browser assets...")
    rag.prepare_for_browser()
    
    # Save processor
    with open('improved_rag_processor.pkl', 'wb') as f:
        pickle.dump(rag, f)
    
    print("Enhanced RAG processor saved!")

if __name__ == "__main__":
    main()