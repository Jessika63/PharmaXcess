import './css/global.css'
import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaMoneyBillWave, FaUndo, FaFilter, FaSync, FaTimes } from 'react-icons/fa';
import ModalStandard from '../modal_standard';
import './css/global.css'

const categories = {
    antiInflammatory: 'Désinflammatoire',
    painRelief: 'Anti-douleur',
};

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
    
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [focusedIndexPaymentModal, setFocusedIndexPaymentModal] = useState(0);
    const [focusedIndexBackBtn, setFocusedIndexBackBtn] = useState(0);

    const itemRefs = useRef([]);

    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
    const [focusedIndexSearch, setFocusedIndexSearch] = useState(0);
    const searchMenuOptions = ["A-G", "H-P", "Q-Z", "antiInflammatory"
        , "painRelief", "reset", "close"];
    const searchMenuRefs = useRef([]);

    useEffect(() => {
        const fetchDrugs = async () => {
            try {
                const response = await fetch("http://localhost:5000/get_available_medicine");
                const data = await response.json();
                if (response.ok) {
                    setDrugsItems(data.medicine);
                    setFilteredDrugs(data.medicine);
                } else {
                    console.error("Server Error:", data.error);
                }
            } catch (error) {
                console.error("Network Error:", error);
            }
        };
    
        fetchDrugs();
    }, []);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, drugsItems.length);
    }, [drugsItems]);

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
        const currentLength = filteredDrugs.length;
        const filteredIds = filteredDrugs.map(item => item.id);

        if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndexBackBtn(0);
            goBackMainButtonRef.current?.blur();
            searchButtonRef.current?.blur();
            
            if (focusedIndex === -2) {
                setFocusedIndex(-1);
                searchButtonRef.current?.focus();
            } else if (focusedIndex === -1) {
                setFocusedIndex(0);
            } else if (focusedIndex < currentLength - 1) {
                setFocusedIndex((prevIndex) => prevIndex + 1);
            }
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            
            if (focusedIndex >= 0 && focusedIndex < currentLength) {
                setFocusedIndex((prevIndex) => prevIndex - 1);
            } else if (focusedIndex === 0) {
                setFocusedIndex(-1);
                searchButtonRef.current?.focus();
            } else if (focusedIndex === -1) {
                setFocusedIndex(-2);
                goBackMainButtonRef.current?.focus();
                setFocusedIndexBackBtn(1);
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < currentLength) {
                const focusedId = filteredIds[focusedIndex];
                const item = drugsItems.find(drug => drug.id === focusedId);
                openModal(item);
            } else if (focusedIndex === -1) {
                searchButtonRef.current?.click();
                toggleFilterMenu();
            } else if (focusedIndex === -2) {
                goBackMainButtonRef.current?.click();
            }
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
       
    const handleKeyDownSearchMenu = (event) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setFocusedIndexSearch((prevIndex) =>
                prevIndex < searchMenuOptions.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            setFocusedIndexSearch((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (event.key === "Enter") {
            event.preventDefault();
            applyFilter(searchMenuOptions[focusedIndexSearch]);
            setIsSearchMenuOpen(false);
        } else if (event.key === "Escape") {
            setIsSearchMenuOpen(false);
        }

    };
    
    useEffect(() => {
        if (isSearchMenuOpen) {
            searchMenuRefs.current[focusedIndexSearch]?.current?.focus();
        }
    }, [focusedIndexSearch, isSearchMenuOpen]);

    useEffect(() => {
        const handleKeydownEvent = (event) => {
            if (isSearchMenuOpen) {
                handleKeyDownSearchMenu(event);
            } else if (isModalOpen) {
                handleKeyDownPaymentModal(event);
            } else {
                handleKeyDown(event);
            }
        };
    
        document.addEventListener("keydown", handleKeydownEvent);
        return () => document.removeEventListener("keydown", handleKeydownEvent);
    }, [isSearchMenuOpen, isModalOpen, focusedIndex, focusedIndexPaymentModal, focusedIndexSearch]);
    
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
            navigate('/payment-failed', { state: { from: 'non-prescription-drugs' } });
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center p-8 bg-background_color">
            <div className="w-4/5 h-48 flex justify-between items-center mb-8 mt-2">
                <Link
                to="/" 
                ref={goBackMainButtonRef}
                className={`text-4xl bg-gradient-to-r from-pink-500 to-rose-400 px-12 
                    py-8 rounded-2xl shadow-lg hover:scale-105 transition-transform 
                    duration-300 focus:outline-none ${focusedIndexBackBtn === 1 ? 'scale-105' : ''}`}>
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
                        <div
                            key={item.id}
                            id={`drug-${item.id}`}
                            ref={el => itemRefs.current[index] = el}
                            tabIndex={0}

                            className={`h-24 flex items-center justify-center text-4xl text-gray-800 

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
                            bg-red-500 rounded-xl px-3 py-2
                            hover:bg-red-600 focus:outline-none transition-transform duration-300
                            ${focusedIndexPaymentModal === 0 ? 'scale-105' : ''}`}
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
                        ${focusedIndexPaymentModal === 1 ? 'scale-105' : ''}`}
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
        </div>
    );
}

export default NonPrescriptionDrugs;
