import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function DrugStoresAvailable() {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [enterPressed, setEnterPressed] = useState(false);
  const buttonsRef = useRef([]);

  const handleKeyDown = (event) => {
    console.log('focusedindex = ', focusedIndex);
    event.stopPropagation();

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, drug_shops.length));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      setEnterPressed(true);
    }
  };

  useEffect(() => {
    if (enterPressed) {
      if (focusedIndex === 0) {
        navigate('/' + (location.state?.from || ''));
      } else {
        alert(`Vous avez sélectionné : ${drug_shops[focusedIndex - 1].label}`);
      }
      setEnterPressed(false);
    }
  }, [enterPressed, focusedIndex, location.state, navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (buttonsRef.current[focusedIndex]) {
      buttonsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  return (
    <div
      className="w-full h-screen flex flex-col items-center bg-background_color p-8"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="w-4/5 flex justify-between items-center mb-12 mt-8">
        <Link
          to={'/' + (location.state?.from || '')}
          ref={(el) => (buttonsRef.current[0] = el)}
          tabIndex={0}
          className={`text-4xl bg-gradient-to-r from-pink-500 to-rose-400 px-14 
            py-8 rounded-2xl shadow-lg hover:scale-105 transition-transform 
            duration-300 focus:outline-none ${focusedIndex === 0 ? 'scale-105' : ''}`}
          onClick={(e) => e.preventDefault()}
        >
          Retour
        </Link>

        <div className="flex-grow flex justify-center pr-16">
            <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
        </div>
      </div>

      {/* Main message */}
      <div
        className="w-2/3 h-32 flex items-center justify-center text-center text-gray-800 text-3xl 
        bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 mb-12"
      >
        Voici la liste des pharmacies disposant du médicament souhaité :
      </div>

      {/* List of pharmacies */}
      <div
        className="w-4/5 h-[50vh] overflow-y-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200"
        tabIndex={0}
      >
        <div className="grid grid-cols-1 gap-4 place-items-center">
          {drug_shops.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => (buttonsRef.current[index + 1] = el)}
              tabIndex={0}
              className={`w-2/5 h-20 flex items-center justify-center text-2xl text-gray-800
              bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl shadow-lg
              hover:scale-105 transition-transform duration-300 cursor-pointer
              ${focusedIndex === index + 1 ? 'scale-105 ring-4 ring-pink-300' : ''}`}
              onClick={(event) => {
                event.preventDefault();
                alert(`Vous avez sélectionné : ${item.label}`);
              }} 
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DrugStoresAvailable;
