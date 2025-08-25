import './css/global.css'
import React, { useRef, useEffect, useState } from 'react';
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
    const stripePromiseRef = useRef(stripePromise);
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
    const cacheRef = useRef(null);

    // Modal popup focus system
    const [modalFocusIndex, setModalFocusIndex] = useState(0);

    const [showInactivityModal, setShowInactivityModal] = useState(false);
    useInactivityRedirect(() => setShowInactivityModal(true));

    const [clientSecret, setClientSecret] = useState(null);

    const [stockUpdateError, setStockUpdateError] = useState(null);

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
                    handlePayment();
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

            if (filteredDrugs.length === 0) {
                return;
            }

            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "Tab"].includes(event.key)) {
                event.preventDefault();
            }

            if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
                if (focusedIndex > 0) {
                    setFocusedIndex(focusedIndex - 1);
                } else if (focusedIndex === 0) {
                    setFocusedIndex(-1);
                } else if (focusedIndex === -1) {
                    setFocusedIndex(-2);
                } else if (focusedIndex === -2) {
                    // Circular: go from first control (-2) to last drug item
                    setFocusedIndex(filteredDrugs.length - 1);
                }
            } else if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
                if (focusedIndex === -2) {
                    setFocusedIndex(-1);
                } else if (focusedIndex === -1) {
                    setFocusedIndex(0);
                } else if (focusedIndex < filteredDrugs.length - 1) {
                    setFocusedIndex(focusedIndex + 1);
                } else if (focusedIndex === filteredDrugs.length - 1) {
                    // Circular: go from last drug item to first control (-2)
                    setFocusedIndex(-2);
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

    async function handlePayment() {
        // Stock check
        const size = parseInt(selectedDrug?.size) || 0;
        if (size <= 0) {
            navigate('/insufficient-stock', { state: { from: '/non-prescription-drugs' } });
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
                    <p className="font-bold flex items-center">
                        <config.icons.filter className="mr-2" />
                        Filtrer par :
                    </p>

                    {searchMenuOptions.map((option, index) => {
                        // Determine the option type
                        let onClickHandler;
                        let displayText;
                        let icon = null;

                        if (["A-G", "H-P", "Q-Z"].includes(option)) {
                            // Alphabetical filters
                            onClickHandler = () => applyFilter(option);
                            displayText = option.replace('-', ' - ');
                        }
                        else if (option === "Reset") {
                            // Reset
                            onClickHandler = () => applyFilter(null);
                            displayText = "Réinitialiser";
                            icon = <config.icons.sync className="mr-2" />;
                        }
                        else if (option === "Close") {
                            // Close - only close the menu, no filter
                            onClickHandler = () => {
                                setIsSearchMenuOpen(false);
                                setFocusedIndex(0);
                            };
                            displayText = "Fermer";
                            icon = <config.icons.times className="mr-2" />;
                        }
                        else {
                            // Categories (value from categories)
                            const categoryKey = Object.keys(categories).find(
                                key => categories[key] === option
                            );
                            onClickHandler = () => applyFilter(categoryKey);
                            displayText = option;
                        }

                        return (
                            <button
                                onClick={onClickHandler}
                                key={option}
                                ref={el => (searchMenuRefs.current[index] = el)}
                                tabIndex={focusedIndexSearch === index ? 0 : -1}
                                className={`block w-full text-left py-2 ${
                                    focusedIndexSearch === index ? config.scaleEffects.focus : ""
                                } ${icon ? "flex items-center" : ""}`}
                            >
                                {icon}
                                {displayText}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className={`flex items-center ${config.buttonColors.buttonBackground} ${config.padding.button} ${config.borderRadius.md} ${config.shadows.md}`}>
                <span className={`${config.fontSizes.md} ${config.textColors.black}`}>
                    Voici la liste des médicaments disponibles à la vente :
                </span>
                <button
                    ref={searchButtonRef}
                    onClick={toggleFilterMenu}
                    className={
                        `ml-4 flex items-center gap-2 ${config.textColors.primary} ${config.fontSizes.sm}
                        ${config.buttonColors.mainGradient} ${config.padding.button} ${config.borderRadius.sm}
                        ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default}
                        ${focusedIndex == -1 ? config.scaleEffects.focus : ""}`
                    }>
                    <config.icons.search className={config.fontSizes.md} />
                    Rechercher
                </button>
            </div>

            <div
                className="w-4/5 mt-16 h-[50vh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-200"
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
                        className={`w-1/3 h-32 mx-auto mt-16 py-3 font-semibold
                            ${selectedDrug.size > 0 ? config.buttonColors.green : config.buttonColors.red}
                            ${config.textColors.white} ${config.borderRadius.sm} ${config.shadows.md}
                            ${config.transitions.default} ${config.fontSizes.xl}
                            ${modalFocusIndex === 1 ? config.scaleEffects.focus : ''}`}
                        onClick={selectedDrug.size > 0 ? handlePayment : () => navigate('/insufficient-stock', { state: { from: '/non-prescription-drugs' } })}
                    >
                        {selectedDrug.size > 0 ? (
                            <>
                                <config.icons.money className="mr-2" />
                                Payer
                            </>
                        ) : (
                            <>
                                <config.icons.timesCircle className="mr-2" />
                                Stock indisponible - Options de retrait
                            </>
                        )}
                    </button>
                </ModalStandard>
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
                        <button
                            className="ml-4"
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
                    } onClick={() => setShowInactivityModal(false)}>
                        Rester sur la page
                    </button>
                </ModalStandard>
            )}
        </div>
    );
}

export default NonPrescriptionDrugs;
