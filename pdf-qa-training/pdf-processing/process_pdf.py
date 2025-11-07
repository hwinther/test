import PyPDF2
import re
import json
from typing import List, Dict, Tuple
import tiktoken

class PDFProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
    def extract_text_with_pages(self) -> List[Dict]:
        """Extract text from PDF with page references"""
        text_chunks = []
        
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    # Clean text
                    cleaned_text = self.clean_text(text)
                    
                    # Split into chunks if page is very long
                    chunks = self.split_into_chunks(cleaned_text, max_tokens=512)
                    
                    for i, chunk in enumerate(chunks):
                        text_chunks.append({
                            'text': chunk,
                            'page': page_num,
                            'chunk_id': f"page_{page_num}_chunk_{i+1}",
                            'token_count': len(self.encoding.encode(chunk))
                        })
        
        return text_chunks
    
    def clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters that might interfere
        text = re.sub(r'[^\w\s\.,!?;:\-\(\)\[\]"\']', ' ', text)
        return text.strip()
    
    def split_into_chunks(self, text: str, max_tokens: int = 512) -> List[str]:
        """Split text into chunks with overlap"""
        tokens = self.encoding.encode(text)
        
        if len(tokens) <= max_tokens:
            return [text]
        
        chunks = []
        overlap = max_tokens // 4  # 25% overlap
        
        for i in range(0, len(tokens), max_tokens - overlap):
            chunk_tokens = tokens[i:i + max_tokens]
            chunk_text = self.encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
        
        return chunks
    
    def create_training_data(self, chunks: List[Dict]) -> List[Dict]:
        """Create Q&A pairs for training (you'll need to manually create these)"""
        training_data = []
        
        # This is a template - you'll need to create actual Q&A pairs
        for chunk in chunks:
            # Example format for fine-tuning
            training_example = {
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are a helpful assistant that answers questions based on the provided document. When referencing information, always mention the page number. This content is from page {chunk['page']}."
                    },
                    {
                        "role": "user", 
                        "content": f"Based on this text: '{chunk['text'][:200]}...', generate a relevant question."
                    },
                    {
                        "role": "assistant",
                        "content": f"[Generated answer referencing page {chunk['page']}]"
                    }
                ]
            }
            training_data.append(training_example)
        
        return training_data

def main():
    import sys
    if len(sys.argv) != 2:
        print("Usage: python process_pdf.py <pdf_file>")
        return
    
    pdf_path = sys.argv[1]
    processor = PDFProcessor(pdf_path)
    
    print("Extracting text from PDF...")
    chunks = processor.extract_text_with_pages()
    
    # Save processed chunks
    with open('processed_chunks.json', 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(chunks)} chunks from {len(set(c['page'] for c in chunks))} pages")
    print(f"Average tokens per chunk: {sum(c['token_count'] for c in chunks) / len(chunks):.1f}")
    
    # Save training data template
    training_data = processor.create_training_data(chunks)
    with open('training_data_template.json', 'w', encoding='utf-8') as f:
        json.dump(training_data[50:60], f, indent=2, ensure_ascii=False)  # Save 10 as examples
    
    print("Files saved:")
    print("- processed_chunks.json: Text chunks with page references")
    print("- training_data_template.json: Template for training data (needs manual Q&A creation)")

if __name__ == "__main__":
    main()