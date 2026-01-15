"use client";

import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    onSearch?: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [query, setQuery] = useState("");

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && query.trim()) {
            onSearch?.(query);
            setQuery(""); // Clear input after search
        }
    };

    // Allow parent to search via this input
    const handleSearchClick = () => {
        if (query.trim()) {
            onSearch?.(query);
            setQuery(""); // Clear input after search
        }
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto group animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div
                className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-r from-eitb-blue/20 via-blue-400/20 to-eitb-blue/20 blur-xl transition-opacity duration-500",
                    isListening ? "opacity-100 animate-pulse" : "opacity-0 group-hover:opacity-50"
                )}
            />
            <div className="relative bg-white rounded-full shadow-lg border border-gray-200 flex items-center p-2 hover:shadow-xl transition-shadow duration-300 ring-1 ring-gray-100">
                <Search className="w-5 h-5 text-gray-400 ml-4 cursor-pointer" onClick={handleSearchClick} />
                <Input
                    type="text"
                    placeholder="Pregunta algo sobre EITB..."
                    className="border-none shadow-none focus-visible:ring-0 text-lg py-6 px-4 bg-transparent flex-1 placeholder:text-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={toggleListening}
                    className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        isListening
                            ? "bg-red-50 text-red-500 animate-pulse"
                            : "hover:bg-gray-100 text-eitb-blue"
                    )}
                >
                    <Mic className={cn("w-6 h-6", isListening && "animate-bounce")} />
                </button>
            </div>
        </div>
    );
}
