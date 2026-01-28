"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = '/';
    };

    const handleCreateAccount = () => {
        setShowModal(true);
        setIsSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tools/save-user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Error saving lead:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
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

                    {/* Botón de Crear cuenta */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleCreateAccount}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            Crear cuenta
                        </button>
                    </div>
                </div>
            </header>

            {/* Modal de Registro */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icono de personalización */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                            {isSuccess ? "¡Bienvenido a EITB!" : "Personaliza tu experiencia"}
                        </h2>

                        {isSuccess ? (
                            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Eskerrik asko, <strong>{formData.name}</strong>. Tus datos han sido guardados correctamente. Te avisaremos pronto con las mejores noticias.
                                </p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-6 text-center text-sm">
                                    Déjanos tus datos para ser el primero en disfrutar de las recomendaciones personalizadas y el seguimiento de tus equipos favoritos.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Tu nombre"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="ejemplo@email.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none mt-2"
                                    >
                                        {isSubmitting ? "Guardando..." : "¡Quiero mi cuenta!"}
                                    </button>
                                </form>

                                <div className="border-t border-gray-100 pt-6">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-4">Próximamente disponible</p>
                                    <ul className="grid grid-cols-2 gap-3">
                                        <li className="flex items-center gap-2 text-[11px] text-gray-500">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                            Noticias a medida
                                        </li>
                                        <li className="flex items-center gap-2 text-[11px] text-gray-500">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                            Alertas de goles
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Eskerrik asko por tu interés en EITB 🙏
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}