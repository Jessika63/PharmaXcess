
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function DirectionQRPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { generating, pharmacyName, qrData } = location.state || {};
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(generating);
    const [error, setError] = useState(null);

    // Keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState(0);
    const goBackRef = useRef(null);
    const medListRef = useRef(null);
    const homeRef = useRef(null);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    useInactivityRedirect(() => setShowInactivityModal(true));

    // Dismiss inactivity modal on user activity
    useEffect(() => {
        if (!showInactivityModal) {
            return;
        }
        const dismiss = () => setShowInactivityModal(false);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, dismiss));
        return () => events.forEach(event => window.removeEventListener(event, dismiss));
    }, [showInactivityModal]);

    // Focus management
    useEffect(() => {
        const refs = [goBackRef, medListRef, homeRef];
        if (refs[focusedIndex] && refs[focusedIndex].current) {
            refs[focusedIndex].current.focus();
        }
    }, [focusedIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
                if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
                    setFocusedIndex((prev) => (prev + 1) % 3);
                } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
                    setFocusedIndex((prev) => (prev - 1 + 3) % 3);
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Generate QR code on component mount if needed
    useEffect(() => {
        if (generating && qrData) {
            generateQRCode();
        } else if (!generating && !qrData) {
            setLoading(false);
        }
    }, [generating, qrData]);

    const generateQRCode = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/generate_direction_qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(qrData),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setQrCodeUrl(url);
            } else {
                // Essayer de récupérer les détails de l'erreur
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.details || errorData.error || 'Erreur lors de la génération du QR code');
                console.error('Server error details:', errorData);
            }
        } catch (err) {
            setError('Erreur réseau: ' + err.message);
            console.error('Network error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showInactivityModal && (
                <div className="fixed inset-0 z-50">
                    <ModalStandard onClose={() => setShowInactivityModal(false)}>
                        <div className={`${config.fontSizes.lg} font-bold mb-4`}>
                            Inactivité détectée
                        </div>
                        <div className={`${config.fontSizes.sm} mb-4`}>
                            Vous allez être redirigé vers l'accueil dans 1 minute...
                        </div>
                        <button className={
                            `${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                            ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default}`
                        } onClick={() => setShowInactivityModal(false)}>
                            Rester sur la page
                        </button>
                    </ModalStandard>
                </div>
            )}
            <div className={`w-full h-screen flex flex-col items-center bg-background_color ${config.padding.container}`}>
                <div className="flex flex-row gap-6 mb-4">
                    <button
                        ref={goBackRef}
                        tabIndex={focusedIndex === 0 ? 0 : -1}
                        className={
                        `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                        ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                        ${config.transitions.default} ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={() => { navigate(-1); }}
                    >
                        <config.icons.arrowLeft className="mr-2" />
                        Retour
                    </button>
                    <button
                        ref={medListRef}
                        tabIndex={focusedIndex === 1 ? 0 : -1}
                        className={
                        `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                        ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                        ${config.transitions.default} ${focusedIndex === 1 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={() => { navigate('/non-prescription-drugs'); }}
                    >
                        <config.icons.pills className="mr-2" />
                        Liste des médicaments
                    </button>
                    <button
                        ref={homeRef}
                        tabIndex={focusedIndex === 2 ? 0 : -1}
                        className={
                        `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                        ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                        ${config.transitions.default} ${focusedIndex === 2 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={e => { e.preventDefault(); navigate('/'); }}
                    >
                        <config.icons.home className="mr-2" />
                        Accueil
                    </button>
                </div>
                
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h2 className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Itinéraire vers {pharmacyName}
                    </h2>

                    {loading && (
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
                            <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>
                                Génération du QR code...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center">
                            <div className={`${config.fontSizes.md} ${config.textColors.danger} mb-4`}>
                                {error}
                            </div>
                            <button
                                className={
                                    `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                                    ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                                    ${config.transitions.default}`
                                }
                                onClick={() => navigate(-1)}
                            >
                                Retour
                            </button>
                        </div>
                    )}

                    {qrCodeUrl && !loading && !error && (
                        <div className="flex flex-col items-center justify-center">
                            <div className={`${config.fontSizes.md} ${config.textColors.secondary} mb-4`}>
                                Scannez ce code avec l'application mobile PharmaXcess
                            </div>
                            <img
                                src={qrCodeUrl}
                                alt="QR Code de l'itinéraire"
                                className="w-64 h-64 mx-auto border-4 border-white rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    {!qrCodeUrl && !loading && !error && (
                        <div className="flex flex-col items-center justify-center">
                            <div className={`${config.fontSizes.md} ${config.textColors.secondary} mb-4`}>
                                Données du QR code non disponibles
                            </div>
                            <button
                                className={
                                    `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                                    ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                                    ${config.transitions.default}`
                                }
                                onClick={() => navigate(-1)}
                            >
                                Retour
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-auto mb-8">
                    <img
                        src={config.icons.logo}
                        alt="Logo PharmaXcess"
                        className="w-40 h-auto opacity-60"
                    />
                </div>
            </div>
        </>
    );
}

export default DirectionQRPage;
