import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [focusedElement, setFocusedElement] = useState(null);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const navigate = useNavigate();

    const goBackMainButtonRef = useRef(null)
    const backButtonRef = useRef(null);
    const payButtonRef = useRef(null);
    const drugsListRef = useRef(null);
    
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [focusedIndexPaymentModal, setFocusedIndexPaymentModal] = useState(0);
    const [focusedIndexBackBtn, setFocusedIndexBackBtn] = useState(0);

    const itemRefs = useRef([]);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, drugs_items.length);
    }, [drugs_items]);

    const handleKeyDownPaymentModal = (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndexPaymentModal(prevIndex => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            setFocusedIndexPaymentModal(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
        }
    };
    

    useEffect(() => {
        if (isModalOpen) {
            if (focusedIndexPaymentModal === 0 && backButtonRef.current) {
                backButtonRef.current.focus();
            } else if (focusedIndexPaymentModal === 1 && payButtonRef.current) {
                payButtonRef.current.focus();
            }
        }
    }, [focusedIndexPaymentModal, isModalOpen]);
    

    const handleKeyDown = (event) => {    
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndexBackBtn(0);
            goBackMainButtonRef.current.blur();
            if (focusedIndex < drugs_items.length - 1) {
                setFocusedIndex((prevIndex) => prevIndex + 1);
            } else {
                const nextElement = document.getElementById(`drug-${focusedIndex + 1}`);
                if (nextElement) nextElement.scrollIntoView({ behavior: "smooth" });
            }
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            if (focusedIndex > 0) {
                setFocusedIndex((prevIndex) => prevIndex - 1);
            } else {
                if (goBackMainButtonRef?.current) {
                    setFocusedIndexBackBtn(1);
                    setFocusedIndex(-1);
                    goBackMainButtonRef?.current.focus();
                }
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            openModal(drugs_items[focusedIndex]);
        }
    };

    useEffect(() => {
        if (itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].focus();
            itemRefs.current[focusedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }
    }, [focusedIndex]); 
       

    useEffect(() => {
        const handleKeydownEvent = (event) => {
            if (!isModalOpen) {
                handleKeyDown(event);
            } else {
                handleKeyDownPaymentModal(event);
            }
        };
    
        document.addEventListener("keydown", handleKeydownEvent);
    
        return () => {
            document.removeEventListener("keydown", handleKeydownEvent);
        };
    }, [isModalOpen, focusedIndex, focusedIndexPaymentModal]);           
    

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
                navigate('/drug-unavailable', { state: { from: 'non-prescription-drugs' } });
            }
        } else {
            navigate('/payment-failed', { state: { from: 'non-prescription-drugs' } });
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center p-8 bg-background_color">
            <div className="w-4/5 h-48 flex justify-between items-center mb-24 mt-10">
                <Link
                to="/" 
                ref={goBackMainButtonRef}
                className={`text-4xl bg-gradient-to-r from-pink-500 to-rose-400 px-24 
                    py-10 rounded-2xl shadow-lg hover:scale-105 transition-transform 
                    duration-300 ${focusedIndexBackBtn === 1 ? 'scale-105' : ''}`}>
                        Retour
                </Link>
                <div className="flex-grow flex justify-center pr-72">
                    <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-124 h-32" />
                </div>
            </div>

            <div className="w-2/3 h-72 flex items-center justify-center text-gray-800 text-5xl bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-500">
                Voici la liste des médicaments disponibles à la vente :
            </div>

            <div 
                className="w-4/5 mt-16 h-[50vh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200" 
                ref={drugsListRef}
            >
                <div className="grid grid-cols-3 gap-6">
                    {drugs_items.map((item, index) => (
                        <div
                            key={item.id}
                            id={`drug-${item.id}`}
                            ref={el => itemRefs.current[index] = el}
                            tabIndex={0} // Permet au div d'être focusable
                            className={`h-36 flex items-center justify-center text-4xl text-gray-800 
                                bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl shadow-lg cursor-pointer 
                                transition-transform duration-300 ${index === focusedIndex ? 'scale-105 ring-4 ring-pink-300' : ''}`}
                            onClick={() => openModal(item)}
                        >
                            {item.label}
                        </div>                    
                    ))}
                </div>
            </div>

            {isModalOpen && selectedDrug && (
                <ModalStandard onClose={closeModal}>
                    <button
                        ref={backButtonRef}
                        className={`w-40 h-20 absolute top-4 left-4 text-3xl text-white 
                            bg-red-500 rounded-xl px-3 py-2 border-2 border-red-700 
                            hover:bg-red-600 focus:outline-none transition-transform duration-300
                            ${focusedIndexPaymentModal === 0 ? 'scale-105' : ''}`}
                        onClick={closeModal}
                    >
                        Retour
                    </button>
                    <div className="p-6 text-center text-5xl text-gray-800">
                        <h2>{selectedDrug.label} (Reste: {selectedDrug.size})</h2>
                    </div>
                    <button
                        ref={payButtonRef}
                        className={`w-1/3 h-32 mx-auto mt-16 py-3 font-semibold bg-green-500 
                        text-white rounded-lg shadow-lg transition-transform duration-300 text-4xl
                        ${focusedIndexPaymentModal === 1 ? 'scale-105' : ''}`}
                        onClick={handlePayment}
                    >
                        Payer
                    </button>
                </ModalStandard>
            )}

            {paymentModalOpen && (
                <ModalStandard onClose={() => setPaymentModalOpen(false)}>
                    <div className="p-6 text-center text-2xl text-gray-800">
                        <h2>Paiement réussi !</h2>
                    </div>
                </ModalStandard>
            )}
        </div>
    );
}

export default NonPrescriptionDrugs;
