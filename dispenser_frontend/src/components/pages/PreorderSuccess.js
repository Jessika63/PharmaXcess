import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config';

function PreorderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile;

  return (
    <div style={{ backgroundColor: '#F8E6EA' }} className="min-h-screen w-full flex flex-col items-center justify-start">
      {/* Header */}
      <div className="w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cart')}
            className="text-black text-lg flex items-center gap-3"
          >
            <config.icons.arrowLeft />
            <span className="text-xl font-semibold">Commander et récupérer plus tard</span>
          </button>
        </div>
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-8 mr-4" />
      </div>

      {/* Content */}
      <div className="w-full flex flex-col items-center justify-center mt-12 px-6">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6">
          <config.icons.check className="text-2xl text-black" />
        </div>

        <h2 className="text-2xl font-bold text-black mb-4">Scan terminé</h2>
        <p className="text-center text-black max-w-2xl mb-8">
          Nous avons bien récupéré vos informations, nous vous recontacterons lorsque votre commande sera disponible
        </p>

        <button
          onClick={() => navigate('/non-prescription-drugs')}
          className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300"
        >
          TERMINER
        </button>
      </div>
    </div>
  );
}

export default PreorderSuccess;
