import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/documents_checking.css'
import CameraComponent from '../camera_component';
import ModalCamera from '../modal_camera';
import ModalCINChoice from '../modal_cin_choice';
import config from '../../config';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function DocumentsChecking() {
    const [showCamera, setShowCamera] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(1);
    const focusedIndexRef = useRef(1);
    const buttonsRef = useRef([]);
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [currentDocType, setCurrentDocType] = useState(null);
    const [showCINOptions, setShowCINOptions] = useState(false);

    const navigate = useNavigate();

    const handlePhotoCaptured = async (base64Image) => {
        setIsModalOpen(false);
        setShowCamera(false);

        if (currentDocType === 'ordonnance_qr') {
            try {
              // Convertir base64 en blob
                const response = await fetch(base64Image);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('image', blob, 'prescription_qr.jpg');

                const uploadResponse = await fetch(`${config.backendUrl}/read_prescription_qr`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await uploadResponse.json();
                if (!data.success) {
                    alert(`Erreur lors de la lecture du QR code: ${data.error}`);
                }
            } catch (error) {
                console.error("Erreur client QR:", error);
                alert("Erreur de connexion");
            }
        } else if (currentDocType !== 'carte_vitale') {
            let docCode = null;

            if (currentDocType === 'ordonnance') {
                docCode = 'P';
            } else if (currentDocType === 'carte_identite_recto') {
                docCode = 'R';
            } else if (currentDocType === 'carte_identite_verso') {
                docCode = 'V';
            }

            try {
                const response = await fetch(`${config.backendUrl}/extractText`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        base64_image: base64Image,
                        type: docCode
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    console.error("Erreur d'extraction :", data.error);
                }
            } catch (error) {
                console.error("Erreur client:", error);
            }
        }
    };

    const handleCINSideSelection = (side) => {
        const docType = side === 'recto' ? 'carte_identite_recto' : 'carte_identite_verso';
        setCurrentDocType(docType);
        setShowCamera(true);
        setIsModalOpen(true);
        setShowCINOptions(false);
    };

    const handleOpenCamera = useCallback((documentType) => {
        if (documentType === 'carte_identite') {
            setShowCINOptions(true);
        } else {
            setCurrentDocType(documentType);
            setShowCamera(true);
            setIsModalOpen(true);
        }
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setShowCamera(false);
    };

    const handleKeyDown = useCallback((event) => {
        if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
            event.preventDefault();
            setFocusedIndex((prevIndex) => {
                const newIndex = (prevIndex + 1) % 5;
                focusedIndexRef.current = newIndex;
                return newIndex;
            });
        } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
            event.preventDefault();
            setFocusedIndex((prevIndex) => {
                const newIndex = (prevIndex - 1 + 5) % 5;
                focusedIndexRef.current = newIndex;
                return newIndex;
            });
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (focusedIndexRef.current === 1) { // Nouveau cas
                handleOpenCamera('ordonnance_qr');
            } else if (focusedIndexRef.current === 2) {
                handleOpenCamera('ordonnance');
            } else if (focusedIndexRef.current === 3) {
                handleOpenCamera('carte_vitale');
            } else if (focusedIndexRef.current === 4) {
                handleOpenCamera('carte_identite');
            } else if (focusedIndexRef.current === 0) {
                navigate('/');
            }
        }
    }, [navigate, handleOpenCamera]);

    useInactivityRedirect(() => setShowInactivityModal(true));
    useEffect(() => {
        if (!showInactivityModal) {
            return;
        }
        const dismiss = () => setShowInactivityModal(false);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, dismiss));
        return () => events.forEach(event => window.removeEventListener(event, dismiss));
    }, [showInactivityModal]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        if (buttonsRef.current[focusedIndex]) {
            buttonsRef.current[focusedIndex].focus();
        }
    }, [focusedIndex]);

    useEffect(() => {
    }, [focusedIndex]);

    return (
        <>
            {showInactivityModal && (
                <ModalStandard onClose={() => setShowInactivityModal(false)}>
                    <div className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Inactivité détectée
                    </div>
                    <div className={`${config.fontSizes.sm} mb-4`}>
                        Vous allez être redirigé vers l'accueil dans 1 minute...
                    </div>
                    <button className={`
                        ${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                        ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                        ${config.transitions.default}
                    `} onClick={() => setShowInactivityModal(false)}>
                        Rester sur la page
                    </button>
                </ModalStandard>
            )}
            <div className={`bg-background_color w-full h-screen flex flex-col items-center`}>

                {/* Header */}
                <div className="w-4/5 h-40 flex justify-between items-center mb-6 mt-12">
                    {/* Go Back */}
                    <Link
                        to="/"
                        ref={(el) => (buttonsRef.current[-1] = el)}
                        tabIndex={0}
                        className={`${config.fontSizes.md} ${config.buttonColors.mainGradient}
                            ${config.padding.button} ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}
                            ${config.focusStates.outline} flex items-center ${focusedIndex === 0 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}`}
                    >
                        <config.icons.arrowLeft className="mr-3" />
                        Retour
                    </Link>

                    {/* Logo */}
                    <div className="flex-grow flex justify-center pr-64">
                        <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-96 h-24" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-2/3 h-2/3 flex flex-col items-center mt-2 space-y-16">
                    <div className={`w-2/3 h-56 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md}
                        ${config.buttonColors.textBackground} ${config.textColors.primary} ${config.transitions.slow}
                        ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}`}>
                        <p className={`${config.fontSizes.lg} text-center`}>
                            Veuillez insérer les documents :<br />
                            Ordonnance, Carte Vitale, Carte d'Identité
                        </p>
                    </div>

                    <div className="w-full flex space-x-8">
                        {/* Button 'Ordonnance QR' */}
                        <div
                            ref={(el) => (buttonsRef.current[0] = el)}
                            tabIndex={0}
                            className={`w-1/2 h-32 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md}
                                ${config.buttonColors.mainGradient} ${config.textColors.primary} cursor-pointer
                                ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
                                ${config.focusStates.outline} ${focusedIndex === 4 ? config.scaleEffects.focus : ''}`}
                            onClick={() => handleOpenCamera('ordonnance_qr')}
                        >
                            <config.icons.qrCode className="mr-4 text-4xl" />
                            <p className={`${config.fontSizes.lg} text-center`}>
                                Ordonnance QR
                            </p>
                        </div>

                        {/* Button 'Ordonnance' */}
                        <div
                            ref={(el) => (buttonsRef.current[1] = el)}
                            tabIndex={0}
                            className={`w-1/2 h-32 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md}
                                ${config.buttonColors.mainGradient} ${config.textColors.primary} cursor-pointer
                                ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
                                ${config.focusStates.outline} ${focusedIndex === 1 ? config.scaleEffects.focus : ''}`}
                            onClick={() => handleOpenCamera('ordonnance')}

                        >
                            <config.icons.filePrescription className="mr-4 text-4xl" />
                            <p className={`${config.fontSizes.lg} text-center`}>
                                Ordonnance
                            </p>
                        </div>

                        {/* Button 'Carte Vitale' */}
                        <div
                            ref={(el) => (buttonsRef.current[2] = el)}
                            tabIndex={0}
                            className={`w-1/2 h-32 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md}
                                ${config.buttonColors.mainGradient} ${config.textColors.primary} cursor-pointer
                                ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
                                ${config.focusStates.outline} ${focusedIndex === 2 ? config.scaleEffects.focus : ''}`}
                            onClick={() => handleOpenCamera('carte_vitale')}
                        >
                            <config.icons.addressCard className="mr-4 text-4xl" />
                            <p className={`${config.fontSizes.lg} text-center`}>
                                Carte Vitale
                            </p>
                        </div>

                        {/* Button 'Carte d'Identité' */}
                        <div
                            ref={(el) => (buttonsRef.current[3] = el)}
                            tabIndex={0}
                            className={`w-1/2 h-32 flex items-center justify-center ${config.borderRadius.lg} ${config.shadows.md}
                                ${config.buttonColors.mainGradient} ${config.textColors.primary} cursor-pointer
                                ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
                                ${config.focusStates.outline} ${focusedIndex === 3 ? config.scaleEffects.focus : ''}`}
                            onClick={() => handleOpenCamera('carte_identite')}
                        >
                            <config.icons.idCard className="mr-4 text-4xl" />
                            <p className={`${config.fontSizes.lg} text-center`}>
                                Carte d'Identité
                            </p>
                        </div>
                    </div>
                </div>

                {isModalOpen && showCamera && (
                    <ModalCamera onClose={closeModal}>
                        <CameraComponent onPhotoCapture={handlePhotoCaptured} />
                    </ModalCamera>
                )}
                {showCINOptions && (
                    <ModalCINChoice
                        onClose={() => setShowCINOptions(false)}
                        onSelect={handleCINSideSelection}
                    />
                )}
            </div>
        </>
    );

}

export default DocumentsChecking;
