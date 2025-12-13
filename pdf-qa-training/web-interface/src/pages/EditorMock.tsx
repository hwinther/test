import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Navigation from '../components/Navigation';
import { Chatbot } from '../components/chatbot/Chatbot';

interface DocumentContent {
  background: {
    html: string;
    text: string;
  };
  lawText: {
    html: string;
    text: string;
  };
  timestamp: string;
}

interface EditorStats {
  backgroundWords: number;
  backgroundChars: number;
  lawWords: number;
  lawChars: number;
  totalWords: number;
  totalChars: number;
  lastModified: string;
}

const EditorMock: React.FC = () => {
  // Sample content
  const sampleBackground = `<h2>Background: Norwegian Consumer Purchase Act</h2>
<p>The <strong>Norwegian Consumer Purchase Act</strong> (Forbrukerkjøpsloven) regulates the sale of goods between sellers and consumers in Norway. This law aims to protect consumer rights and ensure fair treatment in commercial transactions.</p>
<p><em>Key aspects covered include:</em></p>
<ul>
    <li>Defects in goods and remedies available to consumers</li>
    <li>Delivery obligations and timeframes</li>
    <li>Warranty periods and seller responsibilities</li>
    <li>Right to cancel and return goods</li>
</ul>
<p>The act establishes minimum standards that cannot be waived to the detriment of consumers.</p>`;

  const sampleLawText = `<h2>§ 27. Avhjelp</h2>
<p>Kjøperen kan fastholde kjøpet og kreve avhjelp av mangelen. Selgeren kan motsette seg avhjelp dersom det ville medføre urimelig kostnad eller ulempe.</p>
<p><strong>Avhjelp skal foretas innen rimelig tid.</strong> Retting anses ikke som forsvarlig gjennomført før mangelen er utbedret uten vesentlig ulempe for kjøperen.</p>

<h2>§ 28. Omlevering</h2>
<p>Kjøperen kan kreve omlevering dersom mangelen ikke er uvesentlig. Omlevering kan ikke kreves dersom det foreligger en hindring som selgeren ikke kan overvinne, eller dersom omlevering vil medføre urimelig kostnad for selgeren.</p>

<h2>§ 29. Prisavslag</h2>
<p>Kjøperen kan kreve et passende prisavslag dersom:</p>
<ol>
    <li>Avhjelp eller omlevering ikke er gjennomført innen rimelig tid</li>
    <li>Selgeren ikke har gjennomført avhjelp eller omlevering forsvarlig</li>
    <li>Varen fortsatt har mangelen</li>
</ol>
<p>Prisavslaget skal stå i samme forhold som verdien av varen i mangelfull stand har til verdien den ville ha hatt ved avtaletiden uten mangelen.</p>`;

  // State
  const [backgroundContent, setBackgroundContent] = useState<string>(sampleBackground);
  const [lawTextContent, setLawTextContent] = useState<string>(sampleLawText);
  const [stats, setStats] = useState<EditorStats>({
    backgroundWords: 0,
    backgroundChars: 0,
    lawWords: 0,
    lawChars: 0,
    totalWords: 0,
    totalChars: 0,
    lastModified: '--'
  });
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [savedContent, setSavedContent] = useState<DocumentContent | null>(null);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'blockquote'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'indent',
    'color', 'background',
    'align',
    'link', 'blockquote'
  ];

  // Helper function to count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Helper function to strip HTML and get plain text
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Update statistics
  const updateStats = (backgroundHtml: string, lawHtml: string) => {
    const backgroundText = stripHtml(backgroundHtml);
    const lawText = stripHtml(lawHtml);

    const backgroundWords = countWords(backgroundText);
    const backgroundChars = backgroundText.length;
    const lawWords = countWords(lawText);
    const lawChars = lawText.length;

    const now = new Date();
    setStats({
      backgroundWords,
      backgroundChars,
      lawWords,
      lawChars,
      totalWords: backgroundWords + lawWords,
      totalChars: backgroundChars + lawChars,
      lastModified: now.toLocaleTimeString()
    });
  };

  // Effect to update stats when content changes
  useEffect(() => {
    updateStats(backgroundContent, lawTextContent);
  }, [backgroundContent, lawTextContent]);

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem('legalDocuments');
    if (saved) {
      try {
        const content: DocumentContent = JSON.parse(saved);
        setSavedContent(content);
        setShowLoadPrompt(true);
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  const handleLoadSaved = () => {
    if (savedContent) {
      setBackgroundContent(savedContent.background.html);
      setLawTextContent(savedContent.lawText.html);
    }
    setShowLoadPrompt(false);
  };

  const handleDismissPrompt = () => {
    setShowLoadPrompt(false);
  };

  // Action handlers
  const saveContent = () => {
    const content: DocumentContent = {
      background: {
        html: backgroundContent,
        text: stripHtml(backgroundContent)
      },
      lawText: {
        html: lawTextContent,
        text: stripHtml(lawTextContent)
      },
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('legalDocuments', JSON.stringify(content));
    alert('✅ Content saved successfully to browser storage!');
    console.log('Saved content:', content);
  };

  const exportToJSON = () => {
    const content = {
      background: {
        html: backgroundContent,
        text: stripHtml(backgroundContent)
      },
      lawText: {
        html: lawTextContent,
        text: stripHtml(lawTextContent)
      },
      metadata: {
        exportDate: new Date().toISOString(),
        totalWords: stats.totalWords,
        totalCharacters: stats.totalChars
      }
    };

    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-documents-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    alert('📄 Content exported as JSON file!');
  };

  const analyzeContent = () => {
    const backgroundText = stripHtml(backgroundContent);
    const lawText = stripHtml(lawTextContent);

    const lawSections = (lawText.match(/§\s*\d+/g) || []).length;
    const backgroundParagraphs = (backgroundContent.match(/<p>/g) || []).length;
    const lawParagraphs = (lawTextContent.match(/<p>/g) || []).length;

    const analysis = `
📊 Document Analysis:

Background Chapter:
  • ${stats.backgroundWords} words
  • ${backgroundParagraphs} paragraphs
  
Law Text:
  • ${stats.lawWords} words
  • ${lawParagraphs} paragraphs
  • ${lawSections} legal sections (§)
  
Overall:
  • Total content: ${stats.totalWords} words
  • Estimated reading time: ${Math.ceil(stats.totalWords / 200)} minutes
    `;

    alert(analysis);
    console.log('Analysis:', {
      backgroundWords: stats.backgroundWords,
      lawWords: stats.lawWords,
      lawSections,
      backgroundParagraphs,
      lawParagraphs
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f5f5', position: 'relative' }}>
      <Navigation />

      {/* Load Saved Content Prompt */}
      {showLoadPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0 }}>📂 Lagret innhold funnet</h2>
            <p>Vil du laste inn tidligere lagret innhold?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={handleLoadSaved}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Ja, last inn
              </button>
              <button
                onClick={handleDismissPrompt}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Nei, start på nytt
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#333', marginTop: 0 }}>📝 Juridisk Dokumentredigerer</h1>

        <div style={{ background: '#d1ecf1', borderLeft: '4px solid #0c5460', padding: '15px', marginBottom: '25px', borderRadius: '4px', color: '#0c5460' }}>
          <strong>Mock redigeringsgrensesnitt:</strong> Denne siden demonstrerer et dobbelt redigeringsgrensesnitt for arbeid med juridiske dokumenter.
          Rediger bakgrunnskapittelkonteksten og lovteksten ved å bruke tekstbehandlerne nedenfor.
        </div>

        {/* Background Chapter Editor */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, color: '#495057', fontSize: '1.2em' }}>📖 Bakgrunnskapittel</h2>
            <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
              <span>{stats.backgroundWords} ord</span> •
              <span> {stats.backgroundChars} tegn</span>
            </div>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <ReactQuill
              theme="snow"
              value={backgroundContent}
              onChange={setBackgroundContent}
              modules={modules}
              formats={formats}
              placeholder="Skriv inn bakgrunnskapittelinformasjon, kontekst og relevante detaljer her..."
              style={{ minHeight: '250px' }}
            />
          </div>
        </div>

        {/* Law Text Editor */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, color: '#495057', fontSize: '1.2em' }}>⚖️ Lovtekst</h2>
            <div style={{ fontSize: '0.9em', color: '#6c757d' }}>
              <span>{stats.lawWords} ord</span> •
              <span> {stats.lawChars} tegn</span>
            </div>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <ReactQuill
              theme="snow"
              value={lawTextContent}
              onChange={setLawTextContent}
              modules={modules}
              formats={formats}
              placeholder="Skriv inn lovtekst, juridiske bestemmelser, artikler og paragrafer her..."
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div style={{ display: 'flex', gap: '30px', marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85em', color: '#6c757d', marginBottom: '4px' }}>Totalt ord</span>
            <span style={{ fontSize: '1.1em', fontWeight: 600, color: '#333' }}>{stats.totalWords}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85em', color: '#6c757d', marginBottom: '4px' }}>Totalt tegn</span>
            <span style={{ fontSize: '1.1em', fontWeight: 600, color: '#333' }}>{stats.totalChars}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85em', color: '#6c757d', marginBottom: '4px' }}>Sist endret</span>
            <span style={{ fontSize: '1.1em', fontWeight: 600, color: '#333' }}>{stats.lastModified}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
          <button onClick={saveContent} style={buttonStyle('#007bff', '#0056b3')}>
            💾 Lagre innhold
          </button>
          <button onClick={exportToJSON} style={buttonStyle('#6c757d', '#545b62')}>
            📄 Eksporter som JSON
          </button>
          <button onClick={analyzeContent} style={buttonStyle('#28a745', '#218838')}>
            🔍 Analyser dokumenter
          </button>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot 
        backgroundContent={backgroundContent}
        lawTextContent={lawTextContent}
        onUpdateBackground={setBackgroundContent}
        onUpdateLawText={setLawTextContent}
      />
    </div>
  );
};

// Helper styles
const navLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '15px 20px',
  color: '#fff',
  textDecoration: 'none',
  transition: 'background-color 0.3s'
};

const buttonStyle = (bgColor: string, hoverColor: string): React.CSSProperties => ({
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 500,
  transition: 'all 0.3s',
  backgroundColor: bgColor,
  color: 'white'
});

export default EditorMock;
