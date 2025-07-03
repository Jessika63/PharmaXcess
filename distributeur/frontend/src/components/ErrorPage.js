import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

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
        <div className={`w-full h-screen flex flex-col items-center justify-center bg-background_color`}>
            <div className={`bg-white ${config.borderRadius.lg} ${config.shadows.md} ${config.padding.modal} flex flex-col items-center`}>
                <div className={`${config.fontSizes.xl} ${config.textColors.red} font-bold mb-4`}>Erreur serveur</div>
                <div className={`${config.fontSizes.sm} ${config.textColors.primary} mb-8`}>{message || 'Un problème est survenu avec le serveur.'}</div>
                <button
                    autoFocus
                    className={`${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
                    onClick={() => navigate(-1)}
                >
                    Retour
                </button>
            </div>
        </div>
    );
};

export default ErrorPage; 