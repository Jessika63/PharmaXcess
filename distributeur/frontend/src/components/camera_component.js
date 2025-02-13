import React, { useEffect, useRef, useState } from 'react';
import '../App.css';

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
            const currentVideoRef = videoRef.current;

            if (currentVideoRef && currentVideoRef.srcObject) {
                const tracks = currentVideoRef.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');

            ctx.save();
            ctx.scale(-1, 1); // image mirroring
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            const imageSrc = canvas.toDataURL('image/png');
            setImage(imageSrc);
            setIsPhotoTaken(true);

            onPhotoCapture(imageSrc);
        }
    };

    const handleRetakePhoto = () => {
        setImage(null);
        setIsPhotoTaken(false);
        startCamera();
    };

    return (
        <div style={{ position: 'relative', width: '265%', height: '78%'
            , top: '9%', left: '-85%'
         }}>
            {isPhotoTaken ? (
                <div style={{position: 'relative', top: '1%'
                    , width: '95%', height: '96%', left: '2%'}}>
                    <div style={{position: 'relative', width: '87%', height: '87%'
                        , left: '10%', top: '1%'
                    }}>
                        <img src={image} alt="Captured" style={{ width: '100%', height: '100%'
                            , objectFit: 'contain'
                         }} />
                    </div>
                    <div
                    className='rectangle'
                    style={{ cursor: 'pointer', width: '20%', height: '10%', left: '37.5%', top: '13%' }}
                    onClick={handleRetakePhoto}>
                        Prendre une autre photo
                    </div>
                    <div
                    className='rectangle'
                    style={{ cursor: 'pointer', width: '20%', height: '10%', left: '67.5%', top: '3%' }}
                    onClick={handleRetakePhoto}>
                        Ok
                    </div>
                </div>
            ) : (
                <div style={{position: 'relative', top: '1%'
                    , width: '95%', height: '96%', left: '2%'}}>
                    <div style={{position: 'relative', width: '87%', height: '87%'
                        , left: '10%', top: '1%'
                    }}>
                        <video ref={videoRef} autoPlay style={
                            { transform: 'scaleX(-1)', width: '100%', height: '100%' }}/>
                    </div>
                    <div
                    className='rectangle'
                    style={{ cursor: 'pointer', width: '20%', height: '10%', left: '37.5%', top: '13%' }}
                    onClick={capturePhoto}>
                        Prendre une photo
                    </div>
                    <div
                    className='rectangle'
                    style={{ cursor: 'pointer', width: '20%', height: '10%', left: '67.5%', top: '3%' }}
                    onClick={capturePhoto}>
                        Ok
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}
        </div>
    );
};

export default CameraComponent;
