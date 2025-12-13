import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  pageRefs?: number[];
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

interface QAResult {
  answer: string;
  pageReferences: number[];
  confidence?: number;
}

const Index: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm ready to answer questions about your PDF document. Ask me anything!", sender: 'assistant' }
  ]);
  const [question, setQuestion] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'loading' | 'ready' | 'error' }>({
    message: 'Loading models and data...',
    type: 'loading'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Assistant data
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
      setStatus({ message: 'Loading document data...', type: 'loading' });

      const response = await fetch('/embeddings_and_chunks.json');
      const data: EmbeddingsData = await response.json();

      embeddingsRef.current = data.embeddings;
      chunksRef.current = data.chunks;
      dimensionRef.current = data.dimension;

      setStatus({ message: 'Ready! Ask me questions about your document.', type: 'ready' });
      setIsReady(true);

      inputRef.current?.focus();
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus({ message: 'Error loading models. Please check the console.', type: 'error' });
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

  const findRelevantChunks = async (query: string, topK = 3) => {
    const queryEmbedding = await createQueryEmbedding(query);

    const similarities = embeddingsRef.current!.map((embedding, index) => ({
      index,
      similarity: cosineSimilarity(queryEmbedding, embedding),
      chunk: chunksRef.current![index]
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  };

  const generateAnswer = async (query: string, relevantChunks: any[]): Promise<QAResult> => {
    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find relevant information in the document to answer your question.",
        pageReferences: [],
        confidence: 0
      };
    }

    const pages = [...new Set(relevantChunks.map(item => item.chunk.page))];
    const pageRefs = pages.join(', ');
    const bestMatch = relevantChunks[0].chunk;
    
    let answer = `Based on the content from page(s) ${pageRefs}: ${bestMatch.text}`;

    if (query.toLowerCase().includes('what')) {
      answer += " The document describes several key points.";
    } else if (query.toLowerCase().includes('how')) {
      answer += " The process involves multiple steps.";
    } else if (query.toLowerCase().includes('why')) {
      answer += " This is explained through various factors.";
    }

    answer += ` The most relevant information can be found on page(s) ${pageRefs}.`;

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

    // Add thinking message
    setMessages(prev => [...prev, { text: 'Thinking...', sender: 'assistant' }]);

    try {
      const relevantChunks = await findRelevantChunks(question);
      const result = await generateAnswer(question, relevantChunks);

      // Remove thinking message and add actual response
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: result.answer, sender: 'assistant', pageRefs: result.pageReferences }
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
        <h1>PDF Q&A Assistant</h1>
        <div style={getStatusStyle(status.type)}>
          {status.message}
        </div>

        <div ref={chatContainerRef} style={styles.chatContainer}>
          {messages.map((msg, idx) => (
            <div key={idx} style={msg.sender === 'user' ? styles.userMessage : styles.assistantMessage}>
              <div>{msg.text}</div>
              {msg.pageRefs && msg.pageRefs.length > 0 && (
                <div style={styles.pageReference}>
                  References: Page(s) {msg.pageRefs.join(', ')}
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
          <button
            onClick={handleAskQuestion}
            disabled={!isReady || isProcessing}
            style={styles.button}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

const getStatusStyle = (type: 'loading' | 'ready' | 'error'): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '5px'
  };

  switch (type) {
    case 'ready':
      return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
    case 'error':
      return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
    case 'loading':
    default:
      return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
  }
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
  }
};

export default Index;
