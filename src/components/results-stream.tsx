"use client";

import { useEffect, useState } from "react";
import { MediaCard } from "./media-card";
import { Program } from "@/lib/schedule-parser";

interface ResultsStreamProps {
    isStreaming: boolean;
    results?: Program[];
    directAnswer?: string;
    text?: string; 
}

export function ResultsStream({ isStreaming, results, directAnswer, text }: ResultsStreamProps) {
    // 1. Eliminamos el intervalo y el efecto de máquina de escribir manual.
    // Usamos directamente el 'text' que viene del padre.
    const [isFinished, setIsFinished] = useState(!isStreaming);

    useEffect(() => {
        // Solo marcamos como finalizado cuando el padre nos diga que ya no hay streaming
        if (!isStreaming) {
            setIsFinished(true);
        } else {
            setIsFinished(false);
        }
    }, [isStreaming]);

    // Determinamos qué texto mostrar. Priorizamos 'text' porque es el que 
    // acumula el streaming real del agente de ElevenLabs.
    const contentToShow = text || directAnswer || "";

    // Si no hay contenido y no estamos esperando streaming, no renderizamos nada
    if (!isStreaming && !contentToShow && (!results || results.length === 0)) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-lg prose-gray max-w-none">
                <div className="font-serif text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                    {/* 2. Renderizamos el texto directamente. Al ser un estado que se actualiza 
                        en el padre, React lo mostrará letra a letra según llegue. */}
                    {contentToShow === "Consultando..." ? (
                        <span className="text-gray-400 italic animate-pulse">Consultando...</span>
                    ) : (
                        contentToShow
                    )}
                    
                    {/* Cursor de streaming */}
                    {isStreaming && (
                        <span className="inline-block w-2 h-5 ml-1 align-middle bg-eitb-blue animate-pulse" />
                    )}
                </div>
            </div>

            {/* Listado de Resultados de Programación */}
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
                </div>
            )}

            {/* Media Card (Imagen lateral) - Se muestra cuando el texto es largo o ha terminado */}
            {(contentToShow.length > 100 || isFinished) && !results && (
                <div className="animate-in fade-in zoom-in duration-500 delay-300">
                    <MediaCard />
                </div>
            )}

            {/* Feedback y Fuentes */}
            {isFinished && contentToShow !== "Consultando..." && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6 animate-in fade-in duration-700">
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                        </button>
                    </div>

                    <div className="text-right">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Fuentes
                        </h4>
                        <div className="flex gap-2 justify-end">
                            <span className="text-xs text-eitb-blue bg-blue-50 px-2 py-1 rounded">EITB Media</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}