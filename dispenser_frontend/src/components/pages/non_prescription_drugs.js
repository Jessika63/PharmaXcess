import './css/global.css'
import React, { useRef, useEffect, useState } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import ModalStandard from '../modal_standard';
import './css/global.css'
import ErrorPage from '../ErrorPage';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import ElementsWrapper from '../ElementsWrapper';
import { useCart } from '../../context/CartContext';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';

const categories = {
    painKiller: "Anti-douleur",
    antiAcid: "Anti-acide",
    antiInflammatory: "Anti-inflammatoire",
    hygiene: "Hygiène",
    antiHistamine: "Antihistaminique",
    homeopathy: "Homéopathie",
    foodSupplement: "Complément alimentaire",
    antiSeptic: "Antiseptique",
    antiDiarrheal: "Antidiarrhéique",
    test: "Test"
};

// Initialize Stripe PROMISE (not instance)
const stripePromise = loadStripe('pk_test_51Rsl1CLfU2UU0K5QVl6iyAUF5YuvHw648nWONQGJZmWPqtZhmxlZmSw6fORMnQNdzqtBe6Wd1LkTP7RCCoE71VyK00Zjm3nzmr');

// Module-level cache for available medicines
let availableMedicineCache = null;
let availableMedicineFetched = false;

function NonPrescriptionDrugs() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.nonPrescriptionDrugs);
  const { speak } = useVoiceOver();

    const stripePromiseRef = useRef(stripePromise);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [focusedElement, setFocusedElement] = useState(null);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [drugsItems, setDrugsItems] = useState([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const navigate = useNavigate();
    const { addToCart, getCartCount } = useCart(); 


    const searchButtonRef = useRef(null);
    const sortButtonRef = useRef(null); 
    const cartButtonRef = useRef(null); 


    const goBackMainButtonRef = useRef(null)

    // const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [sortOrder, setSortOrder] = useState('name-asc'); // 'name-asc', 'price-asc', 'price-desc'
    const [filteredDrugs, setFilteredDrugs] = useState(() => {
        // Initial sort by name (A-Z)
        return [...drugsItems].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    });

    const backButtonRef = useRef(null);
    const payButtonRef = useRef(null);
    const drugsListRef = useRef(null);

    // Focus index: -4 = back button, -3 = cart, -2 = sort, -1 = filter, 0...N-1 = drug cards
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const itemRefs = useRef([]);

    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
    const [focusedIndexSearch, setFocusedIndexSearch] = useState(0);
    const searchMenuOptions = [
        "A-G",
        "H-P",
        "Q-Z",
        ...Object.values(categories),
        "Reset",
        "Close"
    ];
    const searchMenuRefs = useRef([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const cacheRef = useRef(null);

    // Modal popup focus system
    const [modalFocusIndex, setModalFocusIndex] = useState(0);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    useInactivityRedirect(() => setShowInactivityModal(true));

    const [clientSecret, setClientSecret] = useState(null);

    const [stockUpdateError, setStockUpdateError] = useState(null);

    // Auto-read medication details when modal opens
    useEffect(() => {
        if (isModalOpen && selectedDrug) {
            const fullText = `
                Détails du médicament ${selectedDrug.label}.
                Catégorie : ${categories[selectedDrug.category] || 'Médicament'}.
                Description : ${selectedDrug.description || 'Description non disponible'}.
                Informations produit :
                Forme : ${selectedDrug.forme || 'Comprimés'}.
                Dosage : ${selectedDrug.dosage || 'Non spécifié'}.
                Présentation : ${selectedDrug.presentation || `Boîte de ${selectedDrug.size} comprimés`}.
                Laboratoire : ${selectedDrug.laboratoire || 'Non spécifié'}.
                Prix : ${selectedDrug.price ? `${selectedDrug.price.toFixed(2)} euros` : 'Prix non défini'}.
                ${selectedDrug.size > 0 ? 'En stock' : 'Non disponible'}.
                Conseil d'utilisation :
                Adultes : 1 comprimé toutes les 6 heures.
                Maximum 4 comprimés par jour.
                A prendre avec un verre d'eau.
                Peut être pris pendant ou hors des repas.
                Précautions :
                Ne pas dépasser la dose recommandée.
                Déconseillé en cas d'allergie au paracétamol.
                Consulter un médecin si les symptômes persistent.
                Tenir hors de portée des enfants.
            `;
            speak(fullText);
        }
    }, [isModalOpen, selectedDrug, speak]);

    // Reset modal focus when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setModalFocusIndex(0);
        }
    }, [isModalOpen]);

    // Focus management for modal
    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        if (modalFocusIndex === 0 && backButtonRef.current) {
            backButtonRef.current.focus();
        } else if (modalFocusIndex === 1 && payButtonRef.current) {
            payButtonRef.current.focus();
        }
    }, [modalFocusIndex, isModalOpen]);

    // Keyboard navigation for modal
    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        const handleModalKeyDown = (event) => {
            if (["ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
                setModalFocusIndex((prev) => (prev - 1 + 2) % 2);
            } else if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
                setModalFocusIndex((prev) => (prev + 1) % 2);
            } else if (event.key === "Enter") {
                if (modalFocusIndex === 0) {
                    closeModal();
                } else if (modalFocusIndex === 1) {
                    // Trigger the add to cart button
                    if (payButtonRef.current) {
                        payButtonRef.current.click();
                    }
                }
            }
        };
        document.addEventListener("keydown", handleModalKeyDown);
        return () => document.removeEventListener("keydown", handleModalKeyDown);
    }, [isModalOpen, modalFocusIndex]);

    const fetchDrugs = async (forceReload = false) => {
        if (forceReload) {
            availableMedicineCache = null;
            availableMedicineFetched = false;
        }
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

    useEffect(() => {
        const fetchData = async () => {
            await fetchDrugs(true);
        };
        fetchData();
    }, []);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, drugsItems.length);
    }, [drugsItems]);

    // Focus management effect
    useEffect(() => {
        if (loading) {
            return;
        }
        if (isSearchMenuOpen) {
            // Focus on the currently selected filter option
            if (searchMenuRefs.current[focusedIndexSearch]) {
                searchMenuRefs.current[focusedIndexSearch].focus();
            }
            return;
        }

        if (focusedIndex === -3 && cartButtonRef.current) {
            cartButtonRef.current.focus();
        } else if (focusedIndex === -2 && sortButtonRef.current) {
            sortButtonRef.current.focus();
        } else if (focusedIndex === -1 && searchButtonRef.current) {
            searchButtonRef.current.focus();
        } else if (focusedIndex === -4 && goBackMainButtonRef.current) {
            goBackMainButtonRef.current.focus();
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
            // Always start on filter
            setFocusedIndex(-1);
        }
    }, [loading]);

    // Keyboard navigation
    useEffect(() => {
        if (loading) {
            return;
        }
        const handleKeyDown = (event) => {
            if (isSearchMenuOpen) {
                // Handle filter menu navigation
                if (["ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(event.key)) {
                    event.preventDefault();
                }
                if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
                    setFocusedIndexSearch((prev) => (prev + 1) % searchMenuOptions.length);
                } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
                    setFocusedIndexSearch((prev) => (prev - 1 + searchMenuOptions.length) % searchMenuOptions.length);
                } else if (event.key === "Enter") {
                    const option = searchMenuOptions[focusedIndexSearch];

                    if (option === 'Reset') {
                        applyFilter(null);
                    } else if (option === 'Close') {
                        setIsSearchMenuOpen(false);
                        setFocusedIndex(0);
                    } else if (['A-G', 'H-P', 'Q-Z'].includes(option)) {
                        applyFilter(option);
                    } else if (Object.values(categories).includes(option)) {
                        // Convertir la valeur en clé pour les catégories
                        const categoryKey = getCategoryKey(option);
                        applyFilter(categoryKey);
                    }
                }
                return; // Don't handle other keys when filter menu is open
            }
            if (isModalOpen) {
                return;
            } // Let modal handle its own keys

            // Don't prevent default on selects to allow native dropdown behavior
            const isOnSelect = focusedIndex === -1 || focusedIndex === -2;
            
            if (!isOnSelect && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "Tab"].includes(event.key)) {
                event.preventDefault();
            }

            if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
                event.preventDefault(); 
                if (focusedIndex > 0) {
                    setFocusedIndex(focusedIndex - 1);
                } else if (focusedIndex === 0) {
                    setFocusedIndex(-3); // From first drug to cart
                } else if (focusedIndex === -3) {
                    setFocusedIndex(-2); // From cart to sort
                } else if (focusedIndex === -2) {
                    setFocusedIndex(-1); // From sort to filter
                } else if (focusedIndex === -1) {
                    setFocusedIndex(-4); // From filter to back button
                } else if (focusedIndex === -4) {
                    // Circular: go from back button to last drug item
                    if (filteredDrugs.length > 0) {
                        setFocusedIndex(filteredDrugs.length - 1);
                    } else {
                        setFocusedIndex(-3);
                    }
                }
            } else if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
                event.preventDefault();
                if (focusedIndex === -4) {
                    setFocusedIndex(-1); // From back button to filter
                } else if (focusedIndex === -1) {
                    setFocusedIndex(-2); // From filter to sort
                } else if (focusedIndex === -2) {
                    setFocusedIndex(-3); // From sort to cart
                } else if (focusedIndex === -3) {
                    // From cart to first drug
                    if (filteredDrugs.length > 0) {
                        setFocusedIndex(0);
                    } else {
                        setFocusedIndex(-4);
                    }
                } else if (focusedIndex >= 0 && focusedIndex < filteredDrugs.length - 1) {
                    setFocusedIndex(focusedIndex + 1);
                } else if (focusedIndex === filteredDrugs.length - 1) {
                    // Circular: go from last drug item to back button
                    setFocusedIndex(-4);
                }
            } else if (event.key === "ArrowUp") {
                if (focusedIndex >= 0 && focusedIndex < filteredDrugs.length) {
                    // Move up by 3 (assuming 3 columns in the grid)
                    const newIndex = focusedIndex - 3;
                    if (newIndex >= 0) {
                        setFocusedIndex(newIndex);
                    }
                }
            } else if (event.key === "ArrowDown") {
                if (focusedIndex >= 0 && focusedIndex < filteredDrugs.length) {
                    // Move down by 3 (assuming 3 columns in the grid)
                    const newIndex = focusedIndex + 3;
                    if (newIndex < filteredDrugs.length) {
                        setFocusedIndex(newIndex);
                    }
                }
            } else if (event.key === "Enter" || event.key === " ") {
                if (focusedIndex >= 0 && focusedIndex < filteredDrugs.length) {
                    event.preventDefault();
                    openModal(filteredDrugs[focusedIndex]);
                } else if (focusedIndex === -1 && searchButtonRef.current) {
                    event.preventDefault();
                    // Open filter dropdown
                    try {
                        if (searchButtonRef.current.showPicker) {
                            searchButtonRef.current.showPicker();
                        } else {
                            searchButtonRef.current.click();
                        }
                    } catch (e) {
                        searchButtonRef.current.click();
                    }
                } else if (focusedIndex === -2 && sortButtonRef.current) {
                    event.preventDefault();
                    // Open sort dropdown
                    try {
                        if (sortButtonRef.current.showPicker) {
                            sortButtonRef.current.showPicker();
                        } else {
                            sortButtonRef.current.click();
                        }
                    } catch (e) {
                        sortButtonRef.current.click();
                    }
                } else if (focusedIndex === -3 && cartButtonRef.current) {
                    event.preventDefault();
                    cartButtonRef.current.click();
                } else if (focusedIndex === -4 && goBackMainButtonRef.current) {
                    event.preventDefault();
                    goBackMainButtonRef.current.click();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [focusedIndex, loading, filteredDrugs, isSearchMenuOpen, focusedIndexSearch, searchMenuOptions]);

    const toggleFilterMenu = () => {
        setIsSearchMenuOpen(prev => !prev);
        // Reset focus index when opening menu
        if (!isSearchMenuOpen) {
            setFocusedIndexSearch(0);
        }
    };

const getCategoryKey = (value) => {
    return Object.keys(categories).find(key => categories[key] === value);
};

const applySortToItems = (items, sort) => {
    const sorted = [...items];
    
    switch (sort) {
        case 'name-asc':
            return sorted.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        default:
            return sorted;
    }
};

const applyFilter = (filter) => {
    setSelectedFilter(filter);
    let filteredItems;

    if (filter === null) {
        // Reset filter
        filteredItems = drugsItems;
    } else if (['A-G', 'H-P', 'Q-Z'].includes(filter)) {
        // Alphabetical filters
        filteredItems = drugsItems.filter(drug => {
            const upperChar = drug.label[0].toUpperCase();
            switch (filter) {
                case 'A-G': return upperChar >= 'A' && upperChar <= 'G';
                case 'H-P': return upperChar >= 'H' && upperChar <= 'P';
                case 'Q-Z': return upperChar >= 'Q' && upperChar <= 'Z';
                default: return true;
            }
        });
    } else if (Object.keys(categories).includes(filter)) {
        // Category filters (using key)
        filteredItems = drugsItems.filter(drug => drug.category === filter);
    } else if (Object.values(categories).includes(filter)) {
        // Category filters (using value) - convert to key
        const categoryKey = getCategoryKey(filter);
        filteredItems = drugsItems.filter(drug => drug.category === categoryKey);
    } else {
        // Fallback to reset if filter not recognized
        filteredItems = drugsItems;
    }

    // Apply current sort order
    const sortedItems = applySortToItems(filteredItems, sortOrder);

    setIsSearchMenuOpen(false);
    setFilteredDrugs(sortedItems);
    setFocusedIndex(0);
};

const applySort = (sort) => {
    setSortOrder(sort);
    
    // Apply sort to currently filtered items
    const sortedItems = applySortToItems(filteredDrugs, sort);
    setFilteredDrugs(sortedItems);
};


    const openModal = (drug) => {
        setSelectedDrug(drug);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDrug(null);
    };

    async function handlePayment() {
        // Stock check
        const size = parseInt(selectedDrug?.size) || 0;
        if (size <= 0) {
            navigate('/insufficient-stock', { state: { drug: selectedDrug, from: '/non-prescription-drugs' } });
            return;
        }

        try {
            const paymentResponse = await fetch(`${config.backendUrl}/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drug_id: selectedDrug.id,
                })
            });

            if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                throw new Error(`Payment failed: ${paymentResponse.status} ${errorText}`);
            }

            const paymentResult = await paymentResponse.json();
            setClientSecret(paymentResult.clientSecret);
            setPaymentModalOpen(true);

        } catch (error) {
            console.error('Payment Error:', error);
            navigate('/payment-error', {
                state: {
                    errorMessage: error.message,
                    from: '/non-prescription-drugs'
                }
            });
        }
    }

    const handleStockUpdate = async (drugId) => {
        try {
            const stockResponse = await fetch(`${config.backendUrl}/update-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ drug_id: drugId })
            });

            if (!stockResponse.ok) {
                const errorData = await stockResponse.json();
                throw new Error(errorData.error || "Échec de la mise à jour du stock");
            }

            // 1. Invalidate the cache
            availableMedicineCache = null;
            availableMedicineFetched = false;

            // 2. Reload the data
            await fetchDrugs(true); // true to force reload

            return true;
        } catch (error) {
            console.error('Stock Update Error:', error);
            setStockUpdateError(error.message);
            return false;
        }
    };

    // Payment success function
    const handlePaymentSuccess = async (paymentIntent) => {
        // Update stock
        const stockUpdated = await handleStockUpdate(selectedDrug.id);

        if (stockUpdated) {
            navigate('/payment-success', {
                state: {
                    drug: selectedDrug,
                    paymentId: paymentIntent.id
                }
            });
        } else {
            // Handle stock update error
            setPaymentModalOpen(false);
            setIsModalOpen(true); // Reopen the medication modal
        }
    };

    // Dismiss inactivity modal on user activity
    useEffect(() => {
        if (!showInactivityModal) {
            return;
        }
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
                <div className={`${config.fontSizes.md} ${config.textColors.secondary}`}>
                    Chargement des médicaments...
                </div>
            </div>
        );
    }

    return (
        
        <div className={`w-full min-h-screen flex flex-col bg-background_color`}>
            {/* Header */}
            <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                <div className="flex items-center gap-4"> 
                    <Link to="/"
                        ref={goBackMainButtonRef}
                        tabIndex={0}
                        className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                            ${focusedIndex === -4 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            {...createVoiceOverHandlers(speak)}>
                        <config.icons.arrowLeft className="text-xl" /> 
                    </Link> 
                    <h1 className="text-3xl font-semibold text-black">Catalogue des médicaments</h1>
                </div> 
                <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" /> 
            </div> 
            {/* Filter and Sort Bar */}
            <div className="w-full px-8 py-4 flex items-center gap-6"> 
                {/* Filter dropdown */}
                <div className="flex flex-col"> 
                    <label className="text-xs text-gray-500 mb-1">Filtrer</label>
                    <div className="relative"> 
                        <select
                            ref={searchButtonRef}
                            value={selectedFilter || ''}
                            onChange={(e) => applyFilter(e.target.value || null)}
                            className={`appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 
                                focus:outline-none focus:ring-2 focus:ring-pink-300 min-w-[200px] cursor-pointer
                                ${focusedIndex === -1 ? 'ring-2 ring-pink-300' : ''}`}
                                {...createVoiceOverHandlers(speak)} 
                        >
                            <option value="">Tous les types</option> 
                            <option value="A-G">A - G</option>
                            <option value="H-P">H - P</option>
                            <option value="Q-Z">Q - Z</option>
                            {Object.entries(categories).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))} 
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /> 
                            </svg> 
                        </div> 
                    </div> 
                </div> 
                {/* Sort dropdown */} 
                <div className="flex flex-col"> 
                    <label className="text-xs text-gray-500 mb-1">Trier</label> 
                    <div className="relative">
                        <select
                            ref={sortButtonRef}
                            value={sortOrder}
                            onChange={(e) => applySort(e.target.value)}
                            className={`appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 
                                focus:outline-none focus:ring-2 focus:ring-pink-300 min-w-[250px] cursor-pointer
                                ${focusedIndex === -2 ? 'ring-2 ring-pink-300' : ''}`}
                            {...createVoiceOverHandlers(speak)}
                        >
                            <option value="name-asc">Ordre alphabétique (A-Z)</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /> 
                            </svg> 
                        </div> 
                    </div> 
                </div> 
                {/* Spacer */}
                <div className="flex-grow"></div> 

                {/* Cart button */}
                <button
                    ref={cartButtonRef}
                    {...createVoiceOverHandlers(speak)}
            onClick={() => navigate('/cart')}
                    className={`flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700
                        hover:bg-gray-50 transition-colors relative
                        ${focusedIndex === -3 ? 'ring-2 ring-pink-300' : ''}`}
                > 
                    <span>PANIER</span>
                    <config.icons.cart className="text-lg" />
                    {getCartCount() > 0 && ( 
                        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {getCartCount()} 
                        </span> 
                    )} 


                </button>
            </div>
            {/* Drugs grid container */}
            <div
                className="flex-1 px-8 py-4 overlow-y-auto" 
                ref={drugsListRef}
            >
                <div className="grid grid-cols-4 gap-4"> 
                    {filteredDrugs.map((item, index) => (
                        <button 
            {...createVoiceOverHandlers(speak)}
                            key={item.id}
                            id={`drug-${item.id}`}
                            ref={el => itemRefs.current[index] = el}
                            tabIndex={0}
                            type="button"
                            className={`bg-white rounded-xl p-5 text-left cursor-pointer
                                transition-transform duration-300 hover:scale-105 
                                ${index === focusedIndex ? 'scale-105 ring-2 ring-pink-300' : ''}`} 
                            onClick={() => openModal(item)}
                        >
                            {/* Drug name */} 
                            <h3 className="text-lg font-bold text-black mb-1">
                                {item.label}
                            </h3>
                            {/* Description */}
                            <p className="text-sm text-gray-500 mb-6">
                                {item.description || categories[item.category] || 'Médicament disponible'}
                            </p>
                            {/* Price and stock */}
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-black">
                                    {item.price ? `${item.price.toFixed(2)}€` : 'Prix non défini'}
                                </span>
                                <span className={`text-sm ${item.size > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.size > 0 ? 'En stock' : 'Non disponible'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {isModalOpen && selectedDrug && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Semi-transparent overlay */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"

                        onClick={closeModal}
                    ></div> 
                    
                    {/* Modal content - solid background pink */}
                    <div className="relative bg-pink-50 rounded-2xl shadow-2xl max-w-7xl w-[95%] max-h-[95vh] overflow-y-auto">
                        {/* Header */}
                        <div className="w-full px-8 py-6 flex justify-between items-center border-b border-pink-200">
                            <div className="flex items-center gap-4"> 
                                <button ref={backButtonRef}
                                    onClick={closeModal}
                                    className={`flex items-center text-black hover:text-gray-600 transition-colors p-3 rounded-full hover:bg-pink-100
                                        ${modalFocusIndex === 0 ? 'scale-105 bg-pink-100' : ''}`}
            {...createVoiceOverHandlers(speak)}>
                                    <config.icons.arrowLeft className="text-2xl" /> 
                                </button>
                                <h1 className="text-3xl font-semibold text-black">Choix du médicament</h1> 
                            </div> 
                            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-12" />
                        </div> 


                        {/* Content */}
                        <div className="p-10"> 
                            <div className="flex gap-12"> 
                                {/* Left side - Product card */}
                                <div className="bg-white rounded-2xl p-8 flex-1"> 
                                    {/* Drug name and category */}
                                    <h2 className="text-3xl font-bold text-black mb-2">{selectedDrug.label}</h2> 
                                    <p className="text-lg text-gray-500 mb-6">{categories[selectedDrug.category] || 'Médicament'}</p>

                                    {/* Description */}
                                    <div className="mb-6"> 
                                        <h3 className="text-lg font-bold text-black mb-2">Description</h3>
                                        <p className="text-base text-gray-600">{selectedDrug.description || 'Description non disponible'}</p> 
                                    </div> 


                                    {/* Product info */}
                                    <div className="mb-8"> 
                                        <h3 className="text-lg font-bold text-black mb-3">Informations produit</h3>
                                        <div className="space-y-2 text-base">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Forme :</span>
                                                <span className="text-black">{selectedDrug.forme || 'Comprimés'}</span> 
                                            </div> 

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Dosage :</span>
                                                <span className="text-black">{selectedDrug.dosage || 'Non spécifié'}</span>
                                            </div> 

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Présentation :</span>
                                                <span className="text-black">{selectedDrug.presentation || `Boîte de ${selectedDrug.size} comprimés`}</span>
                                            </div> 

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Laboratoire :</span>
                                                <span className="text-black">{selectedDrug.laboratoire || 'Non spécifié'}</span>
                                            </div> 

                                        </div> 

                                    </div> 


                                    {/* Add to cart button */}
                                    <button ref={payButtonRef}
                                        {...createVoiceOverHandlers(speak)}
            onClick={() => {
                                            if (selectedDrug.size > 0) {
                                                addToCart(selectedDrug);
                                                closeModal();
                                                navigate('/cart');} else {
                                                navigate('/insufficient-stock', { state: { drug: selectedDrug, from: '/non-prescription-drugs' } });
                                            }
                                        }}
                                        className={`w-full py-4 rounded-full text-lg font-semibold flex items-center justify-center gap-3
                                            transition-transform duration-300 hover:scale-105
                                            ${selectedDrug.size > 0 
                                                ? 'bg-black text-white' 
                                                : 'bg-gray-400 text-white'}
                                            ${modalFocusIndex === 1 ? 'scale-105' : ''}`}
                                    >
                                        {selectedDrug.size > 0 ? ( 
                                            <> 
                                                AJOUTER AU PANIER 
                                                <config.icons.cart className="text-xl" /> 
                                            </> 
                                        ) : ( 
                                            'VOIR LES OPTIONS DISPONIBLES'
                                        )} 
                                    </button>
                                </div> 


                                {/* Right side - Price and info */}
                                <div className="flex-1"> 
                                    {/* Price and stock */}
                                    <div className="mb-8"> 
                                        <p className="text-5xl font-bold text-black">{selectedDrug.price ? `${selectedDrug.price.toFixed(2)}€` : 'Prix non défini'}</p>
                                        <p className={`text-xl mt-2 ${selectedDrug.size > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {selectedDrug.size > 0 ? 'En stock' : 'Non disponible'}
                                        </p> 
                                    </div> 


                                    {/* Usage advice */} 
                                    <div className="mb-8"> 
                                        <h3 className="text-xl font-bold text-black mb-3">Conseil d'utilisation</h3>
                                        <ul className="text-base text-gray-600 space-y-2"> 
                                            <li>Adultes : 1 comprimé toutes les 6 heures</li> 
                                            <li>Maximum 4 comprimés par jour</li>
                                            <li>A prendre avec un verre d'eau</li> 
                                            <li>Peut être pris pendant ou hors des repas</li>
                                        </ul> 
                                    </div>

                                    {/* Precautions */}
                                    <div> 
                                        <h3 className="text-xl font-bold text-black mb-3">Précautions</h3>
                                        <ul className="text-base text-gray-600 space-y-2"> 
                                            <li>Ne pas dépasser la dose recommandée</li>
                                            <li>Déconseillé en cas d'allergie au paracétamol</li>
                                            <li>Consulter un médecin si les symptômes persistent</li>
                                            <li>Tenir hors de portée des enfants</li>
                                        </ul> 
                                    </div> 
                                </div> 
                            </div> 
                        </div> 
                    </div> 
                </div> 


            )}

            {paymentModalOpen && clientSecret && (
                <ModalStandard onClose={() => setPaymentModalOpen(false)}>
                    <div className="p-8">
                        <h2 className={`${config.fontSizes.xxl} font-bold mb-8`}>
                            Paiement pour {selectedDrug.label} - €{selectedDrug.price.toFixed(2)}
                        </h2>
                        <ElementsWrapper clientSecret={clientSecret}>
                            <PaymentForm
                                clientSecret={clientSecret}
                                amount={selectedDrug.price * 100}
                                drugId={selectedDrug.id} // Pass the drug ID
                                onSuccess={handlePaymentSuccess}
                                onError={(error) => {
                                    navigate('/payment-error', {
                                        state: {
                                            errorMessage: error.message,
                                            from: '/non-prescription-drugs'
                                        }
                                    });
                                }}
                            />
                        </ElementsWrapper>
                    </div>
                </ModalStandard>
            )}

            {stockUpdateError && (
                <div className={
                    `fixed top-4 right-4 ${config.fontSizes.md} ${config.textColors.white}
                    ${config.buttonColors.red} ${config.padding.button} ${config.borderRadius.md}
                    ${config.shadows.md} z-50`}
                >
                    <div className="flex items-center">
                        <config.icons.timesCircle className="mr-2" />
                        {stockUpdateError}
                        <button className="ml-4"
                            {...createVoiceOverHandlers(speak)}
            onClick={() => setStockUpdateError(null)}
                        >
                        <config.icons.times />
                        </button>
                    </div>
                </div>
            )}

            {showInactivityModal && (
                <ModalStandard onClose={() => setShowInactivityModal(false)}>
                    <div className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Inactivité détectée
                    </div>
                    <div className={`${config.fontSizes.sm} mb-4`}>
                        Vous allez être redirigé vers l'accueil dans 1 minute...
                    </div>
                    <button className={
                        `${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                        ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                        ${config.transitions.default}`
                    } {...createVoiceOverHandlers(speak)}
            onClick={() => setShowInactivityModal(false)}>
                        Rester sur la page
                    </button>
                </ModalStandard>
            )}
        </div>
    );
}

export default NonPrescriptionDrugs;
