
import React, { useEffect, useRef, useState } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { voiceOverTexts } from '../../config/voiceOverTexts'; 
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';

function DirectionQRPage() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.directionQR);
  const { speak } = useVoiceOver();

    const navigate = useNavigate();
    const location = useLocation();
    const { generating, pharmacyName, qrData } = location.state || {};

    // State for QR code display
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [uniqueCode, setUniqueCode] = useState(null);
    const [loading, setLoading] = useState(true);
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
        const generate = async () => {
            if (hasGenerated.current) {
                return;
            }

            if (generating && qrData) {
                hasGenerated.current = true;

                setLoading(true);
                await new Promise(res => setTimeout(res, 100));

                await generateQRCodeOnce();
            }
        };

        generate();
    }, [generating, qrData]);

    const generateQRCodeOnce = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/generate_direction_qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: qrData }),
            });

            if (response.ok) {
                const data = await response.json();

                qrIds.current.push(data.id);
                setQrCodeUrl(`data:image/png;base64,${data.image}`);
                setUniqueCode(data.code_unique);

            } else {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.error || 'Erreur lors de la génération du QR code';
                setError(errMsg);
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
                        <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`}
                            {...createVoiceOverHandlers(speak)}
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
                    <button ref={goBackRef}
                        tabIndex={focusedIndex === 0 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 0 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        {...createVoiceOverHandlers(speak)}
                        onClick={async () => await handleExit(() => navigate(-1))}
                    >
                        <config.icons.arrowLeft className="mr-2" /> Retour
                    </button>

                    {/* Med List Button */}
                    <button ref={medListRef}
                        tabIndex={focusedIndex === 1 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 1 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
                        {...createVoiceOverHandlers(speak)}
                        onClick={async () => await handleExit(() => navigate('/non-prescription-drugs'))}
                    >
                        <config.icons.pills className="mr-2" /> Liste des médicaments
                    </button>

                    {/* Home Button */}
                    <button ref={homeRef}
                        tabIndex={focusedIndex === 2 ? 0 : -1}
                        className={
                            `${config.padding.button} ${config.buttonColors.mainGradient} ${config.textColors.primary}
                            ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default} ${focusedIndex === 2 ? `${config.focusStates.ring} ${config.scaleEffects.focus}` : ''}`
                        }
            {...createVoiceOverHandlers(speak)}
                        onClick={async (e) => { e.preventDefault(); await handleExit(() => navigate('/')); }}
                    >
                        <config.icons.home className="mr-2" /> Accueil
                    </button>
                </div>

                <div className="w-full h-full flex flex-col items-center justify-center">
                    <h2 className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Itinéraire vers {pharmacyName}
                    </h2>

                    {/* ✅ Affiche toujours le message tant que QR pas dispo */}
                    {(!qrCodeUrl && !error) && (
                        <div className="text-lg font-medium animate-pulse">
                            Génération du QR code...
                        </div>
                    )}

                    {error && <div className="text-red-500">{error}</div>}

                    {qrCodeUrl && (
                        <>
                            <div>
                                Scannez ce QR code via l'application mobile PharmaXcess
                            </div>
                            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mb-4 mt-4" />
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
