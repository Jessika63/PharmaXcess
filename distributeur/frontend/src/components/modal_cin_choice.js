import React, { useState, useEffect, useCallback, useRef } from 'react';
import config from '../config';

function ModalCINChoice({ children, onClose, onSelect }) {
    // 0: Recto, 1: Verso, 2: Close
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = [useRef(null), useRef(null), useRef(null)];
    const justOpened = useRef(true);

    const handleKeyDown = useCallback((event) => {
        // Only handle keys if modal is focused
        if (["ArrowRight", "ArrowLeft", "Enter", "Escape", "Tab"].includes(event.key)) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (event.key === "ArrowRight") {
            setFocusedIndex((prevIndex) => (prevIndex < 2 ? prevIndex + 1 : 0));
        } else if (event.key === "ArrowLeft") {
            setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 2));
        } else if (event.key === "Enter") {
            if (!justOpened.current) {
                if (focusedIndex === 0) {
                    onSelect('recto');
                } else if (focusedIndex === 1) {
                    onSelect('verso');
                } else if (focusedIndex === 2) {
                    onClose();
                }
            }
        } else if (event.key === "Escape") {
            onClose();
        }
    }, [focusedIndex, onSelect, onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown, true);
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        // Focus the button when focusedIndex changes
        if (buttonRefs[focusedIndex].current) {
            buttonRefs[focusedIndex].current.focus();
        }
        if (justOpened.current) {
            justOpened.current = false;
        }
    }, [focusedIndex]);

    useEffect(() => {
        justOpened.current = true;
        setFocusedIndex(0);
    }, []);

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            {/* Darkened Overlay */}
            <div 
                className={`fixed inset-0 ${config.modalStyles.overlay}`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`${config.modalStyles.content} ${config.padding.modal}`}>
                {/* Close Button */}
                <button
                    ref={buttonRefs[2]}
                    onClick={onClose}
                    className={`absolute top-4 right-4 flex items-center gap-2 ${config.buttonColors.red} ${config.buttonColors.redHover} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${config.focusStates.outline} px-6 py-2 ${focusedIndex === 2 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}`}
                    tabIndex={-1}
                >
                    <config.icons.times className="text-xl" />
                    <span className="font-bold">Fermer</span>
                </button>

                {/* Title */}
                <div className={`${config.fontSizes.lg} font-bold mb-8 text-center`}>
                    Choisissez le côté de votre carte d'identité
                </div>

                {/* Buttons Container */}
                <div className="flex space-x-8">
                    {/* Button Recto */}
                    <div
                        ref={buttonRefs[0]}
                        className={`w-48 h-24 flex flex-col items-center justify-center
                            ${config.borderRadius.lg}
                            ${config.shadows.md}
                            ${config.buttonColors.white}
                            cursor-pointer
                            ${config.transitions.slow}
                            ${config.scaleEffects.hover}
                            ${config.focusStates.outline}
                            ${focusedIndex === 0 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}
                        `}
                        onClick={() => onSelect('recto')}
                        tabIndex={-1}
                    >
                        <config.icons.idCard className="text-4xl mb-2" />
                        <p className={`${config.fontSizes.lg} text-center`}>Recto</p>
                    </div>

                    {/* Button Verso */}
                    <div
                        ref={buttonRefs[1]}
                        className={`w-48 h-24 flex flex-col items-center justify-center
                            ${config.borderRadius.lg}
                            ${config.shadows.md}
                            ${config.buttonColors.white}
                            cursor-pointer
                            ${config.transitions.slow}
                            ${config.scaleEffects.hover}
                            ${config.focusStates.outline}
                            ${focusedIndex === 1 ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}
                        `}
                        onClick={() => onSelect('verso')}
                        tabIndex={-1}
                    >
                        <config.icons.addressCard className="text-4xl mb-2" />
                        <p className={`${config.fontSizes.lg} text-center`}>Verso</p>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}

export default ModalCINChoice;
