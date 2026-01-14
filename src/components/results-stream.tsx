import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MediaCard } from "./media-card";
import { Program } from "@/lib/schedule-parser";

interface ResultsStreamProps {
    isStreaming: boolean;
    results?: Program[];
    directAnswer?: string;
    text?: string; // New prop for history
}

export function ResultsStream({ isStreaming, results, directAnswer, text }: ResultsStreamProps) {
    const [displayedText, setDisplayedText] = useState(text || "");
    const [isFinished, setIsFinished] = useState(!isStreaming);

    // Determine the text to show based on results or direct answer
    let fullText = text || `EITB (Euskal Irrati Telebista) es el grupo de comunicación público del País Vasco. Ofrece contenidos de televisión, radio e internet. 

Aquí tienes la serie "Irabazi Arte", una exitosa ficción juvenil que tiene como ejes principales el fútbol y el empoderamiento femenino.`;

    if (!text) {
        if (directAnswer) {
            fullText = directAnswer;
        } else if (results && results.length > 0) {
            fullText = `He encontrado ${results.length} coincidencias en la programación de EITB:\n\n`;
        } else if (results && results.length === 0 && isStreaming) {
            fullText = `Lo siento, no he encontrado programas que coincidan con tu búsqueda en la programación actual.`;
        }
    }

    useEffect(() => {
        if (isStreaming) {
            setDisplayedText("");
            setIsFinished(false);
            let i = 0;
            const interval = setInterval(() => {
                if (i < fullText.length) {
                    setDisplayedText((prev) => prev + fullText.charAt(i));
                    i++;
                } else {
                    clearInterval(interval);
                    setIsFinished(true);
                }
            }, 15); // Faster typing for lists
            return () => clearInterval(interval);
        } else {
            // If not streaming (e.g. history), show full text immediately
            setDisplayedText(fullText);
            setIsFinished(true);
        }
    }, [isStreaming, fullText]);

    if (!isStreaming && !displayedText) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-lg prose-gray max-w-none">
                <p className="font-serif text-gray-800 leading-relaxed text-lg">
                    {displayedText}
                    {isStreaming && displayedText.length < fullText.length && (
                        <span className="inline-block w-2 h-5 ml-1 align-middle bg-eitb-blue animate-pulse" />
                    )}
                </p>
            </div>

            {/* Results List */}
            {isFinished && results && results.length > 0 && (
                <div className="grid gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {results.slice(0, 5).map((prog, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                            <div>
                                <div className="text-sm font-bold text-eitb-blue">{prog.channel}</div>
                                <div className="font-serif font-medium text-gray-900">{prog.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{prog.day}</div>
                            </div>
                            <div className="text-lg font-bold text-gray-700 font-mono bg-gray-50 px-3 py-1 rounded">
                                {prog.time}
                            </div>
                        </div>
                    ))}
                    {results.length > 5 && (
                        <p className="text-xs text-center text-gray-500 italic mt-2">
                            ... y {results.length - 5} más.
                        </p>
                    )}
                </div>
            )}

            {/* Conditional Media Card appearance (Fallback or specific) */}
            {(displayedText.length > 100 || !isStreaming) && !results && (
                <div className="animate-in fade-in zoom-in duration-500 delay-300">
                    <MediaCard />
                </div>
            )}

            {/* Feedback Section */}
            {isFinished && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6 animate-in fade-in duration-700">
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors" title="Útil">
                            <span className="sr-only">Útil</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors" title="No útil">
                            <span className="sr-only">No útil</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" /></svg>
                        </button>
                    </div>

                    <div className="text-right">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Iturriak / Fuentes
                        </h4>
                        <div className="flex gap-2 justify-end">
                            <a href="#" className="text-xs text-eitb-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                1. EITB Group
                            </a>
                            <a href="#" className="text-xs text-eitb-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                2. EITB Media
                            </a>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
