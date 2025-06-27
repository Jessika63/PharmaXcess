import './css/global.css'
import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaMoneyBillWave, FaUndo, FaFilter, FaSync, FaTimes } from 'react-icons/fa';
import ModalStandard from '../modal_standard';
import './css/global.css'
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

const categories = {
    antiInflammatory: 'Désinflammatoire',
    painRelief: 'Anti-douleur',
};

// Module-level cache for available medicines
let availableMedicineCache = null;
let availableMedicineFetched = false;

function NonPrescriptionDrugs() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [focusedElement, setFocusedElement] = useState(null);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [drugsItems, setDrugsItems] = useState([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const navigate = useNavigate();

    const searchButtonRef = useRef(null);

    const goBackMainButtonRef = useRef(null)

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [filteredDrugs, setFilteredDrugs] = useState(drugsItems);

    const backButtonRef = useRef(null);
    const payButtonRef = useRef(null);
    const drugsListRef = useRef(null);
    
    // Focus index: -2 = go back, -1 = search/filter, 0...N-1 = drug cards
    const [focusedIndex, setFocusedIndex] = useState(0);

    const itemRefs = useRef([]);

    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
    const [focusedIndexSearch, setFocusedIndexSearch] = useState(0);
    const searchMenuOptions = ["A-G", "H-P", "Q-Z", "antiInflammatory"
        , "painRelief", "reset", "close"];
    const searchMenuRefs = useRef([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cacheRef = useRef(null);

    // Modal popup focus system
    const [modalFocusIndex, setModalFocusIndex] = useState(0);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    useInactivityRedirect(() => setShowInactivityModal(true));

    // Reset modal focus when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setModalFocusIndex(0);
        }
    }, [isModalOpen]);

    // Focus management for modal
    useEffect(() => {
        if (!isModalOpen) return;
        if (modalFocusIndex === 0 && backButtonRef.current) {
            backButtonRef.current.focus();
        } else if (modalFocusIndex === 1 && payButtonRef.current) {
            payButtonRef.current.focus();
        }
    }, [modalFocusIndex, isModalOpen]);

    // Keyboard navigation for modal
    useEffect(() => {
        if (!isModalOpen) return;
        const handleModalKeyDown = (event) => {
            if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
                event.preventDefault();
            }
            if (event.key === "ArrowLeft") {
                setModalFocusIndex((prev) => Math.max(0, prev - 1));
            } else if (event.key === "ArrowRight") {
                setModalFocusIndex((prev) => Math.min(1, prev + 1));
            } else if (event.key === "Enter") {
                if (modalFocusIndex === 0) {
                    closeModal();
                } else if (modalFocusIndex === 1) {
                    handlePayment();
                }
            }
        };
        document.addEventListener("keydown", handleModalKeyDown);
        return () => document.removeEventListener("keydown", handleModalKeyDown);
    }, [isModalOpen, modalFocusIndex]);

    useEffect(() => {
        const fetchDrugs = async () => {
            setLoading(true);
            setError(null);
            const MIN_LOADING_TIME = 500; // ms
            const start = Date.now();
            let dataToUse = null;
            if (availableMedicineCache) {
                dataToUse = availableMedicineCache;
            } else if (!availableMedicineFetched) {
                availableMedicineFetched = true;
                try {
                    const response = await fetchWithTimeout("http://localhost:5000/get_available_medicine");
                    const data = await response.json();
                    if (response.ok) {
                        dataToUse = data.medicine;
                        availableMedicineCache = data.medicine;
                    } else {
                        setError(data.error || 'Server Error');
                        availableMedicineCache = null;
                        availableMedicineFetched = false;
                    }
                } catch (error) {
                    if (error.message === 'Timeout') {
                        setError('Le serveur ne répond pas (délai dépassé). Veuillez réessayer plus tard.');
                    } else {
                        setError('Network Error');
                    }
                    availableMedicineCache = null;
                    availableMedicineFetched = false;
                }
            }
            if (dataToUse) {
                setDrugsItems(dataToUse);
                setFilteredDrugs(dataToUse);
            }
            const elapsed = Date.now() - start;
            const remaining = MIN_LOADING_TIME - elapsed;
            if (remaining > 0) {
                setTimeout(() => setLoading(false), remaining);
            } else {
                setLoading(false);
            }
        };
        fetchDrugs();
    }, []);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, drugsItems.length);
    }, [drugsItems]);

    // Focus management effect
    useEffect(() => {
        if (loading) return;
        if (focusedIndex === -2 && goBackMainButtonRef.current) {
            goBackMainButtonRef.current.focus();
        } else if (focusedIndex === -1 && searchButtonRef.current) {
            searchButtonRef.current.focus();
        } else if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].focus();
            itemRefs.current[focusedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }
    }, [focusedIndex, loading, filteredDrugs]);

    // Set initial focus after loading
    useEffect(() => {
        if (!loading) {
            if (filteredDrugs.length > 0) {
                setFocusedIndex(0);
            } else {
                setFocusedIndex(-1);
            }
        }
    }, [loading, filteredDrugs.length]);

    // Keyboard navigation
    useEffect(() => {
        if (loading) return;
        const handleKeyDown = (event) => {
            if (isSearchMenuOpen || isModalOpen) return; // Let modal/search handle their own keys
            if (filteredDrugs.length === 0) return;
            if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
                event.preventDefault();
            }
            if (event.key === "ArrowLeft") {
                if (focusedIndex > 0) {
                    setFocusedIndex(focusedIndex - 1);
                } else if (focusedIndex === 0) {
                    setFocusedIndex(-1);
                } else if (focusedIndex === -1) {
                    setFocusedIndex(-2);
                }
            } else if (event.key === "ArrowRight") {
                if (focusedIndex === -2) {
                    setFocusedIndex(-1);
                } else if (focusedIndex === -1) {
                    setFocusedIndex(0);
                } else if (focusedIndex < filteredDrugs.length - 1) {
                    setFocusedIndex(focusedIndex + 1);
                }
            } else if (event.key === "Enter") {
                if (focusedIndex >= 0 && focusedIndex < filteredDrugs.length) {
                    openModal(filteredDrugs[focusedIndex]);
                } else if (focusedIndex === -1) {
                    toggleFilterMenu();
                } else if (focusedIndex === -2) {
                    goBackMainButtonRef.current?.click();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [focusedIndex, loading, filteredDrugs, isSearchMenuOpen, isModalOpen]);

    const toggleFilterMenu = () => setIsSearchMenuOpen(!isSearchMenuOpen);
    const applyFilter = (filter) => {
        setSelectedFilter(filter);
        let filteredItems;
    
        if (filter === 'A-G') {
            filteredItems = drugsItems.filter(drug => drug.label[0] >= 'A' && drug.label[0] <= 'G');
        } else if (filter === 'H-P') {
            filteredItems = drugsItems.filter(drug => drug.label[0] > 'H' && drug.label[0] <= 'P');
        } else if (filter === 'Q-Z') {
            filteredItems = drugsItems.filter(drug => drug.label[0] > 'Q');
        } else if (categories[filter]) {
            filteredItems = drugsItems.filter(drug => drug.category === filter);
        } else if (filter === "close") {
            filteredItems = filteredDrugs;
        } else {
            filteredItems = drugsItems;
        }

        setIsSearchMenuOpen(false);
        setFilteredDrugs(filteredItems);
        setFocusedIndex(0);
    };    

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
            navigate('/insufficient-stock', { state: { from: 'non-prescription-drugs' } });
        }
    };

    // Dismiss inactivity modal on user activity
    useEffect(() => {
        if (!showInactivityModal) return;
        const dismiss = () => setShowInactivityModal(false);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, dismiss));
        return () => events.forEach(event => window.removeEventListener(event, dismiss));
    }, [showInactivityModal]);

    if (error) {
        return <ErrorPage message={error} />;
    }
    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-background_color">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
                <div className="text-2xl text-gray-600">Chargement des médicaments...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col items-center p-8 bg-background_color">
            <div className="w-4/5 h-48 flex justify-between items-center mb-8 mt-2">
                <Link
                to="/" 
                ref={goBackMainButtonRef}
                className={`text-4xl bg-gradient-to-r from-pink-500 to-rose-400 px-12 
                    py-8 rounded-2xl shadow-lg hover:scale-105 transition-transform 
                    duration-300 focus:outline-none ${focusedIndex === -2 ? 'scale-105' : ''}`}>
                    <FaArrowLeft className="mr-4" />
                        Retour
                </Link>

                <div className="flex-grow flex justify-center pr-16">
                    <img src={require('./../../assets/logo.png')} alt="Logo PharmaXcess" className="w-116 h-28" />
                </div>
            </div>

            {isSearchMenuOpen && (
                <div className="absolute top-24 left-[80%] bg-gradient-to-r 
                from-pink-500 to-rose-400 shadow-md rounded-lg p-4 w-64">
                    <p className="font-bold flex items-center"><FaFilter className="mr-2" />Filtrer par :</p>
                    <button onClick={() => applyFilter('A-G')}
                    key={"A-G"}
                    ref={searchMenuRefs.current[0]}
                    tabIndex={0} className={`block w-full text-left py-2 ${focusedIndexSearch === 0 ? "scale-105" : ""}`}>A - G</button>
                    <button onClick={() => applyFilter('H-P')}
                    key={"H-P"}
                    ref={searchMenuRefs.current[1]}
                    tabIndex={0} className={`block w-full text-left py-2 ${focusedIndexSearch === 1 ? "scale-105" : ""}`}>H - P</button>
                    <button onClick={() => applyFilter('Q-Z')}
                    key={"Q-Z"}
                    ref={searchMenuRefs.current[2]}
                    tabIndex={0} className={`block w-full text-left py-2 ${focusedIndexSearch === 2 ? "scale-105" : ""}`}>Q - Z</button>
                    <button onClick={() => applyFilter('antiInflammatory')} 
                    key={"antiInflammatory"}
                    ref={searchMenuRefs.current[3]}
                    tabIndex={0} className={`block w-full text-left py-2 ${focusedIndexSearch === 3 ? "scale-105" : ""}`}>Désinflammatoire</button>
                    <button onClick={() => applyFilter('painRelief')}
                    key={"painRelief"}
                    ref={searchMenuRefs.current[4]}
                    tabIndex={0} className={`block w-full text-left py-2 ${focusedIndexSearch === 4 ? "scale-105" : ""}`}>Anti-douleur</button>
                    <button onClick={() => applyFilter(null)} 
                    key={"reset"}
                    ref={searchMenuRefs.current[5]}
                    tabIndex={0} className={`block w-full text-left py-2 flex items-center ${focusedIndexSearch === 5 ? "scale-105" : ""}`}><FaSync className="mr-2" />Réinitialiser</button>
                    <button onClick={() => applyFilter(null)} 
                    key={"close"}
                    ref={searchMenuRefs.current[6]}
                    tabIndex={0} className={`block w-full text-left py-2 flex items-center ${focusedIndexSearch === 6 ? "scale-105" : ""}`}><FaTimes className="mr-2" />Fermer</button>
                </div>
            )}

            <div className="flex items-center bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4 rounded-xl shadow-lg">
                <span className="text-2xl text-white">Voici la liste des médicaments disponibles à la vente :</span>
                <button 
                    ref={searchButtonRef} 
                    onClick={toggleFilterMenu}
                    className={`ml-4 flex items-center gap-2 text-white text-xl bg-transparent px-4 py-2 rounded-lg shadow hover:opacity-80 ${focusedIndex == -1 ? "scale-105" : ""}`}>
                    <FaSearch className="text-2xl" /> Rechercher
                </button>
            </div>

            <div 
                className="w-4/5 mt-16 h-[50vh] overflow-y-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200" 
                ref={drugsListRef}
            >
                <div className="grid grid-cols-3 gap-6">
                    {filteredDrugs.map((item, index) => (
                        <button
                            key={item.id}
                            id={`drug-${item.id}`}
                            ref={el => itemRefs.current[index] = el}
                            tabIndex={0}
                            type="button"
                            className={`h-24 flex items-center justify-center text-4xl text-gray-800 
                                bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl shadow-lg cursor-pointer 
                                transition-transform duration-300 ${index === focusedIndex ? 'scale-105 ring-4 ring-pink-300' : ''}`}
                            onClick={() => openModal(item)}
                        >
                            {item.label}
                        </button>                    
                    ))}
                </div>

            </div>

            {isModalOpen && selectedDrug && (
                <ModalStandard onClose={closeModal}>
                    <button
                        ref={backButtonRef}
                        className={`w-40 h-20 absolute top-4 left-4 text-3xl text-white 
                            bg-red-500 rounded-xl px-3 py-2
                            hover:bg-red-600 focus:outline-none transition-transform duration-300
                            ${modalFocusIndex === 0 ? 'scale-105' : ''}`}
                        onClick={closeModal}
                    >
                        <FaUndo className="mr-2" />
                        Retour
                    </button>
                    <div className="p-6 text-center text-5xl text-gray-800">
                        <h2>{selectedDrug.label} (Reste: {selectedDrug.size})</h2>
                    </div>
                    <button
                        ref={payButtonRef}
                        className={`w-1/3 h-32 mx-auto mt-16 py-3 font-semibold bg-green-500 
                        text-white rounded-lg shadow-lg transition-transform duration-300 text-4xl
                        ${modalFocusIndex === 1 ? 'scale-105' : ''}`}
                        onClick={handlePayment}
                    >
                        <FaMoneyBillWave className="mr-2" />
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

            {showInactivityModal && (
                <ModalStandard onClose={() => setShowInactivityModal(false)}>
                    <div className="text-3xl font-bold mb-4">Inactivité détectée</div>
                    <div className="text-xl mb-4">Vous allez être redirigé vers l'accueil dans 1 minute...</div>
                    <button className="px-8 py-4 bg-white text-pink-500 text-2xl rounded-xl shadow hover:scale-105 transition-transform duration-300" onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
                </ModalStandard>
            )}
        </div>
    );
}

export default NonPrescriptionDrugs;
