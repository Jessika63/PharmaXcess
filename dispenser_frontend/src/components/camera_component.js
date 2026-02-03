import React, { useEffect, useRef, useState } from 'react';
import { FaCamera, FaRedo, FaCheck } from 'react-icons/fa';
import config from '../config';

const CameraComponent = ({ onPhotoCapture, onClose, focusedButtonIndex, setFocusedButtonIndex }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);
    const [internalFocusedButtonIndex, setInternalFocusedButtonIndex] = useState(0); 

    // Use internal state if props are not provided 
    const currentFocusedIndex = focusedButtonIndex !== undefined ? focusedButtonIndex : internalFocusedButtonIndex;
    const setCurrentFocusedIndex = setFocusedButtonIndex || setInternalFocusedButtonIndex;

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing the camera", error);
        }
    };

    useEffect(() => {
        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            const imageSrc = canvas.toDataURL('image/png');
            setImage(imageSrc);
            setIsPhotoTaken(true);
            setCurrentFocusedIndex(0); // Reset focus to first button after photo is taken
        }
    };

    const handleRetakePhoto = () => {
        setImage(null);
        setIsPhotoTaken(false);
        setCurrentFocusedIndex(0); 
        startCamera();
    };

    const handleValidatePhoto = () => {
        if (image) {
            onPhotoCapture(image);
        }
    };

    const handleClose = () => {
        onClose();
    };

    // Get the total number of buttons based on current state
    const getTotalButtons = () => {
        if (!isPhotoTaken) {
            return 1; // Take photo button only
        } else {
            return 2; // Retake + OK 
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (["ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
            }

            const totalButtons = getTotalButtons();

            if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
                setCurrentFocusedIndex((prev) => (prev + 1) % totalButtons);
            } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
                setCurrentFocusedIndex((prev) => (prev - 1 + totalButtons) % totalButtons);
            } else if (event.key === "Enter") {
                if (!isPhotoTaken) {
                    if (currentFocusedIndex === 0) { // Take photo button
                        capturePhoto(); 
                    }
                } else {
                    if (currentFocusedIndex === 0) { // Retake photo button
                        handleRetakePhoto();
                    } else if (currentFocusedIndex === 1) { // OK button 
                        handleValidatePhoto();
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [isPhotoTaken, currentFocusedIndex]); 

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {isPhotoTaken ? (
                <div className="relative w-[95%] h-[96%] flex flex-col items-center">
                    <div className="w-[87%] h-[87%] flex justify-center items-center">
                        <img src={image} alt="Captured" className="w-full h-full object-contain rounded-xl shadow-lg" />
                    </div>

                    <div className="flex justify-center gap-8 mt-6">
                        <button
                            className={`px-12 py-4 bg-black text-white text-lg font-semibold rounded-full
                            shadow-md hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentFocusedIndex === 0 ? 'scale-110 ring-2 ring-pink-300' : ''}`}
                            onClick={handleRetakePhoto}
                            tabIndex={currentFocusedIndex === 0 ? 0 : -1}
                        >
                            REPRENDRE 
                        </button>
                        <button
                            className={`px-12 py-4 bg-black text-white text-lg font-semibold rounded-full
                            shadow-md hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentFocusedIndex === 1 ? 'scale-110 ring-2 ring-pink-300' : ''}`}
                            onClick={handleValidatePhoto}
                            tabIndex={currentFocusedIndex === 1 ? 0 : -1}
                        >
                            VALIDER 
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-[95%] h-[96%] flex flex-col items-center">
                    <div className="w-[87%] h-[87%] flex justify-center items-center">
                        <video ref={videoRef} autoPlay className="w-full h-full transform scale-x-[-1] rounded-xl shadow-lg" />
                    </div>

                    <div className="flex justify-center gap-8 mt-6">
                        <button
                            className={`px-12 py-4 bg-black text-white text-lg font-semibold rounded-full
                            shadow-md hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentFocusedIndex === 0 ? 'scale-110 ring-2 ring-pink-300' : ''}`}
                            onClick={capturePhoto}
                            tabIndex={currentFocusedIndex === 0 ? 0 : -1}
                        >
                            PRENDRE UNE PHOTO 
                        </button>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
};

export default CameraComponent;
