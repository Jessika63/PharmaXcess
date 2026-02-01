import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import medicineService from '../services/medicineService';

const CartContext = createContext(); 


export const useCart = () => { 
    const context = useContext(CartContext); 
    if (!context) { 
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 


export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stockInfo, setStockInfo] = useState({}); // Track stock for each medicine
    const [medicinesData, setMedicinesData] = useState([]);

    // Initialize cart and fetch medicines on mount
    useEffect(() => { 
        const initialize = async () => {
            try {
                console.log('🚀 Initialisation CartContext...');
                setLoading(true);
                
                // Fetch medicines data
                try {
                    console.log('📦 Fetching medicines...');
                    const meds = await medicineService.getAllMedicines();
                    console.log('📦 Medicines récupérés:', meds);
                    console.log('📦 Type:', typeof meds, 'isArray:', Array.isArray(meds));
                    const medsArray = Array.isArray(meds) ? meds : [];
                    console.log('📦 Setting medicinesData with', medsArray.length, 'items');
                    setMedicinesData(medsArray);
                } catch (medErr) {
                    console.error('❌ Error fetching medicines:', medErr);
                    setMedicinesData([]);
                }
                
                // Initialize cart
                try {
                    console.log('🛒 Initializing cart...');
                    const newCartId = await cartService.initCart();
                    console.log('🛒 Cart initialized with ID:', newCartId);
                    setCartId(newCartId);
                } catch (cartErr) {
                    console.error('❌ Error initializing cart:', cartErr);
                }
                
                setCartItems([]);
                setError(null);
            } catch (err) {
                console.error('❌ Error during initialization:', err);
                setError(err.message);
            } finally {
                setLoading(false);
                console.log('✅ Initialisation terminée');
            }
        };
        
        initialize();
    }, []); 

    const getAvailableStock = useCallback((medicineId) => {
        console.log('🔍 getAvailableStock - medicineId:', medicineId);
        console.log('🔍 medicinesData:', medicinesData);
        console.log('🔍 medicinesData.length:', medicinesData.length);
        
        const medicine = medicinesData.find(m => parseInt(m.id) === parseInt(medicineId));
        console.log('🔍 medicine trouvé:', medicine);
        
        if (!medicine) {
            console.warn('⚠️ Medicine non trouvé pour id:', medicineId);
            return 0;
        }
        
        const stock = parseInt(medicine.size) || 0;
        const inCart = cartItems.reduce((acc, item) => {
            return item.id === parseInt(medicineId) ? acc + item.quantity : acc;
        }, 0);
        
        console.log('🔍 stock total:', stock, 'inCart:', inCart, 'available:', stock - inCart);
        return Math.max(0, stock - inCart);
    }, [medicinesData, cartItems]);


    const addToCart = useCallback(async (drug) => {
        console.log('addToCart called with drug:', drug);
        console.log('cartId:', cartId);
        
        let currentCartId = cartId;
        
        // If cart is not initialized, initialize it first
        if (!currentCartId) {
            console.warn('⚠️ Cart not initialized, initializing now...');
            try {
                const newCartId = await cartService.initCart();
                console.log('✅ New cart initialized:', newCartId);
                currentCartId = newCartId;
                setCartId(newCartId);
            } catch (err) {
                console.error('❌ Failed to initialize cart:', err);
                setError('Impossible d\'initialiser le panier');
                return false;
            }
        }

        try {
            setLoading(true);
            console.log('Adding to cart, cartId:', currentCartId, 'drugId:', drug.id);
            
            // Check stock before adding
            const availableStock = getAvailableStock(drug.id);
            console.log('Available stock:', availableStock);
            if (availableStock <= 0) {
                setError(`${drug.label} n'est pas en stock`);
                return false;
            }
            
            console.log('Calling cartService.addItem with:', currentCartId, drug.id, 1);
            const result = await cartService.addItem(currentCartId, drug.id, 1);
            console.log('addItem result:', result);
            
            // Update cart items from backend response
            setCartItems(result.cart?.items || result.items || []);
            
            // Check if there was a warning about stock
            if (result.warning) {
                setError(`Stock limité: ${result.warning.added}/${result.warning.requested} ajouté(e)(s)`);
                return result.warning.added > 0;
            }
            
            setError(null);
            return true;
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [cartId, getAvailableStock]); 


    const removeFromCart = useCallback(async (drugId) => { 
        if (!cartId) {
            setError('Cart not initialized');
            return;
        }

        try {
            setLoading(true);
            const result = await cartService.removeItem(cartId, drugId, 1);
            setCartItems(result.items || []);
            setError(null);
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [cartId]); 


    const updateQuantity = useCallback(async (drugId, newQuantity) => {
        if (!cartId) {
            setError('Cart not initialized');
            return;
        }

        if (newQuantity <= 0) { 
            removeFromCart(drugId);
            return; 
        }

        try {
            setLoading(true);
            
            // Check available stock before increasing
            if (newQuantity > cartItems.find(item => item.id === drugId)?.quantity) {
                const availableStock = getAvailableStock(drugId);
                if (availableStock <= 0) {
                    setError('Stock insuffisant');
                    return;
                }
            }
            
            const currentItem = cartItems.find(item => item.id === drugId);
            
            if (!currentItem) {
                setError('Item not found in cart');
                return;
            }

            const currentQuantity = currentItem.quantity;
            const quantityDiff = newQuantity - currentQuantity;

            let result;
            if (quantityDiff > 0) {
                // Adding more items
                result = await cartService.addItem(cartId, drugId, quantityDiff);
            } else {
                // Removing items
                result = await cartService.removeItem(cartId, drugId, Math.abs(quantityDiff));
            }

            setCartItems(result.cart?.items || result.items || []);
            
            if (result.warning) {
                setError(`Stock limité: ${result.warning.available} disponible(s)`);
            } else {
                setError(null);
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [cartId, cartItems, getAvailableStock, removeFromCart]); 


    const clearCart = useCallback(() => { 
        setCartItems([]);
        setCartId(null);
        setError(null);
    }, []); 

    const validateCart = useCallback(async () => {
        if (!cartId) {
            setError('Cart not initialized');
            return null;
        }

        try {
            setLoading(true);
            const result = await cartService.validateCart(cartId);
            setError(null);
            return result;
        } catch (err) {
            console.error('Error validating cart:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [cartId]);


    const getCartTotal = () => { 
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0); 
    }; 


    const getCartCount = () => { 
        return cartItems.reduce((count, item) => count + item.quantity, 0); 
    };


    return ( 
        <CartContext.Provider value={{
            cartItems,
            cartId,
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            validateCart,
            getCartTotal,
            getCartCount,
            getAvailableStock,
            loading,
            error,
            medicinesData
        }}>
            {children}
        </CartContext.Provider>
    ); 
}; 


export default CartContext; 

