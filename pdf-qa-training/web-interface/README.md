# Web Interface Setup Instructions

## Quick Start

To use the interface with your processed PDF data:

1. Ensure you have processed your PDF and created browser assets:
   ```bash
   python pdf-processing/process_pdf.py your-document.pdf
   python rag-approach/create_embeddings.py
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000 -d web-interface
   ```

3. Open your browser to: `http://localhost:8000/index.html`

## Testing Browser Assets

To verify your browser assets are working correctly:

1. Visit: `http://localhost:8000/test-assets.html`
2. This will show you if the embeddings_and_chunks.json file is loading properly
3. If there are errors, follow the troubleshooting steps shown

## Production Setup (With WebLLM Support)

For full WebLLM integration with real models:

### Option 1: Using Vite (Recommended)

1. Install Node.js dependencies:
   ```bash
   cd web-interface
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`

### Option 2: Using a CDN

Replace the import in index.html with:

```html
<script type="importmap">
{
  "imports": {
    "@mlc-ai/web-llm": "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@latest/dist/index.js"
  }
}
</script>
```

## File Structure

- `index.html` - Basic interface with WebLLM integration
- `advanced.html` - Full-featured interface with document exploration
- `package.json` - Node.js dependencies
- `vite.config.js` - Build configuration
- `browser-assets/` - Generated embeddings and chunks from your PDF

## Using Your Own PDF Data

1. Process your PDF using the Python scripts
2. Ensure `browser-assets/embeddings_and_chunks.json` exists
3. The interface will automatically load your data

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: WebAssembly support required
- Safari: May need polyfills for some features

## Troubleshooting

**Module Resolution Error**: Use the demo.html file or set up Vite
**CORS Errors**: Serve files through a local server, not file:// protocol
**Memory Issues**: Use smaller models or reduce chunk count