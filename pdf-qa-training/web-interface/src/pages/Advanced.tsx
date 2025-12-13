import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  pageRefs?: number[];
  confidence?: number;
}

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

type TabType = 'chat' | 'explore' | 'settings';

const Advanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm ready to answer questions about your PDF document. Ask me anything!", sender: 'assistant' }
  ]);
  const [question, setQuestion] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Loading models and data...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentStats, setDocumentStats] = useState<any>(null);
  const [topK, setTopK] = useState(3);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const embeddingsRef = useRef<number[][] | null>(null);
  const chunksRef = useRef<Chunk[] | null>(null);
  const dimensionRef = useRef<number | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initialize = async () => {
    try {
      setStatus('Loading document data...');

      const response = await fetch('/embeddings_and_chunks.json');
      const data: EmbeddingsData = await response.json();

      embeddingsRef.current = data.embeddings;
      chunksRef.current = data.chunks;
      dimensionRef.current = data.dimension;

      const stats = {
        totalChunks: data.chunks.length,
        dimension: data.dimension,
        totalPages: Math.max(...data.chunks.map(c => c.page)),
        avgTokens: Math.round(data.chunks.reduce((sum, c) => sum + (c.token_count || 0), 0) / data.chunks.length)
      };
      setDocumentStats(stats);

      setStatus('Ready! Ask me questions about your document.');
      setIsReady(true);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('Error loading models. Please check the console.');
    }
  };

  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  const createQueryEmbedding = async (query: string): Promise<number[]> => {
    const words = query.toLowerCase().split(/\s+/);
    const embedding = new Array(dimensionRef.current || 0).fill(0);

    for (let i = 0; i < words.length && i < embedding.length; i++) {
      embedding[i] = words[i].charCodeAt(0) / 255;
    }

    return embedding;
  };

  const findRelevantChunks = async (query: string) => {
    const queryEmbedding = await createQueryEmbedding(query);

    const similarities = embeddingsRef.current!.map((embedding, index) => ({
      index,
      similarity: cosineSimilarity(queryEmbedding, embedding),
      chunk: chunksRef.current![index]
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  };

  const generateAnswer = async (query: string, relevantChunks: any[]) => {
    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find relevant information in the document to answer your question.",
        pageReferences: [],
        confidence: 0
      };
    }

    const pages = [...new Set(relevantChunks.map(item => item.chunk.page))];
    const bestMatch = relevantChunks[0].chunk;
    const answer = `Based on the content from page(s) ${pages.join(', ')}: ${bestMatch.text}. The most relevant information can be found on page(s) ${pages.join(', ')}.`;

    return {
      answer,
      pageReferences: pages,
      confidence: relevantChunks[0]?.similarity || 0
    };
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !isReady || isProcessing) return;

    setMessages(prev => [...prev, { text: question, sender: 'user' }]);
    setQuestion('');
    setIsProcessing(true);

    setMessages(prev => [...prev, { text: 'Thinking...', sender: 'assistant' }]);

    try {
      const relevantChunks = await findRelevantChunks(question);
      const result = await generateAnswer(question, relevantChunks);

      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: result.answer, sender: 'assistant', pageRefs: result.pageReferences, confidence: result.confidence }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: 'Sorry, I encountered an error. Please try again.', sender: 'assistant' }
      ]);
    }

    setIsProcessing(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAskQuestion();
    }
  };

  return (
    <div style={styles.body}>
      <Navigation />

      <div style={styles.container}>
        <h1>Advanced PDF Q&A Assistant</h1>

        <div style={styles.tabs}>
          <div
            style={activeTab === 'chat' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </div>
          <div
            style={activeTab === 'explore' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('explore')}
          >
            Explore Document
          </div>
          <div
            style={activeTab === 'settings' ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </div>
        </div>

        {activeTab === 'chat' && (
          <div>
            <div style={styles.status}>{status}</div>

            <div ref={chatContainerRef} style={styles.chatContainer}>
              {messages.map((msg, idx) => (
                <div key={idx} style={msg.sender === 'user' ? styles.userMessage : styles.assistantMessage}>
                  <div>{msg.text}</div>
                  {msg.pageRefs && msg.pageRefs.length > 0 && (
                    <div style={styles.pageReference}>
                      References: Page(s) {msg.pageRefs.join(', ')}
                    </div>
                  )}
                  {msg.confidence !== undefined && (
                    <div style={styles.confidenceScore}>
                      Confidence: {(msg.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.inputContainer}>
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the document..."
                disabled={!isReady || isProcessing}
                style={styles.input}
              />
              <button onClick={handleAskQuestion} disabled={!isReady || isProcessing} style={styles.button}>
                Ask
              </button>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div>
            <div style={styles.documentInfo}>
              <h3>Document Overview</h3>
              {documentStats ? (
                <div>
                  <p><strong>Total Chunks:</strong> {documentStats.totalChunks}</p>
                  <p><strong>Embedding Dimension:</strong> {documentStats.dimension}</p>
                  <p><strong>Total Pages:</strong> {documentStats.totalPages}</p>
                  <p><strong>Average Tokens per Chunk:</strong> {documentStats.avgTokens}</p>
                </div>
              ) : (
                <p>Loading document information...</p>
              )}
            </div>

            {chunksRef.current && (
              <div>
                <h3>Sample Chunks</h3>
                {chunksRef.current.slice(0, 5).map((chunk, idx) => (
                  <div key={idx} style={styles.chunkPreview}>
                    <span style={styles.pageBadge}>Page {chunk.page}</span>
                    {chunk.text.substring(0, 200)}{chunk.text.length > 200 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={styles.documentInfo}>
            <h3>Settings</h3>
            <div style={{ marginBottom: '20px' }}>
              <label>
                <strong>Number of chunks to retrieve (Top-K):</strong>
                <input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value) || 3)}
                  min="1"
                  max="10"
                  style={{ ...styles.input, marginLeft: '10px', width: '80px' }}
                />
              </label>
            </div>
            <p style={{ color: '#6c757d' }}>
              Adjusting Top-K affects how many document chunks are used to generate answers.
              Higher values may provide more context but could be less focused.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5'
  },
  navMenu: {
    background: '#343a40',
    padding: 0,
    margin: '-20px -20px 20px -20px',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden'
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap'
  },
  navLink: {
    display: 'block',
    padding: '15px 20px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'background-color 0.3s'
  },
  container: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px'
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    borderBottomColor: '#007bff',
    color: '#007bff'
  },
  status: {
    textAlign: 'center',
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#d1ecf1',
    borderRadius: '5px'
  },
  chatContainer: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    height: '400px',
    overflowY: 'auto',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#fafafa'
  },
  userMessage: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    marginLeft: '20%'
  },
  assistantMessage: {
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#e9ecef',
    color: '#333',
    marginRight: '20%'
  },
  pageReference: {
    fontSize: '0.8em',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '5px'
  },
  confidenceScore: {
    fontSize: '0.8em',
    color: '#666',
    marginTop: '5px'
  },
  inputContainer: {
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  documentInfo: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  chunkPreview: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
    margin: '5px 0',
    fontSize: '0.9em'
  },
  pageBadge: {
    background: '#007bff',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8em',
    marginRight: '10px'
  }
};

export default Advanced;
