/**
 * Centralized configuration for VoiceOver texts
 * of the PharmaXcess dispenser
 */

export const voiceOverTexts = {
  // Home page
  startingPage: "Bienvenue sur PharmaXcess. Choisissez votre service. Option 1: Vous avez une ordonnance médicale à traiter. Continuer avec ordonnance. Option 2: Achat libre de médicaments disponibles. Continuer sans ordonnance.",
  
  // Documents Flow
  documentsFlow: "Vérification de vos documents. Suivez les étapes pour scanner votre ordonnance, votre carte d'identité et votre carte vitale.",
  
  // Scan prescription 
  scanOrdonnance: "Scanner votre ordonnance. Vous pouvez scanner un QR code ou une ordonnance papier. Veuillez présenter votre document au scanner.",
  scanOrdonnanceQR: "Scanner le QR code de votre ordonnance. Veuillez positionner le QR code devant le scanner.", 
  scanOrdonnancePapier: "Scanner votre ordonnance papier. Veuillez insérer votre ordonnance dans le scanner présent sur la machine. Cliquez sur lancer le scan pour commencer.",
  
  
  // Scan identity card
  scanCarteIdentite: "Scanner votre carte d'identité. Veuillez insérer le recto puis le verso de votre carte d'identité dans le scanner présent sur la machine.",
  
  // Scan health insurance card
  scanCarteVitale: "Scanner votre carte vitale. Prenez une photo de votre carte vitale en la positionnant face à la caméra.",
  
  // VVerification
  verification: "Vérification de vos informations. Veuillez vérifier les informations affichées. Cochez les médicaments que vous souhaitez obtenir. Cliquez sur VALIDER pour continuer ou RECOMMENCER pour scanner à nouveau.",
  
  // Cart
  cart: "Votre panier. Vérifiez les médicaments sélectionnés et leurs quantités. Vous pouvez modifier les quantités ou supprimer des articles. Cliquez sur Finaliser pour procéder au paiement.",
  
  // Non-prescription drugs
  nonPrescriptionDrugs: "Catalogue des médicaments disponibles sans ordonnance. Parcourez la liste et cliquez sur un médicament pour voir les détails et l'acheter.",
  
  // Medication delivery
  medicationDelivery: "Délivrance de vos médicaments en cours. Veuillez récupérer vos médicaments dans le compartiment indiqué.",
  
  // Medical advice
  medicalAdvice: "Conseils médicamenteux. Veuillez lire attentivement les conseils d'utilisation et les précautions pour chaque médicament. Vous pouvez passer au médicament suivant en cliquant sur PASSER.",
  
  // Payment success
  paymentSuccess: "Paiement effectué avec succès. Votre paiement a été traité. Vous allez être redirigé vers la délivrance des médicaments.",
  
  // Payment error
  paymentError: "Erreur de paiement. Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer ou contacter le support.",
  
  // Nearby pharmacies
  nearbyPharmacies: "Pharmacies à proximité. Consultez la liste des pharmacies disponibles dans votre zone. Sélectionnez une pharmacie pour obtenir l'itinéraire.",
  
  // Insufficient stock
  insufficientStock: "Stock insuffisant. Certains médicaments ne sont pas disponibles en quantité suffisante. Vous pouvez commander dans une autre pharmacie ou passer une précommande.",
  
  // Transport mode 
  transportMode: "Choisissez votre mode de transport. Sélectionnez votre moyen de déplacement pour calculer l'itinéraire vers la pharmacie: voiture, vélo, ou à pied.",
  
  // Itinerary QR
  directionQR: "QR Code pour l'itinéraire. Scannez ce QR code avec votre téléphone pour obtenir l'itinéraire vers la pharmacie sélectionnée.",
  
  // Preorder
  preorder: "Précommande de médicaments. Remplissez le formulaire pour précommander vos médicaments dans la pharmacie de votre choix.",
  
  // Preorder success
  preorderSuccess: "Précommande enregistrée avec succès. Vous recevrez une notification lorsque vos médicaments seront disponibles."
};

/**
 * Helper function to get a VoiceOver text
 * @param {string} key - Key of the text in voiceOverTexts
 * @param {object} variables - Variables to replace in the text
 * @returns {string} - Formatted text
 */
export const getVoiceOverText = (key, variables = {}) => {
  let text = voiceOverTexts[key] || "";
  
  // Replace variables if provided
  Object.keys(variables).forEach(varKey => {
    text = text.replace(`{${varKey}}`, variables[varKey]);
  });
  
  return text;
};

export default voiceOverTexts;
