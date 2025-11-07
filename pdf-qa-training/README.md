# PDF Q&A Model Training

This project demonstrates multiple approaches to create a Q&A system from a PDF document that can run in the browser.

## Approaches

### 1. RAG (Retrieval-Augmented Generation) - Recommended
- Extract text from PDF with page references
- Create embeddings for text chunks
- Use vector search for relevant context
- Combine with a small pre-trained model

### 2. Fine-tuning Small Models
- Fine-tune models like TinyLlama, Phi-2, or similar
- Convert to WebLLM format for browser deployment

### 3. Hybrid Approach
- Combine embeddings-based retrieval with fine-tuned model

## Browser Compatibility
- Uses @mlc-ai/web-llm for in-browser inference
- WebAssembly for vector operations
- IndexedDB for storing embeddings and text chunks

## Setup

1. Install dependencies: `npm install`
2. Process your PDF: `python process_pdf.py your-document.pdf`
3. Train/prepare model: Choose approach in respective folders
4. Deploy: `npm run build`

## File Structure

- `pdf-processing/` - PDF text extraction and chunking
- `rag-approach/` - Vector embeddings and retrieval
- `fine-tuning/` - Model fine-tuning scripts
- `web-interface/` - Browser-based Q&A interface
- `models/` - Processed models and embeddings