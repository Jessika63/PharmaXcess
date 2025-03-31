import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

function PaymentFailed() {

  const navigate = useNavigate()
  const location = useLocation()

  const retryButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    }
  };

  useEffect(() => {
    if (focusedIndex === 0 && retryButtonRef.current) {
      retryButtonRef.current.focus();
    } else if (focusedIndex === 1 && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

        {/* Header */}
        <div className="w-4/5 h-48 flex justify-center items-center mb-12 mt-10">
            {/* Logo */}
            <div className="flex justify-center items-center w-full">
                <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
            </div>
        </div>

        {/* Rectangle message d'information */}
        <div className="w-3/4 bg-background_color p-8 rounded-xl text-center mb-20">
            <p className="text-5xl text-gray-800">
                Le paiement a échoué, voulez-vous réessayer ou annuler la transaction ?
            </p>
        </div>

        {/* Container pour center les 2 boutons */}
          <div className="flex flex-col items-center space-y-20 w-full">
      
              {/* Bouton 'Réessayer' */}
              <div tabIndex={0}
              ref={retryButtonRef}
              onClick={() => navigate('/' + (location.state.from || '/#'))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate('/' + (location.state.from || '/#'))
                }
            }}
              className={`w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                  bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl cursor-pointer
                  transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                  hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500
                  ${focusedIndex === 0 ? 'scale-105' : ''}`}>
                Réessayer
              </div>
      
              {/* Bouton 'Annuler la commande' */}
              <Link to="/#" ref={cancelButtonRef} className="w-full flex justify-center">
                <div tabIndex={0}
                className={`w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
                    transition-transform duration-500 hover:from-[#d45b93]
                    hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500
                    ${focusedIndex === 1 ? 'scale-105' : ''}`}>
                  Annuler la commande
                </div>
              </Link>
      
          </div>
    </div>
  );
}

export default PaymentFailed;
