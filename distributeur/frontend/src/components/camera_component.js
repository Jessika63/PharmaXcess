import React, { useEffect, useRef, useState } from 'react';
import { FaCamera, FaRedo, FaCheck } from 'react-icons/fa';
import config from '../config';

const CameraComponent = ({ onPhotoCapture, onClose, focusedButtonIndex, setFocusedButtonIndex }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);

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
            setFocusedButtonIndex(0); // Reset focus to first button after photo is taken
        }
    };

    const handleRetakePhoto = () => {
        setImage(null);
        setIsPhotoTaken(false);
        setFocusedButtonIndex(0);
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
            return 2; // Take photo + Close
        } else {
            return 3; // Retake + OK + Close
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
            }

            const totalButtons = getTotalButtons();

            if (event.key === "ArrowRight") {
                setFocusedButtonIndex((prev) => (prev + 1) % totalButtons);
            } else if (event.key === "ArrowLeft") {
                setFocusedButtonIndex((prev) => (prev - 1 + totalButtons) % totalButtons);
            } else if (event.key === "Enter") {
                if (!isPhotoTaken) {
                    if (focusedButtonIndex === 0) { // Take photo button
                        capturePhoto();
                    } else if (focusedButtonIndex === 1) { // Close button
                        handleClose();
                    }
                } else {
                    if (focusedButtonIndex === 0) { // Retake photo button
                        handleRetakePhoto();
                    } else if (focusedButtonIndex === 1) { // OK button
                        handleValidatePhoto();
                    } else if (focusedButtonIndex === 2) { // Close button
                        handleClose();
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [isPhotoTaken, focusedButtonIndex]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {isPhotoTaken ? (
                <div className="relative w-[95%] h-[96%] flex flex-col items-center">
                    <div className="w-[87%] h-[87%] flex justify-center items-center">
                        <img src={image} alt="Captured" className="w-full h-full object-contain rounded-xl shadow-lg" />
                    </div>

                    <div className="flex justify-center gap-8 mt-6">
                        <button 
                            className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md transition-transform duration-300 ${focusedButtonIndex === 0 ? 'scale-110' : ''}`} 
                            onClick={handleRetakePhoto}
                            tabIndex={focusedButtonIndex === 0 ? 0 : -1}
                        >
                            <FaRedo className="mr-2" />
                            Prendre une autre photo
                        </button>
                        <button 
                            className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md transition-transform duration-300 ${focusedButtonIndex === 1 ? 'scale-110' : ''}`} 
                            onClick={handleValidatePhoto}
                            tabIndex={focusedButtonIndex === 1 ? 0 : -1}
                        >
                            <FaCheck className="mr-2" />
                            OK
                        </button>
                        <button 
                            className={`px-6 py-3 ${config.buttonColors.red} text-lg font-semibold rounded-lg 
                            shadow-md transition-transform duration-300 ${focusedButtonIndex === 2 ? 'scale-110' : ''} ${config.buttonColors.redHover}`} 
                            onClick={handleClose}
                            tabIndex={focusedButtonIndex === 2 ? 0 : -1}
                        >
                            <config.icons.times className="mr-2" />
                            Fermer
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
                            className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md hover:scale-110 transition-transform duration-300 ${focusedButtonIndex === 0 ? 'scale-110' : ''}`}
                            onClick={capturePhoto}
                            tabIndex={focusedButtonIndex === 0 ? 0 : -1}
                        >
                            <FaCamera className="mr-2" />
                            Prendre une photo
                        </button>
                        <button 
                            className={`px-6 py-3 ${config.buttonColors.red} text-lg font-semibold rounded-lg 
                            shadow-md transition-transform duration-300 ${focusedButtonIndex === 1 ? 'scale-110' : ''} ${config.buttonColors.redHover}`} 
                            onClick={handleClose}
                            tabIndex={focusedButtonIndex === 1 ? 0 : -1}
                        >
                            <config.icons.times className="mr-2" />
                            Fermer
                        </button>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
};

export default CameraComponent;