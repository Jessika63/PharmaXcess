import React from 'react';

const ModalCamera = ({ children, onClose }) => {
    return (
        <div>
            {/* Darkened Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-20 z-50" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div 
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                w-full max-w-5xl h-1/2 max-h-full bg-gradient-to-b from-pink-500 to-rose-400 
                text-gray-800 flex flex-col justify-center items-center 
                rounded-2xl shadow-lg p-6 z-50"
            >
                {children} {/* Modal Content */}
            </div>
        </div>
    );
};

export default ModalCamera;
