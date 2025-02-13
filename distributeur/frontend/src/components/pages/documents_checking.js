import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './css/documents_checking.css'
import CameraComponent from '../camera_component';
import ModalCamera from '../modal_camera';

function DocumentsChecking() {

    const [showCamera, setShowCamera] = useState(false);
    const [image, setImage] = useState(null);
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenCamera = () => {
        setShowCamera(true);
        setIsModalOpen(true);
    };

    const handlePhotoCapture = (capturedImage) => {
        setImage(capturedImage);
        setIsPhotoTaken(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowCamera(false);
    };

    return (
        <div className="dc_App">

            {/* header container */}
            <div className="dc_header_container">

                {/* Rectangle 'go back rectangle' */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="rectangle dc_back_button" style={{cursor: 'pointer'}}>
                        <p style={{ fontSize: '2.5em' }}>Retour</p>
                    </div>
                </Link>

                {/* logo container */}
                <div className="dc_logo_container">
                    {/* logo PharmaXcess */}
                    <img
                        src={require('./../../assets/logo.png')}
                        alt="Logo PharmaXcess"
                        className="logo"
                    />
                </div>

            </div>

            <div className='dc_body_page'>

                {/* Rectangle 'main rectangle' */}
                <div className="rectangle" style={{top: '20%', left: '50%'}}>
                    <p style={{ fontSize: '3em', textAlign: 'center' }}>
                    Veuillez insérer les documents <br/>
                    suivants : ordonnance, carte vitale <br/>
                    et carte d’identité
                    </p>
                </div>

                {/* insertion buttons group */}
                <div style={{position: 'relative', top: '10%'
                    , width: '100%', height: '45%', display: 'flex'}}>

                    {/* Rectangle 'Ordonnance' */}
                    <div className="rectangle" style={{position: 'relative', height: '50%'
                        , width: '22%', top: '50%', left: '17%', cursor: 'pointer'}}
                        onClick={handleOpenCamera}>
                        <p style={{ fontSize: '3em' }}>
                            Ordonnance
                        </p>
                    </div>

                    {/* Rectangle 'Carte Vitale' */}
                    <div className="rectangle" style={{position: 'relative', height: '50%'
                        , width: '25%', top: '50%', left: '28%', cursor: 'pointer'}}
                        onClick={handleOpenCamera}>
                        <p style={{ fontSize: '3em' }}>
                            Carte Vitale
                        </p>
                    </div>

                    {/* Rectangle 'Carte d'Identité' */}
                    <div className="rectangle" style={{position: 'relative', height: '50%'
                        , width: '20%', top: '50%', left: '35%', cursor: 'pointer'}}
                        onClick={handleOpenCamera}>
                        <p style={{ fontSize: '3em', textAlign: 'center'}}>
                            Carte <br/>
                            d'Identité
                        </p>
                    </div>

                </div>

                {isModalOpen && showCamera && (
                    <ModalCamera onClose={closeModal}>

                        <div style={{
                            
                            marginTop: '20px'
                        }}>
                            <CameraComponent onPhotoCapture={handlePhotoCapture} />
                            {/* <button onClick={closeModal} style={{ marginTop: '10px' }}>
                                Close camera
                            </button> */}
                        </div>
                    </ModalCamera>
                )}

            </div>

        </div>
    );
}

export default DocumentsChecking;
