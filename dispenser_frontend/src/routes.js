import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import DocumentsChecking from './components/pages/documents_checking';
import NonPrescriptionDrugs from './components/pages/non_prescription_drugs';
import DrugStoresAvailable from './components/pages/drug_stores_available';
import InsufficientStock from './components/pages/insufficient_stock';
import NearbyPharmacies from './components/pages/nearby_pharmacies';
import TransportMode from './components/pages/transport_mode';
import DirectionsMapPage from './components/pages/DirectionsMapPage';
import Preorder from './components/pages/preorder';
import ErrorPage from './components/ErrorPage';
import PaymentSuccess from './components/pages/PaymentSuccess';
import PaymentError from './components/pages/PaymentError';
import DocumentsFlow from './components/pages/DocumentsFlow';
import DirectionQRPage from './components/pages/MapQrCodePage';
import Cart from './components/pages/Cart';
import MedicationDelivery from './components/pages/MedicationDelivery';
import { VoiceOverProvider } from './context/VoiceOverContext';
import { CartProvider } from './context/CartContext';
import { PrescriptionProvider } from './context/PrescriptionContext';

function AppRoutes() {
    return (
        <VoiceOverProvider>
            <CartProvider>
                <PrescriptionProvider>
                    <Router>
                <Routes>
                    <Route path="/" element={<App />} />

                <Route path="/documents-flow" element={<DocumentsFlow />} />

                <Route path="/documents-checking" element={<DocumentsChecking />} />
                <Route path="/drug-stores-available" element={<DrugStoresAvailable />} />
                <Route path="/insufficient-stock" element={<InsufficientStock />} />
                <Route path="/nearby-pharmacies" element={<NearbyPharmacies />} />
                <Route path="/transport-mode" element={<TransportMode />} />
                <Route path="/non-prescription-drugs" element={<NonPrescriptionDrugs />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/medication-delivery" element={<MedicationDelivery />} />
                <Route path="/directions-map" element={<DirectionsMapPage />} />
                <Route path="/preorder" element={<Preorder />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-error" element={<PaymentError />} />
                <Route path="/direction-qr" element={<DirectionQRPage />} />
            </Routes>
        </Router>
                </PrescriptionProvider>
            </CartProvider>
        </VoiceOverProvider>
    );
}

export default AppRoutes;
