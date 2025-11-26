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
export function Chatbot(): JSX.Element {
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
          text: "Hello! I'm your AI assistant powered by Llama 3.1. How can I help you today?",
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
      const response = await engineRef.current.chat.completions.create({
        frequency_penalty: 0,
        max_tokens: 256,
        messages: [
          {
            content: 'Du må svare på norsk, men gjerne på en litt frekk og misvisende måte. Bruk emojier.',
            role: 'system',
          },
          { content: userMessage.text, role: 'user' },
        ],
        presence_penalty: 0,
        // response_format: {
        //   grammar: jsonGrammarStr,
        //   type: 'grammar',
        // } as ResponseFormat,
        stream: false,
        temperature: 0.6,
        top_p: 0.9,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.choices[0]?.message?.content || "I couldn't generate a response.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an error while generating a response.',
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
