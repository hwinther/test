import PyPDF2
import re
import json
from typing import List, Dict, Tuple
import tiktoken

class ImprovedPDFProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
    def extract_text_with_structure(self) -> List[Dict]:
        """Extract text preserving document structure for legal documents"""
        text_chunks = []
        
        with open(self.pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    # Clean text while preserving structure
                    cleaned_text = self.clean_text_preserve_structure(text)
                    
                    # Split by paragraphs first, then by size if needed
                    chunks = self.smart_chunk_split(cleaned_text, page_num)
                    
                    text_chunks.extend(chunks)
        
        return text_chunks
    
    def clean_text_preserve_structure(self, text: str) -> str:
        """Clean text while preserving paragraph structure and Norwegian characters"""
        # Preserve Norwegian characters: æ, ø, å, Æ, Ø, Å
        # Remove excessive whitespace but preserve paragraph breaks
        text = re.sub(r'[ \t]+', ' ', text)  # Multiple spaces/tabs to single space
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Preserve double newlines (paragraph breaks)
        
        # Clean up but preserve legal document structure
        # Keep section numbers, paragraph numbers, etc.
        text = re.sub(r'[^\w\s\.,!?;:\-\(\)\[\]"\'§\n\døåæÆØÅ]', ' ', text)
        
        return text.strip()
    
    def smart_chunk_split(self, text: str, page_num: int) -> List[Dict]:
        """Split text intelligently for legal/procedural documents"""
        chunks = []
        
        # First, try to split by clear paragraph markers
        paragraphs = self.split_by_paragraphs(text)
        
        current_chunk = ""
        current_chunk_start = None
        
        for para_info in paragraphs:
            paragraph = para_info['text']
            para_type = para_info['type']
            
            # Calculate tokens for current chunk + new paragraph
            combined_tokens = len(self.encoding.encode(current_chunk + "\n" + paragraph))
            
            if combined_tokens > 400 and current_chunk:  # Smaller chunks for better precision
                # Save current chunk
                chunks.append(self.create_chunk(
                    current_chunk, 
                    page_num, 
                    len(chunks) + 1,
                    current_chunk_start
                ))
                current_chunk = paragraph
                current_chunk_start = para_type
            else:
                if current_chunk:
                    current_chunk += "\n" + paragraph
                else:
                    current_chunk = paragraph
                    current_chunk_start = para_type
        
        # Don't forget the last chunk
        if current_chunk:
            chunks.append(self.create_chunk(
                current_chunk, 
                page_num, 
                len(chunks) + 1,
                current_chunk_start
            ))
        
        return chunks
    
    def split_by_paragraphs(self, text: str) -> List[Dict]:
        """Split text by paragraphs, identifying section markers"""
        paragraphs = []
        lines = text.split('\n')
        
        current_paragraph = ""
        for line in lines:
            line = line.strip()
            if not line:
                if current_paragraph:
                    para_type = self.identify_paragraph_type(current_paragraph)
                    paragraphs.append({
                        'text': current_paragraph,
                        'type': para_type
                    })
                    current_paragraph = ""
                continue
            
            if current_paragraph:
                current_paragraph += " " + line
            else:
                current_paragraph = line
        
        # Don't forget the last paragraph
        if current_paragraph:
            para_type = self.identify_paragraph_type(current_paragraph)
            paragraphs.append({
                'text': current_paragraph,
                'type': para_type
            })
        
        return paragraphs
    
    def identify_paragraph_type(self, paragraph: str) -> str:
        """Identify the type of paragraph (section, subsection, regular text, etc.)"""
        paragraph_lower = paragraph.lower()
        
        # Norwegian legal document patterns
        if re.match(r'^§\s*\d+', paragraph):
            return 'section'
        elif re.match(r'^\d+\.\s', paragraph):
            return 'numbered_item'
        elif re.match(r'^[a-e]\.\s', paragraph):  # Lettered sub-items like "a. text"
            return 'lettered_subitem'
        elif re.match(r'^[a-z]\)\s', paragraph):  # Parenthetical items like "a) text"
            return 'lettered_item'
        elif re.match(r'kapittel|avsnitt|del', paragraph_lower):
            return 'chapter_heading'
        elif 'forretningsorden' in paragraph_lower:
            return 'title_reference'
        elif any(word in paragraph_lower for word in ['stortinget', 'presidenten', 'komité', 'votering']):
            return 'procedural'
        else:
            return 'regular'
    
    def create_chunk(self, text: str, page: int, chunk_num: int, chunk_type: str = None) -> Dict:
        """Create a structured chunk with metadata"""
        return {
            'text': text,
            'page': page,
            'chunk_id': f"page_{page}_chunk_{chunk_num}",
            'token_count': len(self.encoding.encode(text)),
            'chunk_type': chunk_type or 'regular',
            'keywords': self.extract_keywords(text)
        }
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important Norwegian keywords for better search"""
        norwegian_keywords = []
        text_lower = text.lower()
        
        # Norwegian parliamentary terms
        terms = [
            'stortinget', 'president', 'komité', 'votering', 'forslag', 
            'innstilling', 'behandling', 'sakgang', 'møte', 'fremmøte',
            'representant', 'parti', 'gruppe', 'opposisjon', 'regjering',
            'debatt', 'spørsmål', 'interpellasjon', 'høring', 'budsjett'
        ]
        
        for term in terms:
            if term in text_lower:
                norwegian_keywords.append(term)
        
        # Extract main section references
        section_refs = re.findall(r'§\s*(\d+)', text)
        norwegian_keywords.extend([f"paragraf_{ref}" for ref in section_refs])
        
        # Extract sub-section references (like "a. text", "b. text" following § number)
        # Look for sections that contain lettered sub-items
        for section_match in re.finditer(r'§\s*(\d+)', text):
            section_num = section_match.group(1)
            # Look for lettered items after this section
            section_start = section_match.end()
            # Find next section or end of text
            next_section = re.search(r'§\s*\d+', text[section_start:])
            if next_section:
                section_text = text[section_start:section_start + next_section.start()]
            else:
                section_text = text[section_start:]
            
            # Find lettered sub-items within this section text
            # More precise patterns to avoid false positives:
            # 1. "^a. " at start of line or after whitespace (standard format)
            # 2. "bokstav a" (Norwegian: letter a)
            pattern1 = re.findall(r'(?:^|\s)([a-e])\.\s+[a-zæøåA-ZÆØÅ]', section_text, re.MULTILINE)
            pattern2 = re.findall(r'bokstav\s+([a-e])', section_text, re.IGNORECASE)
            
            # Combine patterns and remove duplicates
            all_items = pattern1 + pattern2
            unique_items = sorted(set(all_items))
            
            # Only add if we found at least 2 sub-items, they include 'a' and 'b', 
            # and we don't have too many (to avoid false positives)
            if len(unique_items) >= 2 and 'a' in unique_items and 'b' in unique_items and len(unique_items) <= 5:
                for letter in unique_items:
                    norwegian_keywords.append(f"paragraf_{section_num}{letter}")
        
        return norwegian_keywords

def main():
    import sys
    if len(sys.argv) != 2:
        print("Usage: python improved_process_pdf.py <pdf_file>")
        return
    
    pdf_path = sys.argv[1]
    processor = ImprovedPDFProcessor(pdf_path)
    
    print("Extracting text with improved structure preservation...")
    chunks = processor.extract_text_with_structure()
    
    # Save processed chunks
    with open('improved_chunks.json', 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(chunks)} structured chunks from PDF")
    print(f"Average tokens per chunk: {sum(c['token_count'] for c in chunks) / len(chunks):.1f}")
    
    # Show chunk type distribution
    chunk_types = {}
    for chunk in chunks:
        chunk_type = chunk.get('chunk_type', 'unknown')
        chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
    
    print("\nChunk type distribution:")
    for chunk_type, count in chunk_types.items():
        print(f"  {chunk_type}: {count}")
    
    print("\nFirst few chunks preview:")
    for i, chunk in enumerate(chunks[:3]):
        print(f"\nChunk {i+1} (Page {chunk['page']}, Type: {chunk['chunk_type']}):")
        print(f"Keywords: {chunk['keywords']}")
        print(f"Text: {chunk['text'][:150]}...")

if __name__ == "__main__":
    main()