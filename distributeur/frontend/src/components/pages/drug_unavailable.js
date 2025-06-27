import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

function DrugUnavailable() {

  const navigate = useNavigate()
  const location = useLocation()

  const order_later = useRef(null);
  const drug_store_list = useRef(null);
  
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    }
  };

  useEffect(() => {
    if (focusedIndex === 0 && order_later.current) {
      order_later.current.focus();
    } else if (focusedIndex === 1 && drug_store_list.current) {
      drug_store_list.current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useInactivityRedirect(() => setShowInactivityModal(true));
  useEffect(() => {
    if (!showInactivityModal) return;
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  const goToDrugStores = (event) => {
    event.stopPropagation();
    setTimeout(() => {
      navigate('/drug-stores-available', { state: { from: 'drug-unavailable' } });
    }, 100); 
  };  

  return (
    <>
      {showInactivityModal && (
        <ModalStandard onClose={() => setShowInactivityModal(false)}>
          <div className="text-3xl font-bold mb-4">Inactivité détectée</div>
          <div className="text-xl mb-4">Vous allez être redirigé vers l'accueil dans 1 minute...</div>
          <button className="px-8 py-4 bg-white text-pink-500 text-2xl rounded-xl shadow hover:scale-105 transition-transform duration-300" onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
        </ModalStandard>
      )}
      <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

        {/* Header */}
        <div className="w-4/5 h-36 flex justify-center items-center mt-4">
            {/* Logo */}
            <div className="flex justify-center items-center w-full">
                <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-76 h-24" />
            </div>
        </div>

        {/* Container Information Message */}
        <div className="w-2/3 bg-background_color p-2 rounded-xl text-center mb-6">
            <p className="text-3xl text-gray-800">
              Le médicament que vous voulez n'est plus disponible.<br />
              Voici nos propositions pour résoudre ce problème:
            </p>
        </div>

        {/* Container for centering both buttons */}
        <div className="flex flex-col items-center space-y-10 w-full">
      
            {/* Button 'Commander plus tard' */}
            <button
                tabIndex={0}
                ref={order_later}
                onClick={() => navigate('/' + (location.state?.from ?? '#'))}
                className={`w-2/5 h-36 flex items-center justify-center text-center rounded-2xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-3xl cursor-pointer
                    transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
                    hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500
                    ${focusedIndex === 0 ? 'scale-105' : ''}`}
            >
                <FaClock className="mr-4" />
                Commander le médicament et le récupérer plus tard
            </button>
      
            {/* Button 'Liste des pharmacies' */}
            <button
                onClick={goToDrugStores}
                tabIndex={0}
                ref={drug_store_list}
                className={`w-2/5 h-36 flex items-center justify-center text-center rounded-2xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-3xl
                    transition-transform duration-500 hover:from-[#d45b93] cursor-pointer
                    hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500
                    ${focusedIndex === 1 ? 'scale-105' : ''}`}
            >
                <FaMapMarkerAlt className="mr-4" />
                Liste des pharmacies possédant le médicament
            </button>

        </div>
    </div>
    </>
  );

}

export default DrugUnavailable;
