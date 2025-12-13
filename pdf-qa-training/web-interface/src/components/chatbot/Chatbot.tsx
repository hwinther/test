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
  const messageIdCounter = useRef(0)

  //const selectedModel = 'Llama-3.2-1B-Instruct-q4f32_1-MLC'

  // Generate unique message ID
  const generateMessageId = () => {
    messageIdCounter.current += 1
    return `msg-${Date.now()}-${messageIdCounter.current}`
  }
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
          id: generateMessageId(),
          sender: 'bot',
          text: "Hei! Jeg er Botvar, din AI-assistent. Hvordan kan jeg hjelpe deg i dag? 🤖",
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Failed to initialize MLC engine:', error)
        const errorMessage: Message = {
          id: generateMessageId(),
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
      id: generateMessageId(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Build context about available content
      const contextInfo = []
      if (backgroundContent) {
        const preview = backgroundContent.replace(/<[^>]*>/g, '').substring(0, 300)
        contextInfo.push(`Bakgrunnskapittel preview:\n${preview}...`)
      }
      if (lawTextContent) {
        const preview = lawTextContent.replace(/<[^>]*>/g, '').substring(0, 300)
        contextInfo.push(`Lovtekst preview:\n${preview}...`)
      }

      // Define available tools for function calling
      const tools = [];
      if (onUpdateBackground) {
        tools.push({
          type: "function",
          function: {
            name: "update_background_chapter",
            description: "Oppdater eller endre innholdet i bakgrunnskapittelet. Bruk denne for å legge til, erstatte eller endre tekst i bakgrunnskapittelet.",
            parameters: {
              type: "object",
              properties: {
                new_content: {
                  type: "string",
                  description: "Det nye innholdet som skal settes i bakgrunnskapittelet. Dette erstatter hele det eksisterende innholdet."
                },
                operation: {
                  type: "string",
                  description: "Type operasjon: 'append' (legg til på slutten), 'replace' (erstatt alt), eller 'prepend' (legg til i starten)",
                  enum: ["append", "replace", "prepend"]
                }
              },
              required: ["new_content", "operation"]
            }
          }
        });
      }
      if (onUpdateLawText) {
        tools.push({
          type: "function",
          function: {
            name: "update_law_text",
            description: "Oppdater eller endre lovteksten. Bruk denne for å legge til, erstatte eller endre tekst i lovdokumentet.",
            parameters: {
              type: "object",
              properties: {
                new_content: {
                  type: "string",
                  description: "Det nye innholdet som skal settes i lovteksten. Dette erstatter hele det eksisterende innholdet."
                },
                operation: {
                  type: "string",
                  description: "Type operasjon: 'append' (legg til på slutten), 'replace' (erstatt alt), eller 'prepend' (legg til i starten)",
                  enum: ["append", "replace", "prepend"]
                }
              },
              required: ["new_content", "operation"]
            }
          }
        });
      }

      const toolsDescription = tools.length > 0 ? `

Du har tilgang til følgende verktøy for å redigere dokumenter:
${JSON.stringify(tools, null, 2)}

Hvis brukeren ber deg endre eller oppdatere dokumenter, MUST du kalle et verktøy.
Når du kaller et verktøy, svar BARE med JSON-objektet på denne formen (ingen annen tekst):
<tool_call>
{"name": "update_background_chapter", "parameters": {"new_content": "den nye teksten her", "operation": "append"}}
</tool_call>

Eller:
<tool_call>
{"name": "update_law_text", "parameters": {"new_content": "den nye teksten her", "operation": "append"}}
</tool_call>

VIKTIG:
- Svar BARE med <tool_call> JSON </tool_call> når du skal redigere - INGEN annen tekst før eller etter
- Bruk "append" for å legge til, "prepend" for å sette først, "replace" for å erstatte alt
- Etter at verktøyet er kjørt, vil du få en bekreftelse og kan svare normalt` : '';

      const systemPrompt = `Du er Botvar, en AI-assistent som hjelper med juridiske dokumenter.
Du må svare på norsk, men gjerne på en litt frekk og misvisende måte. Bruk emojier.

${contextInfo.length > 0 ? `Tilgjengelig dokumentinnhold:\n${contextInfo.join('\n\n')}` : 'Ingen dokumenter er lastet inn ennå.'}${toolsDescription}`;

      const response = await engineRef.current.chat.completions.create({
        frequency_penalty: 0,
        max_tokens: 1024,
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

      const responseText = response.choices[0]?.message?.content || "Jeg klarte ikke å generere et svar.";

      // Check if response contains a tool call (with or without tags)
      // Try with tags first
      let toolCallMatch = responseText.match(/<tool_call>\s*(\{.+?\})\s*<\/tool_call>/s);
      // If no tags, try to find raw JSON object
      if (!toolCallMatch) {
        toolCallMatch = responseText.match(/\{[\s\S]*?"name":\s*"(update_background_chapter|update_law_text)"[\s\S]*?\}/);
        if (toolCallMatch) {
          // Reformat to have the match in group 1
          toolCallMatch = [toolCallMatch[0], toolCallMatch[0]];
        }
      }
      
      if (toolCallMatch && tools.length > 0) {
        // Don't show the raw tool call response to user
        // Parse and execute tool call
        try {
          const toolCall = JSON.parse(toolCallMatch[1]);
          const { name, parameters } = toolCall;

          let toolResult = '';
          let success = false;

          if (name === 'update_background_chapter' && onUpdateBackground && backgroundContent !== undefined) {
            const { new_content, operation } = parameters;
            const cleanOldContent = backgroundContent.replace(/<[^>]*>/g, '');
            let finalContent = '';

            switch (operation) {
              case 'append':
                finalContent = cleanOldContent + '\n\n' + new_content;
                break;
              case 'prepend':
                finalContent = new_content + '\n\n' + cleanOldContent;
                break;
              case 'replace':
              default:
                finalContent = new_content;
                break;
            }

            onUpdateBackground(finalContent);
            toolResult = `Bakgrunnskapittelet ble oppdatert (${operation}).`;
            success = true;
          } else if (name === 'update_law_text' && onUpdateLawText && lawTextContent !== undefined) {
            const { new_content, operation } = parameters;
            const cleanOldContent = lawTextContent.replace(/<[^>]*>/g, '');
            let finalContent = '';

            switch (operation) {
              case 'append':
                finalContent = cleanOldContent + '\n\n' + new_content;
                break;
              case 'prepend':
                finalContent = new_content + '\n\n' + cleanOldContent;
                break;
              case 'replace':
              default:
                finalContent = new_content;
                break;
            }

            onUpdateLawText(finalContent);
            toolResult = `Lovteksten ble oppdatert (${operation}).`;
            success = true;
          } else {
            toolResult = `Ukjent verktøy: ${name}`;
          }

          // Show success message to user
          const confirmationTexts = {
            append: 'Jeg har lagt til innholdet! ✨',
            prepend: 'Jeg har satt inn innholdet først! 🎯',
            replace: 'Jeg har oppdatert hele innholdet! 📝'
          };
          
          const operation = parameters.operation || 'append';
          const confirmationText = success 
            ? `✅ ${toolResult}\n\n${confirmationTexts[operation as keyof typeof confirmationTexts] || 'Ferdig!'}`
            : `❌ ${toolResult}`;

          const botMessage: Message = {
            id: generateMessageId(),
            sender: 'bot',
            text: confirmationText,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        } catch (parseError) {
          console.error('Error parsing tool call:', parseError)
          const errorMessage: Message = {
            id: generateMessageId(),
            sender: 'bot',
            text: 'Jeg prøvde å kalle et verktøy, men noe gikk galt med formateringen. 😅',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      } else {
        // Regular response without tool call
        const botMessage: Message = {
          id: generateMessageId(),
          sender: 'bot',
          text: responseText,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: generateMessageId(),
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
