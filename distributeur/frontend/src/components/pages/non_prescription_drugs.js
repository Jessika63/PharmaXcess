import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/non_prescription_drugs.css'
import ModalStandard from '../modal_standard';

const drugs_items = [
    { id: 1, label: 'Dafalgan', size: 2, state: 0 },
    { id: 2, label: 'Gaviscon', size: 0, state: 0 },
    { id: 3, label: 'Nurofen', size: 1, state: 1 },
    { id: 4, label: 'Physiomer', size: 2, state: 1 },
    { id: 5, label: 'Zyrtec', size: 0, state: 0 },
    { id: 6, label: 'Coryzalia', size: 0, state: 1 },
    { id: 7, label: 'Ibuprofen', size: 1, state: 0 },
    { id: 8, label: 'Doliprane', size: 0, state: 0 },
    { id: 9, label: 'L52', size: 3, state: 1 },
    { id: 10, label: 'Toplexil', size: 1, state: 1 },
    { id: 11, label: 'Vitascorbol', size: 1, state: 1 },
    { id: 12, label: 'Hexaspray', size: 1, state: 1 },
    { id: 13, label: 'Voltaren', size: 1, state: 1 },
    { id: 14, label: 'Smecta', size: 1, state: 1 },
    { id: 15, label: 'Synthol', size: 1, state: 1 },
    { id: 16, label: 'Strepsil', size: 1, state: 1 },
    { id: 17, label: 'Dafalgan 2', size: 1, state: 1 },
    { id: 18, label: 'Gaviscon 2', size: 1, state: 1 },
    { id: 19, label: 'Nurofen 2', size: 1, state: 1 },
    { id: 20, label: 'Physiomer 2', size: 1, state: 1 },
    { id: 21, label: 'Zyrtec 2', size: 1, state: 1 },
    { id: 22, label: 'Coryzalia 2', size: 1, state: 1 },
    { id: 23, label: 'Ibuprofen 2', size: 1, state: 1 },
    { id: 24, label: 'Doliprane 2', size: 1, state: 1 },
    { id: 25, label: 'L52 2', size: 1, state: 1 },
    { id: 26, label: 'Toplexil 2', size: 1, state: 1 },
    { id: 27, label: 'Vitascorbol 2', size: 1, state: 1 },
    { id: 28, label: 'Hexaspray 2', size: 1, state: 1 },
    { id: 29, label: 'Voltaren 2', size: 1, state: 1 },
    { id: 30, label: 'Smecta 2', size: 1, state: 1 },
    { id: 31, label: 'Synthol 2', size: 1, state: 1 },
    { id: 32, label: 'Strepsil 2', size: 1, state: 1 }
];

function NonPrescriptionDrugs() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const navigate = useNavigate();
  
    const openModal = (drug) => {
      setSelectedDrug(drug);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedDrug(null);
    };

    const handlePayment = () => {
        if (selectedDrug.state > 0) {
            if (selectedDrug.size > 0) {
                setIsModalOpen(false);
                setPaymentModalOpen(true);
                setTimeout(() => {
                    setPaymentModalOpen(false);
                }, 2000);
            } else {
                navigate('/drug-unavailable', {state: {from: 'non-prescription-drugs'}});
            }
        } else {
            navigate('/payment-failed', {state: {from: 'non-prescription-drugs'}});
        }
    };

  return (
    <div className="npd_App">

        {/* header container */}
        <div className="npd_header_container">

            {/* Rectangle 'go back rectangle' */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="rectangle npd_back_button" style={{cursor: 'pointer'}}>
                    <p style={{ fontSize: '2.5em' }}>Retour</p>
                </div>
            </Link>

            {/* logo container */}
            <div className="npd_logo_container">
                {/* logo PharmaXcess */}
                <img
                    src={require('./../../assets/logo.png')}
                    alt="Logo PharmaXcess"
                    className="logo"
                />
            </div>

        </div>

        <div className='npd_body_page'>

            {/* Rectangle 'main rectangle' */}
            <div className="rectangle" style={{top: '5%', left: '50%', width: '60%'
                , display: 'flex', flexDirection: 'column', overflowY: 'auto'
            }}>
                <p style={{ fontSize: '3em', textAlign: 'center' }}>
                Voici la liste des médicaments <br/>
                diponibles à la vente :
                </p>
            </div>

            {/* drugs list */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(24%, 1fr))',
                    gridGap: '1.3%',
                    position: 'relative',
                    //top: '0%',
                    width: '100%',
                    height: '60%',
                    overflowY: 'auto',
                    paddingTop: '6%',
                    paddingLeft: '17.5%',
                    boxSizing: 'border-box',
                }}
            >
                {drugs_items.map((item) => (
                    <div
                        key={item.id}
                        className="rectangle"
                        style={{
                            height: '80%',
                            width: '85%',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => openModal(item)}
                    >
                        <p style={{ fontSize: '2.5em', textAlign: 'center' }}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && selectedDrug && (
            <ModalStandard onClose={closeModal}>
                <div style={{
                padding: '20px',
                textAlign: 'center',
                fontSize: '2em',
                color: '#333'
                }}>
                <h2>{selectedDrug.label} (Reste: {selectedDrug.size})</h2>
                </div>
                <div
                className='rectangle'
                style={{ cursor: 'pointer', width: '20%', height: '10%', left: '10.5%', top: '30%' }}
                onClick={handlePayment}>
                    Payer
                </div>
            </ModalStandard>
            )}

            {/* Modal de paiement réussi */}
            {paymentModalOpen && (
                <ModalStandard onClose={() => setPaymentModalOpen(false)}>
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontSize: '2em',
                        color: '#333'
                    }}>
                        <h2>Paiement réussi !</h2>
                    </div>
                </ModalStandard>
            )}

        </div>

    </div>
  );
}

export default NonPrescriptionDrugs;
