import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

function UserGuideVideo() {
  const navigate = useNavigate();
  // Remplacer le lien ci-dessous par le QR code ou la vidéo réelle
  return (
    <div className="min-h-screen bg-background_color flex flex-col relative">
      {/* Logo en haut à droite */}
      <div className="absolute top-4 right-8">
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-48 h-auto" />
      </div>
      {/* Header retour + titre */}
      <div className="w-full flex items-center mb-8 mt-8 px-8">
        <button
          className="flex items-center space-x-2 bg-transparent hover:bg-gray-100 rounded-xl px-2 py-1 transition-transform duration-300"
          onClick={() => navigate(-1)}
        >
          <config.icons.arrowLeft className="text-2xl text-black" />
        </button>
        <h1 className="ml-2 text-3xl font-bold text-black tracking-tight">Guide utilisateur vidéo</h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-xl font-semibold text-black mb-6">Scannez le QR code ci-dessous pour accéder à la vidéo d'instruction</p>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center w-auto">
        {/* Remplacer par le QR code réel */}
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=https://pharmaxcess.video.guide" alt="QR Code vidéo" className="w-48 h-48 mb-4" />
        <a href="https://pharmaxcess.video.guide" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ou cliquez ici pour voir la vidéo</a>
      </div>
    </div>
    </div>
  );
}

export default UserGuideVideo;
