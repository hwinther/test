# Step-by-step guide to create your PDF Q&A system

## Prerequisites

1. Python 3.8+ installed
2. Node.js (for web interface dependencies)
3. Your PDF document (around 200 pages)

## Setup

### Windows (PowerShell)
```powershell
# Clone or download this project
cd pdf-qa-training

# Run setup script (creates venv and installs dependencies)
.\setup.ps1

# Or manually:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Install Node.js dependencies (for web interface)
npm install
```

### Unix/Linux/Mac
```bash
# Clone or download this project
cd pdf-qa-training

# Run setup script (creates venv and installs dependencies)
./setup.sh

# Or manually:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Node.js dependencies (for web interface)
npm install
```

## Step 1: Process Your PDF

```bash
python pdf-processing/process_pdf.py your-document.pdf
```

This will create:
- `processed_chunks.json`: Text chunks with page references
- `training_data_template.json`: Template for Q&A pairs

## Step 2: Choose Your Approach

### Option A: RAG Approach (Recommended for Browser)

This approach uses pre-computed embeddings and doesn't require training:

```bash
cd rag-approach
python create_embeddings.py
```

This creates browser-ready embeddings that work with lightweight models.

### Option B: Fine-tuning Approach

For a custom trained model:

1. First, create Q&A pairs based on your PDF:
```bash
cd fine-tuning
# Edit qa_pairs.json with real questions and answers from your PDF
python train_small_model.py
```

2. Convert the model for browser deployment (requires additional tools).

## Step 3: Deploy in Browser

```bash
# Serve the web interface
npm run serve
# or
python -m http.server 8000 -d web-interface
```

Visit `http://localhost:8000`

## Models Suitable for Browser

### Small Language Models (1B parameters or less):
- **TinyLlama-1.1B**: Good balance of size and capability
- **DistilGPT-2**: ~82M parameters, very lightweight
- **Phi-2**: ~2.7B parameters (might be too large for some browsers)

### Embedding Models:
- **all-MiniLM-L6-v2**: 22.7M parameters, excellent for embeddings
- **all-distilroberta-v1**: Smaller alternative

## Browser Deployment Considerations

1. **Model Size**: Keep total model size under 500MB for reasonable loading times
2. **Memory Usage**: Modern browsers can handle 1-2GB models with WebAssembly
3. **Quantization**: Use int8 or int4 quantization to reduce size
4. **Progressive Loading**: Load models in chunks for better UX

## Recommended Architecture

For a 200-page PDF, I recommend the **RAG approach**:

1. **Preprocessing**: Extract text, create chunks with page references
2. **Embeddings**: Use lightweight sentence transformers
3. **Retrieval**: FAISS or simple cosine similarity in browser
4. **Generation**: Use a small pre-trained model like DistilGPT-2 or TinyLlama
5. **Response**: Combine retrieved context with generated text + page references

## File Structure After Setup

```
pdf-qa-training/
├── pdf-processing/
│   ├── processed_chunks.json          # Your PDF text chunks
│   └── training_data_template.json    # Q&A template
├── rag-approach/
│   ├── browser-assets/
│   │   └── embeddings_and_chunks.json # Browser-ready data
│   └── rag_processor.pkl              # Trained processor
├── fine-tuning/
│   ├── qa_pairs.json                  # Your Q&A pairs
│   ├── fine-tuned-model/              # Trained model
│   └── webllm-ready-model/            # Browser-ready model
└── web-interface/
    └── index.html                     # Web app
```

## Performance Tips

1. **Chunk Optimization**: Use 256-512 tokens per chunk with 25% overlap
2. **Embedding Caching**: Pre-compute all embeddings, store in IndexedDB
3. **Lazy Loading**: Load model components as needed
4. **Service Workers**: Cache models for offline use
5. **WebAssembly**: Use WASM for vector operations

## Next Steps

1. Process your PDF with the provided scripts
2. Choose between RAG or fine-tuning approach
3. Test the web interface with your data
4. Optimize model size and performance for your specific use case
5. Consider adding features like:
   - Exact page/paragraph citations
   - Confidence scores
   - Multiple document support
   - Export capabilities