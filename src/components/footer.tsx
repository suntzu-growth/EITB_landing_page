export function Footer() {
    return (
        <footer className="w-full py-6 mt-12 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center space-x-6 mb-4 text-sm text-gray-500">
                    <a href="#" className="hover:text-eitb-blue transition-colors">Lege Gordailua</a>
                    <a href="#" className="hover:text-eitb-blue transition-colors">Pribatutasun Politika</a>
                    <a href="#" className="hover:text-eitb-blue transition-colors">Gardentasuna</a>
                    <a href="#" className="hover:text-eitb-blue transition-colors">Kontaktua</a>
                </div>
                <p className="text-xs text-gray-400">
                    &copy; 2026 Suntzu
                </p>
            </div>
        </footer>
    );
}
