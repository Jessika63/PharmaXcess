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
                setLoading(true);
                
                // Fetch medicines data
                try {
                    const meds = await medicineService.getAllMedicines();
                    const medsArray = Array.isArray(meds) ? meds : [];
                    setMedicinesData(medsArray);
                    setMedicinesData(medsArray);
                } catch (medErr) {
                    console.error('❌ Error fetching medicines:', medErr);
                    setMedicinesData([]);
                }
                
                // Initialize cart
                try {
                    const newCartId = await cartService.initCart();
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
            }
        };
        
        initialize();
    }, []); 

    const getAvailableStock = useCallback((medicineId) => {
        
        const medicine = medicinesData.find(m => parseInt(m.id) === parseInt(medicineId));
        
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


    const addToCart = useCallback(async (drug, options = {}) => {
        console.log('addToCart called with drug:', drug);
        console.log('cartId:', cartId);
        console.log('options:', options);
        
        const { allowOutOfStock = false } = options;
        
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
            
            // Check stock before adding (unless allowOutOfStock is true for preorders)
            if (!allowOutOfStock) {
                const availableStock = getAvailableStock(drug.id);
                console.log('Available stock:', availableStock);
                if (availableStock <= 0) {
                    setError(`${drug.label} n'est pas en stock`);
                    return false;
                }
            }
            
            // For out-of-stock preorders, add directly to local state without backend call
            // since backend will reject items with insufficient stock
            if (allowOutOfStock) {
                console.log('✅ Adding out-of-stock item to cart for preorder:', drug.label);
                const newItem = {
                    id: drug.id,
                    label: drug.label,
                    description: drug.description || 'Médicament',
                    price: drug.price || 0,
                    quantity: 1,
                    isPreorder: true // Flag to identify preorder items
                };
                
                // Check if item already in cart
                const existingIndex = cartItems.findIndex(item => item.id === drug.id);
                if (existingIndex >= 0) {
                    // Update quantity
                    const updatedItems = [...cartItems];
                    updatedItems[existingIndex].quantity += 1;
                    setCartItems(updatedItems);
                } else {
                    // Add new item
                    setCartItems([...cartItems, newItem]);
                }
                
                setError(null);
                return true;
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
    }, [cartId, getAvailableStock, cartItems]); 


    const addListToCart = useCallback(async (items) => {

        let currentCartId = cartId;
        
        // If cart is not initialized, initialize it first
        if (!currentCartId) {
            console.warn('⚠️ Cart not initialized, initializing now...');
            try {
                const newCartId = await cartService.initCart();
                currentCartId = newCartId;
                setCartId(newCartId);
            } catch (err) {
                console.error('❌ Failed to initialize cart:', err);
                setError('Impossible d\'initialiser le panier');
                return { success: false, notAdded: items };
            }
        }

        try {
            setLoading(true);
            console.log('📋 Calling cartService.addList with:', currentCartId, items);
            
            // Format items for backend: [{id: 1, quantity: 2}, {id: 5, quantity: 1}]
            const formattedItems = items.map(item => ({
                id: item.id,
                quantity: item.quantity || 1,
                label: item.label || item.nom || item.name
            }));
            
            const result = await cartService.addList(currentCartId, formattedItems);
            console.log('📋 addList result:', result);
            
            // Update cart items from backend response
            setCartItems(result.cart?.items || []);
            
            // Check if some items were not added
            if (result.not_added && result.not_added.length > 0) {
                console.warn('⚠️ Some items not added:', result.not_added);
                const notAddedNames = result.not_added.map(item => item.medicine_name).join(', ');
                setError(`Stock insuffisant pour: ${notAddedNames}`);
                return { success: true, notAdded: result.not_added };
            }
            
            setError(null);
            return { success: true, notAdded: [] };
        } catch (err) {
            console.error('❌ Error adding list to cart:', err);
            setError(err.message);
            return { success: false, notAdded: items };
        } finally {
            setLoading(false);
        }
    }, [cartId]);


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
            addListToCart,
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

