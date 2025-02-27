import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

function DrugUnavailable() {

  const navigate = useNavigate()
  const location = useLocation()

  return (

    <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

        {/* Header */}
        <div className="w-4/5 h-48 flex justify-center items-center mb-8 mt-10">
            {/* Logo */}
            <div className="flex justify-center items-center w-full">
                <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
            </div>
        </div>

        {/* Rectangle message d'information */}
        <div className="w-3/4 bg-background_color p-8 rounded-xl text-center mb-12">
            <p className="text-5xl text-gray-800">
              Le médicament que vous voulez n'est plus disponible.<br />
              Voici nos propositions pour résoudre ce problème:
            </p>
        </div>

        {/* Container pour center les 2 boutons */}
          <div className="flex flex-col items-center space-y-16 w-full">
      
              {/* Bouton 'Commander plus tard' */}
              <div 
                tabIndex={0} 
                onClick={() => navigate('/' + (location.state?.from ?? '#'))} 
                className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl cursor-pointer
                    transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                    hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500">
                Commander le médicament et le récupérer plus tard
              </div>
      
              {/* Bouton 'Liste des pharmacies' */}
              <div onClick={() => navigate('/drug-stores-available', {state: {from: 'drug-unavailable'}})}
               className="w-full flex justify-center">
                <div tabIndex={0}
                className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
                    transition-transform duration-500 hover:from-[#d45b93] cursor-pointer
                    hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500">
                  Liste des pharmacies possédant le médicament
                </div>
              </div>
      
          </div>
    </div>
  );
}

export default DrugUnavailable;
