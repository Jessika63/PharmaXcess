import config from '../config';

// Cache for medicines data
let medicinesCache = null;
let medicinesCacheFetched = false;

const medicineService = {
  // Fetch all available medicines
  async getAllMedicines() {
    console.log('💊 medicineService.getAllMedicines() called');
    console.log('💊 Cache status - fetched:', medicinesCacheFetched, 'cache:', medicinesCache);
    
    if (medicinesCacheFetched && medicinesCache) {
      console.log('💊 Returning cached medicines:', medicinesCache);
      return medicinesCache;
    }

    try {
      const url = `${config.backendUrl}/get_available_medicine`;
      console.log('💊 Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('💊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medicines: ${response.status}`);
      }

      const data = await response.json();
      console.log('💊 Data received:', data);
      console.log('💊 Data type:', typeof data, 'isArray:', Array.isArray(data));
      
      // Extract the medicine array from the response object
      const medicines = data.medicine || data;
      console.log('💊 Extracted medicines:', medicines);
      console.log('💊 Medicines is array:', Array.isArray(medicines), 'length:', medicines?.length);
      
      medicinesCache = medicines;
      medicinesCacheFetched = true;
      console.log('💊 Cache updated, returning:', medicines);
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

  // Clear cache (useful for refreshing)
  clearCache() {
    medicinesCache = null;
    medicinesCacheFetched = false;
  }
};

export default medicineService;
