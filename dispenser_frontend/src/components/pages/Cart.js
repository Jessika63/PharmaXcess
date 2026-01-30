import React, { useState, useEffect, useRef } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { loadStripe } from '@stripe/stripe-js';
import { FaMinus, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import config from '../../config';
import { useCart } from '../../context/CartContext';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';
import ModalStandard from '../modal_standard';
import useInactivityRedirect from '../../utils/useInactivityRedirect';
import ElementsWrapper from '../ElementsWrapper';
import PaymentForm from '../PaymentForm';

const stripePromise = loadStripe('pk_test_51Rsl1CLfU2UU0K5QVl6iyAUF5YuvHw648nWONQGJZmWPqtZhmxlZmSw6fORMnQNdzqtBe6Wd1LkTP7RCCoE71VyK00Zjm3nzmr');

function Cart() {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.cart);
  const { speak } = useVoiceOver();

    const navigate = useNavigate();
    const location = useLocation(); 
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    
    useInactivityRedirect(() => setShowInactivityModal(true));

    const subtotal = getCartTotal();
    const total = subtotal; // No surcharges for now

    const handleProceedToPayment = async () => {
        if (cartItems.length === 0) return;

        // If coming from verification, go to medication delivery
        if (location.state?.fromVerification) {
            navigate('/medication-delivery', { state: { cartItems: cartItems } });
            return;
        }

        // If the cart was opened from the "COMMANDER" preorder flow,
        // route the user to the preorder page instead of creating a payment. 
        if (location.state?.checkoutLabel === 'COMMANDER') {
            navigate('/preorder', { state: { items: cartItems } }); 
            return; 
        }

        try {
            // For the moment, we handle the first item in the cart
            // Pour l'instant, on traite le premier article du panier
            // TODO: Modify the backend to support multiple items 
            const firstItem = cartItems[0]; 

            
            // Create Payment Intent on the backend
            const paymentResponse = await fetch(`${config.backendUrl}/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drug_id: firstItem.id
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
                    from: '/cart'
                }
            });
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        // Empty the cart upon successful payment
        clearCart();
        navigate('/payment-success', {
            state: {
                paymentId: paymentIntent.id,
                items: cartItems
            }
        });
    };

    // Dismiss inactivity modal on user activity
    useEffect(() => {
        if (!showInactivityModal) return;
        const dismiss = () => setShowInactivityModal(false);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, dismiss));
        return () => events.forEach(event => window.removeEventListener(event, dismiss));
    }, [showInactivityModal]);

    return (
        <div className="w-full min-h-screen flex flex-col bg-background_color">
      
      
            {/* Header */}
            <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                    <Link to="/non-prescription-drugs"
                        className="flex items-center text-black hover:text-gray-600 transition-colors"
            {...createVoiceOverHandlers(speak)}>
                        <config.icons.arrowLeft className="text-xl" />
                    </Link>
                    <h1 className="text-3xl font-semibold text-black">Panier</h1>
                </div>
                <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
            </div>

            {/* Content */}
            {cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="flex-1 flex flex-col items-center justify-center px-8">
                    <div className="bg-white rounded-full p-8 mb-6">
                        <FaShoppingCart className="text-6xl text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-black mb-3">Votre panier est vide</h2>
                    <p className="text-lg text-gray-500 mb-8">Ajoutez des médicaments à votre panier pour continuer</p>
                    <Link to="/non-prescription-drugs"
                        className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold
                            hover:scale-105 transition-transform duration-300"
            {...createVoiceOverHandlers(speak)}>
                        PARCOURIR LES MÉDICAMENTS
                    </Link>
                </div>
            ) : (
                /* Filled Cart State */
                <div className="flex-1 px-8 py-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-black">Votre panier</h2>
                        <button {...createVoiceOverHandlers(speak)}
            onClick={() => navigate('/non-prescription-drugs')}
                            className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold
                                hover:scale-105 transition-transform duration-300"
                        >
                            CONTINUER MES ACHATS
                        </button>
                    </div>

                    <div className="flex gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl p-6 flex justify-between items-start"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-black">{item.label}</h3>
                                        <p className="text-sm text-gray-500">{item.description || 'Médicament'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-black">{item.price?.toFixed(2)} € / unité</p>
                                        <p className="text-sm text-gray-500">Total: {(item.price * item.quantity).toFixed(2)}€</p>
                                        
                                        {/* Quantity controls */}
                                        <div className="flex items-center justify-end gap-3 mt-3">
                                            <button {...createVoiceOverHandlers(speak)}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                                                    hover:bg-gray-100 transition-colors"
                                            >
                                                <FaMinus className="text-xs text-gray-600" />
                                            </button>
                                            <span className="text-lg font-semibold">{item.quantity}</span>
                                            <button {...createVoiceOverHandlers(speak)}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                                                    hover:bg-gray-100 transition-colors"
                                            >
                                                <FaPlus className="text-xs text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Delete button */}
                                        <button {...createVoiceOverHandlers(speak)}
            onClick={() => removeFromCart(item.id)}
                                            className="mt-3 text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="w-80">
                            <div className="bg-white rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-black mb-6">Résumé de la commande</h3>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span className="text-lg font-semibold text-black">{subtotal.toFixed(2)} €</span>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-lg font-bold text-black">Reste à charge</span>
                                        <span className="text-2xl font-bold text-black">{total.toFixed(2)}€</span>
                                    </div>
                                </div>

                                <button onClick={handleProceedToPayment}
                                    className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold
                                        hover:scale-105 transition-transform duration-300"
            {...createVoiceOverHandlers(speak)}>
                                    {location.state?.checkoutLabel || 'PROCÉDER AU PAIEMENT'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal - New design */} 

            {paymentModalOpen && clientSecret && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay semi-transparent */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setPaymentModalOpen(false)}
                    ></div>
                    
                    {/* Modal content - fond solide rose pâle */}
                    <div className="relative bg-pink-50 rounded-2xl shadow-2xl max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="w-full px-8 py-6 flex justify-between items-center border-b border-pink-200">
                            <div className="flex items-center gap-4">
                                <button {...createVoiceOverHandlers(speak)}
            onClick={() => setPaymentModalOpen(false)}
                                    className="flex items-center text-black hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-pink-100"
                                >
                                    <config.icons.arrowLeft className="text-xl" />
                                </button>
                                <h1 className="text-2xl font-semibold text-black">Paiement</h1>
                            </div>
                            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Résumé */}
                            <div className="bg-white rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-black mb-4">Résumé de la commande</h3>
                                <div className="space-y-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-gray-600">
                                            <span>{item.label} x{item.quantity}</span>
                                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                                    <span className="text-xl font-bold text-black">Total</span>
                                    <span className="text-2xl font-bold text-black">{total.toFixed(2)}€</span>
                                </div>
                            </div>

                            {/* Formulaire de paiement */}
                            <div className="bg-white rounded-xl p-6">
                                <h3 className="text-lg font-bold text-black mb-4">Informations de paiement</h3>
                                <ElementsWrapper clientSecret={clientSecret}>
                                    <PaymentForm
                                        clientSecret={clientSecret}
                                        amount={total * 100}
                                        onSuccess={handlePaymentSuccess}
                                        onError={(error) => {
                                            navigate('/payment-error', {
                                                state: {
                                                    errorMessage: error.message,
                                                    from: '/cart'
                                                }
                                            });
                                        }}
                                    />
                                </ElementsWrapper>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inactivity Modal */}
            {showInactivityModal && (
                <ModalStandard onClose={() => setShowInactivityModal(false)}>
                    <div className={`${config.fontSizes.lg} font-bold mb-4`}>
                        Inactivité détectée
                    </div>
                    <div className={`${config.fontSizes.sm} mb-4`}>
                        Vous allez être redirigé vers l'accueil dans 1 minute...
                    </div>
                    <button className={`${config.padding.button} ${config.buttonStyles.secondary} ${config.fontSizes.md}
                            ${config.borderRadius.md} ${config.shadows.md} ${config.scaleEffects.hover}
                            ${config.transitions.default}`}
                        {...createVoiceOverHandlers(speak)}
            onClick={() => setShowInactivityModal(false)}
                    >
                        Rester sur la page
                    </button>
                </ModalStandard>
            )}
        </div>
    );
}

export default Cart;
