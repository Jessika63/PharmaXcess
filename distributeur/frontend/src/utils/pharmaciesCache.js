// Global cache for pharmacies data (shared between components)
let pharmaciesDataCache = null;

export const getPharmaciesCache = () => pharmaciesDataCache;
export const setPharmaciesCache = (data) => {
  pharmaciesDataCache = data;
};
export const clearPharmaciesCache = () => {
  pharmaciesDataCache = null;
}; 