import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import DocumentsChecking from './components/pages/documents_checking';
import NonPrescriptionDrugs from './components/pages/non_prescription_drugs';
import DrugUnavailable from './components/pages/drug_unavailable';
import DrugStoresAvailable from './components/pages/drug_stores_available';
import PaymentFailed from './components/pages/payment_failed';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/documents-checking" element={<DocumentsChecking />} />
                <Route path="/drug-unavailable" element={<DrugUnavailable />} />
                <Route path="/drug-stores-available" element={<DrugStoresAvailable />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/non-prescription-drugs" element={<NonPrescriptionDrugs />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
