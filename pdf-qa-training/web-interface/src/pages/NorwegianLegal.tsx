import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  metadata?: {
    page?: number;
    chunkType?: string;
    sectionRef?: string;
    keywords?: string[];
    confidence?: number;
  };
}

interface Chunk {
  text: string;
  page: number;
  token_count?: number;
  chunk_type?: string;
  section_ref?: string;
  keywords?: string[];
}

interface EmbeddingsData {
  embeddings: number[][];
  chunks: Chunk[];
  dimension: number;
}

const quickSearches = [
  'Hva er reklamasjon?',
  'Kjøpers rettigheter',
  'Mangel ved varen',
  'Prisavslag',
  'Heving av kjøp',
  'Leveringstid'
];

const NorwegianLegal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hei! Jeg kan svare på spørsmål om norske juridiske dokumenter. Still meg et spørsmål!", sender: 'assistant' }
  ]);
  const [question, setQuestion] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Laster modeller og data...');
  const [isProcessing, setIsProcessing] = useState(false);
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
      setStatus('Laster dokumentdata...');

      const response = await fetch('/embeddings_and_chunks.json');
      const data: EmbeddingsData = await response.json();

      embeddingsRef.current = data.embeddings;
      chunksRef.current = data.chunks;
      dimensionRef.current = data.dimension;

      setStatus('Klar! Still meg spørsmål om dokumentet.');
      setIsReady(true);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('Feil ved lasting av modeller. Sjekk konsollen.');
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

  const generateAnswer = async (query: string, relevantChunks: any[]) => {
    if (relevantChunks.length === 0) {
      return {
        answer: "Jeg fant ikke relevant informasjon i dokumentet for å svare på spørsmålet ditt.",
        metadata: {}
      };
    }

    const bestMatch = relevantChunks[0];
    const chunk = bestMatch.chunk;
    
    let answer = `Basert på informasjon fra side ${chunk.page}: ${chunk.text}`;

    return {
      answer,
      metadata: {
        page: chunk.page,
        chunkType: chunk.chunk_type || 'text',
        sectionRef: chunk.section_ref,
        keywords: chunk.keywords || [],
        confidence: bestMatch.similarity
      }
    };
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !isReady || isProcessing) return;

    setMessages(prev => [...prev, { text: question, sender: 'user' }]);
    setQuestion('');
    setIsProcessing(true);

    setMessages(prev => [...prev, { text: 'Tenker...', sender: 'assistant' }]);

    try {
      const relevantChunks = await findRelevantChunks(question);
      const result = await generateAnswer(question, relevantChunks);

      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: result.answer, sender: 'assistant', metadata: result.metadata }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: 'Beklager, jeg støtte på en feil. Vennligst prøv igjen.', sender: 'assistant' }
      ]);
    }

    setIsProcessing(false);
    inputRef.current?.focus();
  };

  const handleQuickSearch = (search: string) => {
    setQuestion(search);
    setTimeout(() => handleAskQuestion(), 100);
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
        <h1>Enhanced Norwegian Legal Document Q&A</h1>

        <div style={styles.searchTips}>
          <h3>Søketips</h3>
          <p>Dette systemet er optimalisert for norske juridiske dokumenter. Prøv å:</p>
          <ul>
            <li>Søk etter spesifikke paragrafer (f.eks. "§ 27")</li>
            <li>Still spørsmål om rettigheter og plikter</li>
            <li>Bruk norske juridiske termer</li>
          </ul>
        </div>

        <div style={styles.quickSearches}>
          {quickSearches.map((search, idx) => (
            <button
              key={idx}
              style={styles.quickSearchBtn}
              onClick={() => handleQuickSearch(search)}
            >
              {search}
            </button>
          ))}
        </div>

        <div style={styles.status}>{status}</div>

        <div ref={chatContainerRef} style={styles.chatContainer}>
          {messages.map((msg, idx) => (
            <div key={idx} style={msg.sender === 'user' ? styles.userMessage : styles.assistantMessage}>
              <div>{msg.text}</div>
              {msg.metadata && (
                <div style={styles.chunkMetadata}>
                  {msg.metadata.chunkType && (
                    <span style={styles.chunkType}>{msg.metadata.chunkType}</span>
                  )}
                  {msg.metadata.sectionRef && (
                    <span style={styles.sectionRef}>{msg.metadata.sectionRef}</span>
                  )}
                  {msg.metadata.page && (
                    <span>Side {msg.metadata.page}</span>
                  )}
                  {msg.metadata.confidence !== undefined && (
                    <span style={styles.confidenceScore}>
                      {(msg.metadata.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  {msg.metadata.keywords && msg.metadata.keywords.length > 0 && (
                    <div style={styles.keywords}>
                      Nøkkelord: {msg.metadata.keywords.join(', ')}
                    </div>
                  )}
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
            placeholder="Still et spørsmål om dokumentet..."
            disabled={!isReady || isProcessing}
            style={styles.input}
          />
          <button onClick={handleAskQuestion} disabled={!isReady || isProcessing} style={styles.button}>
            Søk
          </button>
        </div>
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
  searchTips: {
    backgroundColor: '#e9ecef',
    borderLeft: '4px solid #007bff',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '4px'
  },
  quickSearches: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px'
  },
  quickSearchBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px'
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
  chunkMetadata: {
    fontSize: '0.8em',
    color: '#666',
    marginTop: '5px',
    borderTop: '1px solid #ddd',
    paddingTop: '5px'
  },
  chunkType: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '0.7em',
    marginRight: '5px'
  },
  sectionRef: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '0.7em',
    marginRight: '3px'
  },
  keywords: {
    color: '#6c757d',
    fontStyle: 'italic'
  },
  confidenceScore: {
    float: 'right',
    backgroundColor: '#ffc107',
    color: '#212529',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '0.7em'
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

export default NorwegianLegal;
