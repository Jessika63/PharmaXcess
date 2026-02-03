import config from '../config';

// Service pour gérer les appels API du cart
const cartService = {
  // Initialiser un nouveau panier
  async initCart() {
    try {
      const response = await fetch(`${config.backendUrl}/cart/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to init cart: ${response.status}`);
      }

      const data = await response.json();
      return data.cart_id;
    } catch (error) {
      console.error('Error initializing cart:', error);
      throw error;
    }
  },

  // Récupérer les détails du panier
  async getCart(cartId) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/${cartId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Ajouter un item au panier
  async addItem(cartId, medicineId, quantity = 1) {
    try {
      console.log('cartService.addItem - cartId:', cartId, 'medicineId:', medicineId, 'quantity:', quantity);
      const payload = {
        cart_id: cartId,
        id: medicineId,
        quantity: quantity,
      };
      console.log('cartService.addItem - payload:', payload);
      console.log('cartService.addItem - URL:', `${config.backendUrl}/cart/add`);
      
      const response = await fetch(`${config.backendUrl}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('cartService.addItem - response status:', response.status);
      const data = await response.json();
      console.log('cartService.addItem - response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to add item: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Ajouter une liste d'items au panier
  async addList(cartId, items) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/add-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
          items: items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to add list: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error adding list to cart:', error);
      throw error;
    }
  },

  // Retirer un item du panier
  async removeItem(cartId, medicineId, quantity = 1) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
          id: medicineId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove item: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  // Retirer une liste d'items du panier
  async removeList(cartId, items) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/remove-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
          items: items,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove list: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing list from cart:', error);
      throw error;
    }
  },

  // Valider le panier
  async validateCart(cartId) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  },

  // Valider le panier et finalize la commande (décrémenter stock)
  async checkoutCart(cartId) {
    try {
      console.log('💳 Checkout cart:', cartId);
      
      const response = await fetch(`${config.backendUrl}/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
        }),
      });

      console.log('💳 Checkout response status:', response.status);
      const data = await response.json();
      console.log('💳 Checkout response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to checkout: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error checking out cart:', error);
      throw error;
    }
  },

  // Annuler le panier
  async cancelCart(cartId) {
    try {
      const response = await fetch(`${config.backendUrl}/cart/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling cart:', error);
      throw error;
    }
  },
};

export default cartService;
