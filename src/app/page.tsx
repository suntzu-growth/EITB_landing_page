"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { SearchHero } from "@/components/search-hero";
import { SearchInput } from "@/components/search-input";
import { QuestionMarquee } from "@/components/question-marquee";
import { TopicSelector } from "@/components/topic-selector";
import { ResultsStream } from "@/components/results-stream";
import { Footer } from "@/components/footer";

interface Message {
  role: 'user' | 'assistant';
  content?: string;
  results?: any[];
  isStreaming?: boolean;
  directAnswer?: string;
  type?: string;
}

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const conversationRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessageRef = useRef(true);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Inicialización del Agente (MODO TEXTO ESTRICTO)
  useEffect(() => {
    const initAgent = async () => {
      try {
        setAgentStatus('connecting');
        const { TextConversation } = await import('@elevenlabs/client');

        const response = await fetch("/api/get-signed-url");
        const { signedUrl } = await response.json();

        const conversation = await TextConversation.startSession({
          signedUrl,
          // Definimos las herramientas aquí dentro para el modo texto
          clientTools: {
            displayTextResponse: async ({ text }: any) => {
              updateAssistantMessage(text, false);
              return { success: true };
            },
            displayNewsResults: async ({ news, summary }: any) => {
              updateAssistantMessage(summary, false, news, 'news');
              return { success: true };
            },
            displaySchedule: async ({ schedule, summary }: any) => {
              updateAssistantMessage(summary, false, schedule, 'schedule');
              return { success: true };
            }
          },
          onMessage: (message: any) => {
            handleAgentMessage(message);
          },
          onError: (error: any) => {
            console.error('[Agent Error]:', error);
            setAgentStatus('disconnected');
          },
          onDisconnect: () => {
            setAgentStatus('disconnected');
          }
        });

        conversationRef.current = conversation;
        setAgentStatus('connected');
        console.log('[Agent] Connected in text-only mode');

      } catch (err) {
        console.error("Failed to init agent:", err);
        setAgentStatus('disconnected');
      }
    };

    initAgent();
    return () => conversationRef.current?.endSession();
  }, []);

  // Helper para actualizar el mensaje del asistente sin duplicar
  const updateAssistantMessage = (content: string, streaming: boolean, results?: any[], type?: string) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: content || updated[updated.length - 1].content,
          isStreaming: streaming,
          results: results || updated[updated.length - 1].results,
          type: type || updated[updated.length - 1].type
        };
        return updated;
      }
      return updated;
    });
    if (!streaming) setIsStreaming(false);
  };

  const handleAgentMessage = (message: any) => {
    const text = message.message || message.text || '';
    if (!text) return;

    const lowerText = text.toLowerCase();
    const ignoredPhrases = ["irabazi arte", "euskal irrati telebista", "grupo de comunicación público", "estás ahí"];

    // Filtrado de mensaje inicial automático
    if (isFirstMessageRef.current && ignoredPhrases.some(p => lowerText.includes(p))) {
      return;
    }

    if (text.length > 5) isFirstMessageRef.current = false;

    // Actualizamos el contenido que llega por streaming de texto
    if (message.role === 'agent' || message.type === 'text') {
       setMessages(prev => {
         const updated = [...prev];
         const last = updated[updated.length - 1];
         if (last && last.role === 'assistant') {
            const newContent = (last.content === 'Consultando...' ? '' : last.content) + text;
            updated[updated.length - 1] = { ...last, content: newContent };
         }
         return updated;
       });
    }

    if (message.type === 'agent_response_end') {
      setIsStreaming(false);
    }
  };

  const handleSearch = async (query?: string, isCategorySelection: boolean = false) => {
    if (!query || agentStatus !== 'connected') return;

    isFirstMessageRef.current = false; // El usuario ya habló, no ignoramos más
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setHasSearched(true);
    setIsStreaming(true);

    // Placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: 'Consultando...', isStreaming: true }]);

    try {
      const prompt = isCategorySelection ? `Sección: ${query}` : query;
      await conversationRef.current.sendUserMessage(prompt);
    } catch (err) {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col relative pt-16">
        {/* HERO SECTION */}
        {!hasSearched && (
          <div className="flex flex-col items-center w-full pt-12">
            <SearchHero />
            <div className="mb-4 h-6">
              {agentStatus === 'connected' ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">● Agente de Texto Listo</span>
              ) : (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 animate-pulse">○ Conectando...</span>
              )}
            </div>
            <div className="w-full my-8">
              <QuestionMarquee onQuestionClick={(q) => handleSearch(q)} />
              <TopicSelector onSelect={(t) => handleSearch(t, true)} className="mt-8" />
            </div>
            <div className="w-full px-4 mb-12">
              <SearchInput onSearch={(q) => handleSearch(q)} />
            </div>
          </div>
        )}

        {/* CHAT SECTION */}
        {hasSearched && (
          <div className="container mx-auto px-4 pb-32 flex flex-col space-y-8 pt-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`w-full ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-lg">
                    {msg.content}
                  </div>
                ) : (
                  <ResultsStream
                    isStreaming={!!msg.isStreaming}
                    results={msg.results}
                    directAnswer={msg.content}
                    text={msg.content}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* STICKY INPUT */}
        {hasSearched && (
          <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t p-4 pb-8 z-50">
            <div className="container mx-auto max-w-3xl">
              <SearchInput onSearch={(q) => handleSearch(q)} />
            </div>
          </div>
        )}
      </main>
      {!hasSearched && <Footer />}
    </div>
  );
}