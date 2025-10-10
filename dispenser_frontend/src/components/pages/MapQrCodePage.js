
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function DirectionQRPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { generating, pharmacyName, qrData } = location.state || {};

    // State for QR code display
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [uniqueCode, setUniqueCode] = useState(null);
    const [loading, setLoading] = useState(generating);
    const [error, setError] = useState(null);

    // Keep track of all generated QR IDs for cleanup
    const qrIds = useRef([]);

    // Prevent multiple backend calls (React Strict Mode double render)
    const hasGenerated = useRef(false);

    // Keyboard navigation states
    const [focusedIndex, setFocusedIndex] = useState(0);
    const goBackRef = useRef(null);
    const medListRef = useRef(null);
    const homeRef = useRef(null);

    // Inactivity modal state
    const [showInactivityModal, setShowInactivityModal] = useState(false);

    /**
     * Handle inactivity:
     * - Show modal first
     * - After 1 minute, auto-clean QR codes and redirect to home
     */
    useInactivityRedirect(() => {
        setShowInactivityModal(true);
        setTimeout(async () => {
            await deleteGeneratedQRs(); // ✅ cleanup before redirect
            navigate('/');
        }, 60000);
    });

    /**
     * Allow modal dismissal if user interacts again
     */
    useEffect(() => {
        if (!showInactivityModal) return;
        const dismiss = () => setShowInactivityModal(false);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, dismiss));
        return () => events.forEach(event => window.removeEventListener(event, dismiss));
    }, [showInactivityModal]);

    /**
     * Manage focus between navigation buttons using keyboard
     */
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
    }, []);

    /**
     * Delete all generated QR codes when user leaves page
     */
    const deleteGeneratedQRs = async () => {
        if (qrIds.current.length === 0) return;
        try {
            await fetch(`${config.backendUrl}/delete_map_qr_list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: qrIds.current }),
            });
            qrIds.current = [];
        } catch (err) {
            console.error('Error deleting QR codes:', err);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => deleteGeneratedQRs();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    /**
     * Generate QR code once on component mount
     */
    useEffect(() => {
        if (!hasGenerated.current && generating && qrData) {
            hasGenerated.current = true;
            generateQRCodeOnce();
        } else {
            setLoading(false);
        }
    }, [generating, qrData]);

    /**
     * Fetch QR code from backend
     */
    const generateQRCodeOnce = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.backendUrl}/generate_direction_qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: qrData }),
            });

            if (response.ok) {
                const data = await response.json();
                qrIds.current.push(data.id); // Store real DB ID
                const url = `data:image/png;base64,${data.image}`;
                setQrCodeUrl(url);
                setUniqueCode(data.code_unique);
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.error || 'Erreur lors de la génération du QR code');
            }
        } catch (err) {
            setError('Erreur réseau: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle exit with cleanup before navigation
     */
    const handleExit = async (callback) => {
        await deleteGeneratedQRs();
        callback();
    };

    return (
        <>
            {showInactivityModal && (
                <div className="fixed inset-0 z-50">
                    <ModalStandard onClose={() => setShowInactivityModal(false)}>
                        <div className={`${config.fontSizes.lg} font-bold mb-4`}>Inactivité détectée</div>
                        <div className={`${config.fontSizes.sm} mb-4`}>
                            Vous allez être redirigé vers l'accueil dans 1 minute...
                        </div>
                        <button
                            className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
                            onClick={() => setShowInactivityModal(false)} // ✅ just dismiss modal
                        >
                            Rester sur la page
                        </button>
                    </ModalStandard>
                </div>
            )}

            <div className={`w-full h-screen flex flex-col items-center bg-background_color ${config.padding.container}`}>
                <div className="flex flex-row gap-6 mb-4">
                    {/* Go Back Button */}
                    <button
                        ref={goBackRef}
                        tabIndex={focusedIndex === 0 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={async () => await handleExit(() => navigate(-1))}
                    >
                        <config.icons.arrowLeft className="mr-2" /> Retour
                    </button>

                    {/* Med List Button */}
                    <button
                        ref={medListRef}
                        tabIndex={focusedIndex === 1 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 1 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={async () => await handleExit(() => navigate('/non-prescription-drugs'))}
                    >
                        <config.icons.pills className="mr-2" /> Liste des médicaments
                    </button>

                    {/* Home Button */}
                    <button
                        ref={homeRef}
                        tabIndex={focusedIndex === 2 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 2 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        onClick={async (e) => { e.preventDefault(); await handleExit(() => navigate('/')); }}
                    >
                        <config.icons.home className="mr-2" /> Accueil
                    </button>
                </div>

                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h2 className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Itinéraire vers {pharmacyName}
                    </h2>
                    Scannez ce QR code via l'application mobile PharmaXcess

                    {loading && <div>Génération du QR code...</div>}
                    {error && <div>{error}</div>}
                    {qrCodeUrl && (
                        <>
                            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mb-4" />
                            {uniqueCode && (
                                <div className="mt-2 font-mono text-lg">
                                    Code unique : <span className="font-bold">{uniqueCode}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default DirectionQRPage;
