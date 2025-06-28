import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import DocumentsChecking from './components/pages/documents_checking';
import NonPrescriptionDrugs from './components/pages/non_prescription_drugs';
import DrugStoresAvailable from './components/pages/drug_stores_available';
import InsufficientStock from './components/pages/insufficient_stock';
import DirectionsMapPage from './components/pages/DirectionsMapPage';
import Preorder from './components/pages/preorder';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/documents-checking" element={<DocumentsChecking />} />
                <Route path="/drug-stores-available" element={<DrugStoresAvailable />} />
                <Route path="/insufficient-stock" element={<InsufficientStock />} />
                <Route path="/non-prescription-drugs" element={<NonPrescriptionDrugs />} />
                <Route path="/directions-map" element={<DirectionsMapPage />} />
                <Route path="/preorder" element={<Preorder />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
