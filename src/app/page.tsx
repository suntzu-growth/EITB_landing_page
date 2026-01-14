"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SearchHero } from "@/components/search-hero";
import { SearchInput } from "@/components/search-input";
import { QuestionMarquee } from "@/components/question-marquee";
import { TopicSelector } from "@/components/topic-selector";
import { ResultsStream } from "@/components/results-stream";
import { Footer } from "@/components/footer";

import { ScheduleParser } from "@/lib/schedule-parser";
import { scheduleData } from "@/data/schedule-loader"; // We'll create a loader to get text
import { SIMULATED_ANSWERS } from "@/data/simulated-answers";

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Chat History State
  interface Message {
    role: 'user' | 'assistant';
    content?: string;
    results?: any[];
    isStreaming?: boolean;
    directAnswer?: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSearch = (query?: string) => {
    // 1. Add User Message
    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);

    setHasSearched(true);
    setIsStreaming(true);

    // 2. Prepare Assistant Message Placeholder
    // We'll append it after delay

    setTimeout(() => {
      let assistantMsg: Message = { role: 'assistant', isStreaming: true };

      // Check for simulated answer
      if (query && SIMULATED_ANSWERS[query]) {
        assistantMsg = { role: 'assistant', directAnswer: SIMULATED_ANSWERS[query], isStreaming: true };
      } else {
        // Real search
        const parser = new ScheduleParser(scheduleData);
        const results = parser.search(query || "");
        assistantMsg = { role: 'assistant', results: results, isStreaming: true };
      }

      setMessages(prev => {
        // Mark previous assistant messages as not streaming
        const history = prev.map(m => ({ ...m, isStreaming: false }));
        return [...history, assistantMsg];
      });

      // Stop streaming effect after a bit (or let ResultsStream handle it)
      setTimeout(() => {
        setIsStreaming(false);
        setMessages(prev => prev.map(m => ({ ...m, isStreaming: false })));
      }, 2000); // Approximate time for typing to finish or just to clear state

    }, 500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-eitb-blue/20 selection:text-eitb-blue flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col relative pt-16">
        {/* Initial Hero - Hidden after search */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full ${hasSearched ? "hidden" : "pt-12"}`}>
          <SearchHero />

          <div className="w-full my-8">
            <QuestionMarquee onQuestionClick={handleSearch} />
            <TopicSelector onSelect={handleSearch} className="mt-8" />
          </div>

          <div className="w-full px-4 mb-12">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>

        {/* Chat Stream */}
        {hasSearched && (
          <div className="container mx-auto px-4 pb-32 flex flex-col space-y-8">
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
                    directAnswer={msg.directAnswer}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sticky Input for Chat */}
        {hasSearched && (
          <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-8 z-50">
            <div className="container mx-auto max-w-3xl">
              <SearchInput onSearch={handleSearch} />
            </div>
          </div>
        )}
      </main>

      {!hasSearched && <Footer />}
    </div>
  );
}
