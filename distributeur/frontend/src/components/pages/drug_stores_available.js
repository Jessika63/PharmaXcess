import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const drug_shops = [
  { id: 1, label: 'Pharmacie 1' },
  { id: 2, label: 'Pharmacie 2' },
  { id: 3, label: 'Pharmacie 3' },
  { id: 4, label: 'Pharmacie 4' },
  { id: 5, label: 'Pharmacie 5' },
  { id: 6, label: 'Pharmacie 6' },
  { id: 7, label: 'Pharmacie 7' },
  { id: 8, label: 'Pharmacie 8' },
  { id: 9, label: 'Pharmacie 9' },
];

function DrugStoresAvailable() {
  const location = useLocation();

  return (
    <div className="w-full h-screen flex flex-col items-center bg-background_color p-8">

      {/* Header */}
      <div className="w-4/5 flex justify-between items-center mb-24 mt-16">
        {/* Go Back */}
        <Link to={'/' + location.state.from} className="text-4xl bg-gradient-to-r from-pink-500 to-rose-400 
            px-24 py-10 rounded-2xl shadow-lg hover:scale-x-105 transition-transform duration-300">
          Retour
        </Link>

        {/* Logo */}
        <div className="flex-grow flex justify-center pr-72">
          <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
        </div>
      </div>

      {/* Main message */}
      <div className="w-2/3 h-48 flex items-center justify-center text-center text-gray-800 text-5xl 
        bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300 mb-24">
        Voici la liste des pharmacies disposant du médicament souhaité :
      </div>

      {/* List of pharmacies */}
      <div className="w-4/5 h-[50vh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200">
        <div className="grid grid-cols-1 gap-6 place-items-center">
          {drug_shops.map((item) => (
            <div key={item.id}
              className="w-1/2 h-28 flex items-center justify-center text-4xl text-gray-800
              bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              {item.label}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default DrugStoresAvailable;
