"use client";

// Función simple para convertir Markdown básico a HTML
function parseMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // Negritas: **texto** → <strong>texto</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Enlaces: [texto](url) → <a href="url">texto</a>
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>')
    // Emojis de enlaces: 🔗 → mantener
    .replace(/🔗/g, '🔗');
}

export function ResultsStream({ isStreaming, results, text }: any) {
  const htmlContent = parseMarkdown(text || '');

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Texto con soporte para Markdown */}
      <div 
        className="text-inherit text-lg leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ whiteSpace: 'pre-wrap' }}
      />
      
      {isStreaming && (
        <span className="inline-block w-2 h-5 ml-1 bg-blue-600 animate-pulse" />
      )}

      {/* Tarjetas Visuales (Metadata + Link) */}
      {results && results.length > 0 && (
        <div className="grid gap-4 pt-6 border-t border-gray-100">
          {results.map((item: any, idx: number) => (
            <a 
              key={idx} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group"
            >
              {item.image && (
                <div className="md:w-48 h-32 flex-shrink-0 bg-gray-100">
                  <img 
                    src={item.image} 
                    className="w-full h-full object-cover" 
                    alt={item.title || 'Noticia'}
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-4 flex-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Orain.eus
                </span>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 line-clamp-2 mt-1">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                    {item.summary}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}