import config from '../config';

// Cache for medicines data
let medicinesCache = null;
let medicinesCacheFetched = false;

const medicineService = {
  // Fetch all available medicines
  async getAllMedicines() {

    if (medicinesCacheFetched && medicinesCache) {
      return medicinesCache;
    }

    try {
      const url = `${config.backendUrl}/get_available_medicine`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medicines: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the medicine array from the response object
      const medicines = data.medicine || data;
      
      medicinesCache = medicines;
      medicinesCacheFetched = true;
      return medicines;
    } catch (error) {
      console.error('❌ Error fetching medicines:', error);
      throw error;
    }
  },

  // Get stock for a specific medicine
  async getMedicineStock(medicineId) {
    try {
      const medicines = await this.getAllMedicines();
      
      // Search through the medicines to find stock
      if (Array.isArray(medicines)) {
        const med = medicines.find(m => parseInt(m.id) === parseInt(medicineId));
        return med ? parseInt(med.size) || 0 : 0;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error fetching stock for medicine ${medicineId}:`, error);
      return 0;
    }
  },

  // Get multiple medicines by IDs
  async getMedicinesByIds(medicineIds) {
    try {
      const medicines = await this.getAllMedicines();
      
      if (Array.isArray(medicines)) {
        return medicines.filter(m => medicineIds.includes(parseInt(m.id)));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching medicines by IDs:', error);
      return [];
    }
  },

  // Get medical advice for a specific medicine
  async getMedicalAdvice(medicineId) {
    try {
      const url = `${config.backendUrl}/medicine/${medicineId}/medical-advice`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Medical advice not found for medicine ${medicineId}`);
          return null;
        }
        throw new Error(`Failed to fetch medical advice: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error fetching medical advice for medicine ${medicineId}:`, error);
      return null;
    }
  },

  // Clear cache (useful for refreshing)
  clearCache() {
    medicinesCache = null;
    medicinesCacheFetched = false;
  }
};

export default medicineService;
