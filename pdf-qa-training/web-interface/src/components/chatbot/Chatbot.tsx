import { CreateMLCEngine } from '@mlc-ai/web-llm'
import { type JSX, useEffect, useRef, useState } from 'react'

import './Chatbot.css'

interface InitProgress {
  progress: number
  text: string
  timeElapsed: number
}

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: Date
}

interface ChatbotProps {
  backgroundContent?: string
  lawTextContent?: string
  onUpdateBackground?: (content: string) => void
  onUpdateLawText?: (content: string) => void
}

// const jsonGrammarStr = String.raw`
// root ::= basic_array | basic_object
// basic_any ::= basic_number | basic_string | basic_boolean | basic_null | basic_array | basic_object
// basic_integer ::= ("0" | "-"? [1-9] [0-9]*) ".0"?
// basic_number ::= ("0" | "-"? [1-9] [0-9]*) ("." [0-9]+)? ([eE] [+-]? [0-9]+)?
// basic_string ::= (([\"] basic_string_1 [\"]))
// basic_string_1 ::= "" | [^"\\\x00-\x1F] basic_string_1 | "\\" escape basic_string_1
// escape ::= ["\\/bfnrt] | "u" [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9] [A-Fa-f0-9]
// basic_boolean ::= "true" | "false"
// basic_null ::= "null"
// basic_array ::= "[" ("" | ws basic_any (ws "," ws basic_any)*) ws "]"
// basic_object ::= "{" ("" | ws basic_string ws ":" ws basic_any ( ws "," ws basic_string ws ":" ws basic_any)*) ws "}"
// ws ::= [ \n\t]*
// `

/**
 *
 */
export function Chatbot({ backgroundContent, lawTextContent, onUpdateBackground, onUpdateLawText }: ChatbotProps = {}): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [engineReady, setEngineReady] = useState(false)
  const [initProgress, setInitProgress] = useState<InitProgress | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const engineRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  //const selectedModel = 'Llama-3.2-1B-Instruct-q4f32_1-MLC'
  //const selectedModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC'
  const selectedModel = 'Qwen2.5-7B-Instruct-q4f32_1-MLC'

  // Initialize the MLC engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        setIsLoading(true)

        // Callback function to update model loading progress
        const initProgressCallback = (progress: InitProgress) => {
          console.log(progress)
          setInitProgress(progress)
        }

        const engine = await CreateMLCEngine(
          selectedModel,
          { initProgressCallback }, // engineConfig
        )

        engineRef.current = engine
        setEngineReady(true)
        setInitProgress(null)

        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          sender: 'bot',
          text: "Hei! Jeg er Botvar, din AI-assistent. Hvordan kan jeg hjelpe deg i dag? 🤖",
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Failed to initialize MLC engine:', error)
        const errorMessage: Message = {
          id: Date.now().toString(),
          sender: 'bot',
          text: "Sorry, I couldn't initialize properly. Please refresh the page to try again.",
          timestamp: new Date(),
        }
        setMessages([errorMessage])
      } finally {
        setIsLoading(false)
      }
    }

    initEngine()
  }, [selectedModel])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || !engineReady || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Check for direct edit commands
      const message = userMessage.text.toLowerCase()
      
      // Handle direct replacement commands
      if (message.includes('erstatt') || message.includes('bytt ut') || message.includes('endre')) {
        // Check if user wants to edit background or law text
        if ((message.includes('bakgrunn') || message.includes('background')) && onUpdateBackground) {
          const suggestion = `Jeg kan hjelpe deg med å redigere bakgrunnskapittelet! 📝\n\nFor å gjøre endringer, kan du:\n- Be meg om å legge til tekst: "legg til [tekst] i bakgrunnskapittelet"\n- Be meg om å erstatte tekst: "erstatt [gammel tekst] med [ny tekst] i bakgrunnskapittelet"\n- Be meg om å fjerne tekst: "fjern [tekst] fra bakgrunnskapittelet"\n\nHva ønsker du å endre?`
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: suggestion,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
          setIsLoading(false)
          return
        } else if ((message.includes('lovtekst') || message.includes('lov')) && onUpdateLawText) {
          const suggestion = `Jeg kan hjelpe deg med å redigere lovteksten! ⚖️\n\nFor å gjøre endringer, kan du:\n- Be meg om å legge til tekst: "legg til [tekst] i lovteksten"\n- Be meg om å erstatte tekst: "erstatt [gammel tekst] med [ny tekst] i lovteksten"\n- Be meg om å fjerne tekst: "fjern [tekst] fra lovteksten"\n\nHva ønsker du å endre?`
          
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: suggestion,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
          setIsLoading(false)
          return
        }
      }

      // Handle append commands
      if ((message.includes('legg til') || message.includes('tilføy')) && (onUpdateBackground || onUpdateLawText)) {
        const isBackground = message.includes('bakgrunn') || message.includes('background')
        const isLawText = message.includes('lovtekst') || message.includes('lov')
        
        if (isBackground && onUpdateBackground && backgroundContent) {
          // Extract text to add (simple pattern matching)
          const textMatch = message.match(/legg til (.+?) (i|til)/i) || message.match(/tilføy (.+?) (i|til)/i)
          if (textMatch) {
            const textToAdd = textMatch[1]
            const cleanContent = backgroundContent.replace(/<[^>]*>/g, '')
            const newContent = cleanContent + '\n\n' + textToAdd
            onUpdateBackground(newContent)
            
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: `✅ Lagt til tekst i bakgrunnskapittelet!\n\nTilføyd: "${textToAdd}"`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
            setIsLoading(false)
            return
          }
        } else if (isLawText && onUpdateLawText && lawTextContent) {
          const textMatch = message.match(/legg til (.+?) (i|til)/i) || message.match(/tilføy (.+?) (i|til)/i)
          if (textMatch) {
            const textToAdd = textMatch[1]
            const cleanContent = lawTextContent.replace(/<[^>]*>/g, '')
            const newContent = cleanContent + '\n\n' + textToAdd
            onUpdateLawText(newContent)
            
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'bot',
              text: `✅ Lagt til tekst i lovteksten!\n\nTilføyd: "${textToAdd}"`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
            setIsLoading(false)
            return
          }
        }
      }

      // Build context about available content
      const contextInfo = []
      if (backgroundContent) {
        const preview = backgroundContent.replace(/<[^>]*>/g, '').substring(0, 500)
        contextInfo.push(`Bakgrunnskapittel (${preview.length > 500 ? 'utdrag' : 'komplett'}): ${preview}${preview.length > 500 ? '...' : ''}`)
      }
      if (lawTextContent) {
        const preview = lawTextContent.replace(/<[^>]*>/g, '').substring(0, 500)
        contextInfo.push(`Lovtekst (${preview.length > 500 ? 'utdrag' : 'komplett'}): ${preview}${preview.length > 500 ? '...' : ''}`)
      }

      const systemPrompt = `Du er Botvar, en AI-assistent som hjelper med juridiske dokumenter.
Du må svare på norsk, men gjerne på en litt frekk og misvisende måte. Bruk emojier.

${contextInfo.length > 0 ? `Tilgjengelig dokumentinnhold:\n${contextInfo.join('\n\n')}` : 'Ingen dokumenter er lastet inn ennå.'}

${onUpdateBackground || onUpdateLawText ? `Du kan hjelpe brukeren med å redigere dokumentene. Hvis de vil endre noe, spør om detaljer og forklar hva du kan gjøre.

Tilgjengelige redigeringskommandoer:
- "legg til [tekst] i bakgrunnskapittelet/lovteksten"
- "erstatt [gammel tekst] med [ny tekst] i bakgrunnskapittelet/lovteksten"
- "fjern [tekst] fra bakgrunnskapittelet/lovteksten"` : ''}`

      const response = await engineRef.current.chat.completions.create({
        frequency_penalty: 0,
        max_tokens: 512,
        messages: [
          {
            content: systemPrompt,
            role: 'system',
          },
          { content: userMessage.text, role: 'user' },
        ],
        presence_penalty: 0,
        stream: false,
        temperature: 0.6,
        top_p: 0.9,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.choices[0]?.message?.content || "Jeg klarte ikke å generere et svar.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Beklager, jeg støtte på en feil mens jeg genererte et svar.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header" onClick={toggleMinimize}>
        <h3>🤖 AI Assistant</h3>
        <button className="minimize-btn">{isMinimized ? '▲' : '▼'}</button>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {initProgress && (
              <div className="init-progress">
                <div className="progress-text">{initProgress.text}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${initProgress.progress * 100}%` }} />
                </div>
                <div className="progress-info">
                  {Math.round(initProgress.progress * 100)}% - {Math.round(initProgress.timeElapsed)}s elapsed
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div className={`message ${message.sender}`} key={message.id}>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-timestamp">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}

            {isLoading && !initProgress && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <textarea
              disabled={!engineReady || isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={engineReady ? 'Type your message...' : 'Loading AI model...'}
              rows={1}
              value={inputValue}
            />
            <button
              className="send-btn"
              disabled={!engineReady || isLoading || !inputValue.trim()}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}
