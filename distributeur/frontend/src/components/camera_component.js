import React, { useEffect, useRef, useState } from 'react';

const CameraComponent = ({ onPhotoCapture }) => {
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
        }
    };

    const handleRetakePhoto = () => {
        setImage(null);
        setIsPhotoTaken(false);
        startCamera();
    };

    const handleValidatePhoto = () => {
        if (image) {
            onPhotoCapture(image);
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {isPhotoTaken ? (
                <div className="relative w-[95%] h-[96%] flex flex-col items-center">
                    <div className="w-[87%] h-[87%] flex justify-center items-center">
                        <img src={image} alt="Captured" className="w-full h-full object-contain rounded-xl shadow-lg" />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-8 mt-6">
                        <button 
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md" 
                            onClick={handleRetakePhoto}
                        >
                            Prendre une autre photo
                        </button>
                        <button 
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md" 
                            onClick={handleValidatePhoto}
                        >
                            OK
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-[95%] h-[96%] flex flex-col items-center">
                    <div className="w-[87%] h-[87%] flex justify-center items-center">
                        <video ref={videoRef} autoPlay className="w-full h-full transform scale-x-[-1] rounded-xl shadow-lg" />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-8 mt-6">
                        <button 
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-lg font-semibold rounded-lg 
                            shadow-md" 
                            onClick={capturePhoto}
                        >
                            Prendre une photo
                        </button>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
};

export default CameraComponent;
