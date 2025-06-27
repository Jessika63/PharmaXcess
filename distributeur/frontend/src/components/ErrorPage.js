import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ message }) => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                navigate(-1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-background_color">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <div className="text-4xl text-red-600 font-bold mb-4">Erreur serveur</div>
                <div className="text-xl text-gray-800 mb-8">{message || 'Un problème est survenu avec le serveur.'}</div>
                <button
                    autoFocus
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-2xl rounded-xl shadow hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(-1)}
                >
                    Retour
                </button>
            </div>
        </div>
    );
};

export default ErrorPage; 