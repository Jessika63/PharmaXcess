import React, { useEffect, useRef } from 'react';

const QrCameraScanner = ({ onFrame, scanInterval = 900, overlaySize = 320 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;

          canvas.width = vw;
          canvas.height = vh;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, vw, vh);

          // Crop center square roughly overlaySize px wide relative to video size
          const size = Math.min(vw, vh, overlaySize);
          const sx = Math.floor((vw - size) / 2);
          const sy = Math.floor((vh - size) / 2);
          const imageData = ctx.getImageData(sx, sy, size, size);

          // Create a blob from the cropped area
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = size;
          tmpCanvas.height = size;
          const tctx = tmpCanvas.getContext('2d');
          tctx.putImageData(imageData, 0, 0);
          tmpCanvas.toBlob((blob) => {
            if (blob) onFrame(blob);
          }, 'image/jpeg', 0.8);
        }, scanInterval);
      } catch (err) {
        console.error('Could not start camera', err);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onFrame, scanInterval, overlaySize]);

  return (
    <div className="w-full flex items-center justify-center relative">
      <div className="relative" style={{ width: overlaySize, height: overlaySize }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-md"
          playsInline
          muted
        />

        {/* Canvas used for frame capture (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay: square with four corner marks */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox={`0 0 ${overlaySize} ${overlaySize}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100%" height="100%" fill="none" />
            {/* Four corner marks */}
            <g stroke="#ffffff" strokeWidth="4">
              <path d={`M6 40 V6 H40`} strokeLinecap="round" />
              <path d={`M${overlaySize - 6} 40 V6 H${overlaySize - 40}`} strokeLinecap="round" />
              <path d={`M6 ${overlaySize - 40} V${overlaySize - 6} H40`} strokeLinecap="round" />
              <path d={`M${overlaySize - 6} ${overlaySize - 40} V${overlaySize - 6} H${overlaySize - 40}`} strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default QrCameraScanner;
