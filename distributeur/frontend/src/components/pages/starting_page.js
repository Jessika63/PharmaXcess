import React, { useRef, useEffect } from "react";
import { Link } from 'react-router-dom';

function StartingPage() {

  const prescriptionButtonRef = useRef(null);
  const nonPrescriptionButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        nonPrescriptionButtonRef.current.focus();
      } else if (event.key === "ArrowLeft") {
        prescriptionButtonRef.current.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-background_color w-full h-screen flex flex-col justify-center items-center">

      {/* Header */}
      <div className="w-4/5 h-48 flex justify-center items-center mb-20">
            {/* Logo */}
            <div className="flex justify-center items-center w-full">
                <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
            </div>
        </div>

      {/* Centering buttons container */}
      <div className="flex flex-col items-center space-y-28 w-full">

        {/* Button 'Médicaments sous ordonnance' */}
        <Link to="/documents-checking" className="w-full flex justify-center">
          <div ref={prescriptionButtonRef} tabIndex={0} 
          className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
              transition-transform duration-500 hover:from-[#d45b93] focus:ring-opacity-50
              hover:to-[#e65866] hover:scale-105 focus:ring-4 focus:ring-pink-500">
            Médicaments sous ordonnance
          </div>
        </Link>

        {/* Button 'Médicaments sans ordonnance' */}
        <Link to="/non-prescription-drugs" className="w-full flex justify-center">
          <div ref={nonPrescriptionButtonRef} tabIndex={0}
          className="w-1/2 h-72 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-5xl
              transition-transform duration-500 hover:from-[#d45b93]
              hover:to-[#e65866] hover:scale-105 focus:ring-2 focus:ring-pink-500">
            Médicaments sans ordonnance
          </div>
        </Link>

      </div>

    </div>
  );
}

export default StartingPage;
