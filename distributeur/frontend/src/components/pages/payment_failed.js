import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

function PaymentFailed() {

  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

        {/* Header */}
        <div className="w-4/5 h-48 flex justify-center items-center mb-12 mt-10">
            {/* Logo */}
            <div className="flex justify-center items-center w-full">
                <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
            </div>
        </div>

        {/* Information message rectangle */}
        <div className="w-3/4 bg-gray-100 p-8 rounded-xl shadow-lg text-center mb-20">
            <p className="text-5xl text-gray-800">
                Le paiement a échoué, voulez-vous réessayer ou annuler la transaction ?
            </p>
        </div>

        {/* Centering buttons container */}
          <div className="flex flex-col items-center space-y-20 w-full">
      
              {/* Button 'Réessayer' (retry) */}
              <div tabIndex={0} 
              onClick={() => navigate('/' + (location.state.from || '/#'))}
              className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                  bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl cursor-pointer
                  transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                  hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500">
                Réessayer
              </div>
      
              {/* Button 'Annuler la commande' (cancel) */}
              <Link to="/#" className="w-full flex justify-center">
                <div tabIndex={0}
                className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
                    transition-transform duration-500 hover:from-[#d45b93]
                    hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500">
                  Annuler la commande
                </div>
              </Link>
      
          </div>
    </div>
  );
}

export default PaymentFailed;
