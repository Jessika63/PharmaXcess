import './css/global.css'
import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import ModalStandard from '../modal_standard';
import './css/global.css'
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';

const categories = {
    antiInflammatory: 'Anti-inflammatoire',
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
                event.stopPropagation();
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
                    const response = await fetchWithTimeout(`${config.backendUrl}/get_available_medicine`);
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
        if (isSearchMenuOpen) {
            // Focus on the currently selected filter option
            if (searchMenuRefs.current[focusedIndexSearch]) {
                searchMenuRefs.current[focusedIndexSearch].focus();
            }
            return;
        }
        
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
    }, [focusedIndex, loading, filteredDrugs, isSearchMenuOpen, focusedIndexSearch]);

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
            if (isSearchMenuOpen) {
                // Handle filter menu navigation
                if (["ArrowLeft", "ArrowRight", "Enter"].includes(event.key)) {
                    event.preventDefault();
                }
                if (event.key === "ArrowRight") {
                    setFocusedIndexSearch((prev) => (prev + 1) % searchMenuOptions.length);
                } else if (event.key === "ArrowLeft") {
                    setFocusedIndexSearch((prev) => (prev - 1 + searchMenuOptions.length) % searchMenuOptions.length);
                } else if (event.key === "Enter") {
                    applyFilter(searchMenuOptions[focusedIndexSearch]);
                }
                return; // Don't handle other keys when filter menu is open
            }
            
            if (isModalOpen) return; // Let modal handle its own keys
            
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
    }, [focusedIndex, loading, filteredDrugs, isSearchMenuOpen, isModalOpen, focusedIndexSearch, searchMenuOptions]);

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
        
        // More robust check for drug availability and stock
        const state = parseInt(selectedDrug?.state) || 0;
        const size = parseInt(selectedDrug?.size) || 0;
        
        // Check if drug has stock (size > 0) - this determines if payment can be processed
        if (selectedDrug && size > 0) {
            // Sufficient stock - show success message
            setIsModalOpen(false);
            setPaymentModalOpen(true);
            setTimeout(() => {
                setPaymentModalOpen(false);
            }, 2000);
        } else {
            // Insufficient stock or unavailable - redirect to insufficient stock page
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
            <div className={`w-full h-screen flex flex-col items-center justify-center bg-background_color`}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 border-solid mb-4"></div>
                <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>Chargement des médicaments...</div>
            </div>
        );
    }

    return (
        <div className={`w-full h-screen flex flex-col items-center ${config.padding.container} bg-background_color`}>
            <div className="w-4/5 h-48 flex justify-between items-center mb-8 mt-2">
                <Link
                to="/" 
                ref={goBackMainButtonRef}
                className={`${config.fontSizes.md} ${config.buttonColors.mainGradient} ${config.padding.button} 
                    ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} 
                    ${config.focusStates.outline} flex items-center ${focusedIndex === -2 ? config.scaleEffects.focus : ''}`}>
                    <config.icons.arrowLeft className="mr-3" />
                        Retour
                </Link>

                <div className="flex-grow flex justify-center pr-16">
                    <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-116 h-28" />
                </div>
            </div>

            {isSearchMenuOpen && (
                <div className={`absolute top-8 left-[80%] ${config.buttonColors.mainGradient} ${config.shadows.md} ${config.borderRadius.sm} ${config.padding.modal} w-64`}>
                    <p className="font-bold flex items-center"><config.icons.filter className="mr-2" />Filtrer par :</p>
                    <button onClick={() => applyFilter('A-G')}
                    key={"A-G"}
                    ref={el => searchMenuRefs.current[0] = el}
                    tabIndex={focusedIndexSearch === 0 ? 0 : -1} 
                    className={`block w-full text-left py-2 ${focusedIndexSearch === 0 ? config.scaleEffects.focus : ""}`}>A - G</button>
                    <button onClick={() => applyFilter('H-P')}
                    key={"H-P"}
                    ref={el => searchMenuRefs.current[1] = el}
                    tabIndex={focusedIndexSearch === 1 ? 0 : -1} 
                    className={`block w-full text-left py-2 ${focusedIndexSearch === 1 ? config.scaleEffects.focus : ""}`}>H - P</button>
                    <button onClick={() => applyFilter('Q-Z')}
                    key={"Q-Z"}
                    ref={el => searchMenuRefs.current[2] = el}
                    tabIndex={focusedIndexSearch === 2 ? 0 : -1} 
                    className={`block w-full text-left py-2 ${focusedIndexSearch === 2 ? config.scaleEffects.focus : ""}`}>Q - Z</button>
                    <button onClick={() => applyFilter('antiInflammatory')} 
                    key={"antiInflammatory"}
                    ref={el => searchMenuRefs.current[3] = el}
                    tabIndex={focusedIndexSearch === 3 ? 0 : -1} 
                    className={`block w-full text-left py-2 ${focusedIndexSearch === 3 ? config.scaleEffects.focus : ""}`}>Anti-inflammatoire</button>
                    <button onClick={() => applyFilter('painRelief')}
                    key={"painRelief"}
                    ref={el => searchMenuRefs.current[4] = el}
                    tabIndex={focusedIndexSearch === 4 ? 0 : -1} 
                    className={`block w-full text-left py-2 ${focusedIndexSearch === 4 ? config.scaleEffects.focus : ""}`}>Anti-douleur</button>
                    <button onClick={() => applyFilter(null)} 
                    key={"reset"}
                    ref={el => searchMenuRefs.current[5] = el}
                    tabIndex={focusedIndexSearch === 5 ? 0 : -1} 
                    className={`block w-full text-left py-2 flex items-center ${focusedIndexSearch === 5 ? config.scaleEffects.focus : ""}`}><config.icons.sync className="mr-2" />Réinitialiser</button>
                    <button onClick={() => applyFilter(null)} 
                    key={"close"}
                    ref={el => searchMenuRefs.current[6] = el}
                    tabIndex={focusedIndexSearch === 6 ? 0 : -1} 
                    className={`block w-full text-left py-2 flex items-center ${focusedIndexSearch === 6 ? config.scaleEffects.focus : ""}`}><config.icons.times className="mr-2" />Fermer</button>
                </div>
            )}

            <div className={`flex items-center ${config.buttonColors.buttonBackground} ${config.padding.button} ${config.borderRadius.md} ${config.shadows.md}`}>
                <span className={`${config.fontSizes.md} ${config.textColors.black}`}>Voici la liste des médicaments disponibles à la vente :</span>
                <button 
                    ref={searchButtonRef} 
                    onClick={toggleFilterMenu}
                    className={`ml-4 flex items-center gap-2 ${config.textColors.primary} ${config.fontSizes.sm} ${config.buttonColors.mainGradient} ${config.padding.button} ${config.borderRadius.sm} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${focusedIndex == -1 ? config.scaleEffects.focus : ""}`}>
                    <config.icons.search className={config.fontSizes.md} /> Rechercher
                </button>
            </div>

            <div 
                className="w-4/5 mt-16 h-[50vh] overflow-y-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200" 
                ref={drugsListRef}
            >
                <div className={config.layout.buttonGrid3}>
                    {filteredDrugs.map((item, index) => (
                        <button
                            key={item.id}
                            id={`drug-${item.id}`}
                            ref={el => itemRefs.current[index] = el}
                            tabIndex={0}
                            type="button"
                            className={`h-24 flex items-center justify-center ${config.fontSizes.xl} ${config.textColors.primary} 
                                ${config.buttonColors.mainGradient} ${config.borderRadius.lg} ${config.shadows.md} cursor-pointer 
                                ${config.transitions.default} ${index === focusedIndex ? `${config.scaleEffects.focus} ${config.focusStates.ring}` : ''}`}
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
                        className={`w-40 h-20 absolute top-4 left-4 ${config.fontSizes.lg} ${config.textColors.white} 
                            ${config.buttonColors.red} ${config.borderRadius.md} ${config.padding.button}
                            ${config.buttonColors.redHover} ${config.focusStates.outline} ${config.transitions.default}
                            ${modalFocusIndex === 0 ? config.scaleEffects.focus : ''}`}
                        onClick={closeModal}
                    >
                        <config.icons.times className="mr-2" />
                        Fermer
                    </button>
                    <div className={`${config.padding.modal} text-center ${config.fontSizes.xxl} ${config.textColors.primary}`}>
                        <h2>{selectedDrug.label} (Reste: {selectedDrug.size})</h2>
                    </div>
                    <button
                        ref={payButtonRef}
                        className={`w-1/3 h-32 mx-auto mt-16 py-3 font-semibold ${config.buttonColors.green} 
                        ${config.textColors.white} ${config.borderRadius.sm} ${config.shadows.md} ${config.transitions.default} ${config.fontSizes.xl}
                        ${modalFocusIndex === 1 ? config.scaleEffects.focus : ''}`}
                        onClick={handlePayment}
                    >
                        <config.icons.money className="mr-2" />
                        Payer
                    </button>
                </ModalStandard>
            )}

            {paymentModalOpen && (
                <ModalStandard onClose={() => setPaymentModalOpen(false)}>
                    <div className={`${config.padding.modal} text-center ${config.fontSizes.md} ${config.textColors.primary}`}>
                        <h2>Paiement réussi !</h2>
                    </div>
                </ModalStandard>
            )}

            {showInactivityModal && (
                <ModalStandard onClose={() => setShowInactivityModal(false)}>
                    <div className={`${config.fontSizes.lg} font-bold mb-4`}>Inactivité détectée</div>
                    <div className={`${config.fontSizes.sm} mb-4`}>Vous allez être redirigé vers l'accueil dans 1 minute...</div>
                    <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md} ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}`} onClick={() => setShowInactivityModal(false)}>Rester sur la page</button>
                </ModalStandard>
            )}
        </div>
    );
}

export default NonPrescriptionDrugs;