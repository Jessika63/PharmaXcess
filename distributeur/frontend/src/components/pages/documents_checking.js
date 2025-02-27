import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './css/documents_checking.css'
import CameraComponent from '../camera_component';
import ModalCamera from '../modal_camera';

function DocumentsChecking() {

    const [showCamera, setShowCamera] = useState(false);
    // const [image, setImage] = useState(null);
    // const [isPhotoTaken, setIsPhotoTaken] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenCamera = () => {
        setShowCamera(true);
        setIsModalOpen(true);
    };

    // const handlePhotoCapture = (capturedImage) => {
    //     setImage(capturedImage);
    //     setIsPhotoTaken(true);
    // };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowCamera(false);
    };

    return (
        <div className="bg-background_color w-full h-screen flex flex-col items-center">

            {/* Header */}
            <div className="w-4/5 h-48 flex justify-between items-center mb-8 mt-16">
                {/* Retour */}
                <Link to="/" className="text-4xl bg-gradient-to-r from-pink-500 to-rose-400 
                    px-24 py-10 rounded-2xl shadow-lg hover:scale-105 transition">
                    Retour
                </Link>

                {/* Logo */}
                <div className="flex-grow flex justify-center pr-72">
                    <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
                </div>

            </div>

            {/* Main Content */}
            <div className="w-2/3 h-2/3 flex flex-col items-center mt-24 space-y-24">
                <div className="w-2/3 h-72 flex items-center justify-center rounded-3xl shadow-lg 
                    bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 transition-transform duration-500
                    hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105">
                    <p className="text-5xl text-center">
                        Veuillez insérer les documents :<br/>
                        Ordonnance, Carte Vitale, Carte d’Identité
                    </p>
                </div>

                <div className="w-full flex space-x-12">
                    <div className="w-3/4 h-48 flex items-center justify-center rounded-3xl shadow-lg 
                        bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 cursor-pointer
                        transition-transform duration-500 hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105"
                        onClick={handleOpenCamera}>
                        <p className="text-5xl text-center">Ordonnance</p>
                    </div>

                    <div className="w-3/4 h-48 flex items-center justify-center rounded-3xl shadow-lg 
                        bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 cursor-pointer
                        transition-transform duration-500 hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105"
                        onClick={handleOpenCamera}>
                        <p className="text-5xl text-center">Carte Vitale</p>
                    </div>

                    <div className="w-3/4 h-48 flex items-center justify-center rounded-3xl shadow-lg 
                        bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 cursor-pointer
                        transition-transform duration-500 hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105"
                        onClick={handleOpenCamera}>
                        <p className="text-5xl text-center">Carte d'Identité</p>
                    </div>
                    </div>
                </div>

            {isModalOpen && showCamera && (
                <ModalCamera onClose={closeModal}>
                <CameraComponent onPhotoCapture={closeModal} />
                </ModalCamera>
            )}
        </div>
    );
}

export default DocumentsChecking;
