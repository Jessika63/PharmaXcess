import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // Load from localStorage on mount
    useEffect(() => { 
        const stored = localStorage.getItem('cartItems'); 
        if (stored) { 
            try { 
                const parsed = JSON.parse(stored); 
                setCartItems(parsed); 
            } catch (error) { 
                console.error('Erreur lors du parsing du panier:', error); 
            }
        }
    }, []); 

    // Save to localStorage on every change
    useEffect(() => { 
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (drug) => {
        setCartItems(prev => { 
            const existingItem = prev.find(item => item.id === drug.id);
            if (existingItem) {
                // Level up quantity if already in cart
                return prev.map(item =>
                    item.id === drug.id
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                ); 
            }
            // Add new item to cart
            return [...prev, { ...drug, quantity: 1 }];
        }); 
    }; 


    const removeFromCart = (drugId) => { 
        setCartItems(prev => prev.filter(item => item.id !== drugId));
    }; 


    const updateQuantity = (drugId, newQuantity) => {
        if (newQuantity <= 0) { 
            removeFromCart(drugId);
            return; 
        }
        setCartItems(prev => 
            prev.map(item => 
                item.id === drugId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        ); 
    }; 


    const clearCart = () => { 
        setCartItems([]); 
    }; 


    const getCartTotal = () => { 
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0); 
    }; 


    const getCartCount = () => { 
        return cartItems.reduce((count, item) => count + item.quantity, 0); 
    }; 


    return ( 
        <CartContext.Provider value={{
            cartItems,
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            getCartTotal,
            getCartCount
        }}> 
            {children} 
        </CartContext.Provider>
    ); 
}; 


export default CartContext; 

