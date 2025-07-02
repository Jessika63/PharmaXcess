import React from 'react';
import config from '../config';

function ModalCINChoice({ children, onClose, onSelect }) {
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            {/* Darkened Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={onClose}
            />

            <div
                className={`z-50 flex flex-col items-center space-y-8
                    ${config.padding.modal}
                    ${config.borderRadius.lg}
                    ${config.shadows.lg}
                    ${config.buttonColors.textBackground}
                    ${config.textColors.primary}
                    ${config.transitions.default}
                `}
            >
                <div className="flex space-x-8">
                    {/* Button Recto */}
                    <div
                        className={`w-48 h-24 flex items-center justify-center
                            ${config.borderRadius.lg}
                            ${config.shadows.md}
                            ${config.buttonColors.mainGradient}
                            cursor-pointer
                            ${config.transitions.slow}
                            ${config.buttonColors.mainGradientHover}
                            ${config.scaleEffects.hover}
                            ${config.focusStates.outline}
                        `}
                        onClick={() => onSelect('recto')}
                        tabIndex={0}
                    >
                        <p className={`${config.fontSizes.lg} text-center`}>Recto</p>
                    </div>

                    {/* Button Verso */}
                    <div
                        className={`w-48 h-24 flex items-center justify-center
                            ${config.borderRadius.lg}
                            ${config.shadows.md}
                            ${config.buttonColors.mainGradient}
                            cursor-pointer
                            ${config.transitions.slow}
                            ${config.buttonColors.mainGradientHover}
                            ${config.scaleEffects.hover}
                            ${config.focusStates.outline}
                        `}
                        onClick={() => onSelect('verso')}
                        tabIndex={0}
                    >
                        <p className={`${config.fontSizes.lg} text-center`}>Verso</p>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}

export default ModalCINChoice;
