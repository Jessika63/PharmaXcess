import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRedo } from 'react-icons/fa';

function Preorder() {
  const navigate = useNavigate();
  const goBackButtonRef = useRef(null);

  useEffect(() => {
    if (goBackButtonRef.current) {
      goBackButtonRef.current.focus();
    }
  }, []);

  return (
    <div className="bg-background_color min-h-screen w-full flex flex-col items-center justify-center">
      {/* Go Back Button */}
      <div className="w-4/5 flex items-center mt-6 mb-2">
        <button
          ref={goBackButtonRef}
          tabIndex={0}
          className="text-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none flex items-center ring-4 ring-pink-300 scale-105"
          onClick={() => navigate('/insufficient-stock')}
        >
          <FaRedo className="mr-3" /> Retour
        </button>
      </div>
      {/* Logo */}
      <div className="w-4/5 h-28 flex justify-center items-center mb-4 mt-2">
        <div className="flex justify-center items-center w-full">
          <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-80 h-20" />
        </div>
      </div>
      {/* Coming Soon Message */}
      <div className="w-3/4 bg-background_color p-8 rounded-xl text-center mb-4 flex flex-col items-center">
        <p className="text-4xl text-gray-800 font-bold mb-4">Précommander ou récupérer plus tard</p>
        <p className="text-2xl text-gray-600">Cette fonctionnalité arrive bientôt !</p>
      </div>
    </div>
  );
}

export default Preorder; 