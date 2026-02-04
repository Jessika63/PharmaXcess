import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { FaRegFileAlt, FaRegPlayCircle } from 'react-icons/fa';

function HelpMenu() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-background_color relative">
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
        <h1 className="ml-2 text-3xl font-bold text-black tracking-tight">Aide</h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 -mt-16">
        <p className="text-xl font-semibold text-black mb-12">Choisissez le type de guide</p>
        <div className="flex flex-row justify-center items-stretch gap-8 w-full px-12">
        {/* Card Guide utilisateur textuel */}
        <div
          className="flex-1 max-w-md h-64 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
          onClick={() => navigate('/user-guide-text')}
        >
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <FaRegFileAlt className="text-3xl text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-center mb-2">Guide utilisateur textuel</p>
          <p className="text-sm text-gray-500 text-center">Instructions détaillées étape par étape</p>
        </div>
        {/* Card Guide utilisateur vidéo */}
        <div
          className="flex-1 max-w-md h-64 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
          onClick={() => navigate('/user-guide-video')}
        >
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <FaRegPlayCircle className="text-3xl text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-center mb-2">Guide utilisateur vidéo</p>
          <p className="text-sm text-gray-500 text-center">Voir le tutoriel en vidéo</p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default HelpMenu;
