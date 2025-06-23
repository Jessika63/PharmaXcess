import React, { useRef, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { FaPrescriptionBottle, FaPills } from 'react-icons/fa';

function StartingPage() {
  const prescriptionButtonRef = useRef(null);
  const nonPrescriptionButtonRef = useRef(null);
  
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (event.key === "Enter") {
      setFocusedIndex((prevIndex) => {
        if (prevIndex === 0 && prescriptionButtonRef.current) {
          prescriptionButtonRef.current.click();
        } else if (prevIndex === 1 && nonPrescriptionButtonRef.current) {
          nonPrescriptionButtonRef.current.click();
        }
        return prevIndex; // keep unchanged index
      });
    }
  };  

  useEffect(() => {
    console.log('index effect: ', focusedIndex)
    if (focusedIndex === 0 && prescriptionButtonRef.current) {
      prescriptionButtonRef.current.focus();
    } else if (focusedIndex === 1 && nonPrescriptionButtonRef.current) {
      nonPrescriptionButtonRef.current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-background_color w-full min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Header */}
      <div className="w-4/5 h-40 flex justify-center items-center mb-12">
        {/* Logo */}
        <div className="flex justify-center items-center w-full">
          <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-96 h-24" />
        </div>
      </div>

      {/* Container for centering both buttons */}
      <div className="flex flex-col items-center space-y-28 w-full">

        {/* Button 'Médicaments sous ordonnance' */}
        <Link to="/documents-checking" className="w-full flex justify-center">
          <div
            ref={prescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-4xl
              transition-transform duration-500 hover:scale-105 focus:ring-4 focus:ring-pink-500
              ${focusedIndex === 0 ? 'scale-105' : ''}`}
          >
            <FaPrescriptionBottle className="mr-6" />
            Médicaments avec ordonnance
          </div>
        </Link>

        {/* Button 'Médicaments sans ordonnance' */}
        <Link to="/non-prescription-drugs" className="w-full flex justify-center">
          <div
            ref={nonPrescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center rounded-3xl shadow-lg 
              bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 text-4xl
              transition-transform duration-500 hover:scale-105 focus:ring-2 focus:ring-pink-500
              ${focusedIndex === 1 ? 'scale-105' : ''}`}
          >
            <FaPills className="mr-6" />
            Médicaments sans ordonnance
          </div>
        </Link>
  
      </div>
    </div>
  );
  
}

export default StartingPage;
