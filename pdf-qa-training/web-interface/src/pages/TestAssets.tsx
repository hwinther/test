import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface Chunk {
  text: string;
  page: number;
  token_count?: number;
}

interface EmbeddingsData {
  embeddings: number[][];
  chunks: Chunk[];
  dimension: number;
}

type StatusType = 'info' | 'success' | 'error';

const TestAssets: React.FC = () => {
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: 'info',
    message: 'Loading browser assets...'
  });
  const [data, setData] = useState<EmbeddingsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testBrowserAssets();
  }, []);

  const testBrowserAssets = async () => {
    try {
      setStatus({ type: 'info', message: 'Fetching browser assets...' });

      const response = await fetch('/embeddings_and_chunks.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData: EmbeddingsData = await response.json();

      // Validate data structure
      if (!jsonData.embeddings || !jsonData.chunks || !jsonData.dimension) {
        throw new Error('Invalid data structure - missing required fields');
      }

      setStatus({ type: 'success', message: '✅ Browser assets loaded successfully!' });
      setData(jsonData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setStatus({ type: 'error', message: `❌ Error loading browser assets: ${errorMessage}` });
      setError(errorMessage);
      setData(null);
    }
  };

  const getStatusStyle = (type: StatusType): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'info':
      default:
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
    }
  };

  const calculateAverageTokens = (chunks: Chunk[]): number => {
    const total = chunks.reduce((sum, c) => sum + (c.token_count || 0), 0);
    return Math.round(total / chunks.length);
  };

  const getMaxPage = (chunks: Chunk[]): number => {
    return Math.max(...chunks.map(c => c.page));
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Navigation />

      <h1>Browser Assets Test</h1>
      <div style={getStatusStyle(status.type)}>
        {status.message}
      </div>

      {data && (
        <div>
          <h2>Data Summary</h2>
          <ul>
            <li><strong>Total Chunks:</strong> {data.chunks.length}</li>
            <li><strong>Embedding Dimension:</strong> {data.dimension}</li>
            <li><strong>Total Pages:</strong> {getMaxPage(data.chunks)}</li>
            <li><strong>Average Tokens per Chunk:</strong> {calculateAverageTokens(data.chunks)}</li>
          </ul>

          <h2>Sample Chunks</h2>
          {data.chunks.slice(0, 3).map((chunk, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px'
              }}
            >
              <strong>Chunk {i + 1} (Page {chunk.page}):</strong>
              <br />
              {chunk.text.substring(0, 200)}
              {chunk.text.length > 200 ? '...' : ''}
            </div>
          ))}

          <h2>Raw Data Preview (First 500 characters)</h2>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '5px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(data, null, 2).substring(0, 500)}...
          </pre>
        </div>
      )}

      {error && (
        <div>
          <h2>Troubleshooting</h2>
          <p>The browser assets could not be loaded. This could be due to:</p>
          <ul>
            <li>The embeddings_and_chunks.json file doesn't exist in the public folder</li>
            <li>The PDF processing steps haven't been completed yet</li>
            <li>CORS issues (make sure you're serving via HTTP, not file://)</li>
          </ul>

          <h3>Next Steps:</h3>
          <ol>
            <li>
              Ensure you've processed your PDF:
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '5px',
                overflowX: 'auto'
              }}>
                python pdf-processing/process_pdf.py your-document.pdf
              </pre>
            </li>
            <li>
              Create embeddings:
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '5px',
                overflowX: 'auto'
              }}>
                python rag-approach/create_embeddings.py
              </pre>
            </li>
            <li>Verify the public folder contains embeddings_and_chunks.json</li>
            <li>Make sure you're serving via Vite dev server (npm run dev)</li>
          </ol>
        </div>
      )}
    </div>
  );
};

const navLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '15px 20px',
  color: '#fff',
  textDecoration: 'none',
  transition: 'background-color 0.3s'
};

export default TestAssets;
