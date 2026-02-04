import { useState, useCallback } from 'react';
import medicineService from '../services/medicineService';

export const useStockValidation = () => {
  const [stockInfo, setStockInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const checkStockAvailability = useCallback(async (medicineId, requestedQuantity = 1, alreadyInCart = 0) => {
    try {
      setLoading(true);
      
      const stock = await medicineService.getMedicineStock(medicineId);
      const available = stock - alreadyInCart;
      
      // Store stock info
      setStockInfo(prev => ({
        ...prev,
        [medicineId]: {
          totalStock: stock,
          alreadyInCart: alreadyInCart,
          available: available
        }
      }));

      return {
        available: available >= requestedQuantity,
        availableQuantity: Math.max(0, available),
        totalStock: stock,
        alreadyInCart: alreadyInCart,
        requestedQuantity: requestedQuantity
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      return {
        available: false,
        availableQuantity: 0,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockInfo = useCallback((medicineId) => {
    return stockInfo[medicineId] || null;
  }, [stockInfo]);

  const canAddMore = useCallback((medicineId, quantityInCart) => {
    const info = getStockInfo(medicineId);
    if (!info) return false;
    return info.available > 0;
  }, [getStockInfo]);

  return {
    checkStockAvailability,
    getStockInfo,
    canAddMore,
    loading
  };
};

export default useStockValidation;
