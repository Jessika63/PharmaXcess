import React from 'react';
import { Link } from 'react-router-dom';

function StartingPage() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      
      {/* Container pour center les 2 boutons */}
      <div className="flex flex-col items-center space-y-28 w-full">

        {/* Bouton 'Médicaments sous ordonnance' */}
        <Link to="/documents-checking" className="w-full flex justify-center">
          <div className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
              transition-transform duration-500 hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105">
            Médicaments sous ordonnance
          </div>
        </Link>

        {/* Bouton 'Médicaments sans ordonnance' */}
        <Link to="/non-prescription-drugs" className="w-full flex justify-center">
          <div className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
              transition-transform duration-500 hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105">
            Médicaments sans ordonnance
          </div>
        </Link>

      </div>

    </div>
  );
}

export default StartingPage;
