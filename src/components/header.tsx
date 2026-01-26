"use client";

import { useRouter } from "next/navigation";

export function Header() {
    const router = useRouter();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Recargar la página para resetear el estado
        window.location.href = '/';
    };

    return (
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo - Clickeable para volver al inicio */}
                <a 
                    href="/" 
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="relative w-24 h-8">
                        <img
                            src="/eitb-logo.png"
                            alt="EITB - Volver al inicio"
                            className="object-contain w-full h-full"
                        />
                    </div>
                </a>

                {/* Espacio vacío - Botones de Acceso/Registro eliminados */}
                <div className="flex items-center space-x-4">
                    {/* Botones removidos para PoC */}
                </div>
            </div>
        </header>
    );
}