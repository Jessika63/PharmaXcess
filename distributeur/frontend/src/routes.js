import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import DocumentsChecking from './components/pages/documents_checking';
import NonPrescriptionDrugs from './components/pages/non_prescription_drugs';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/documents-checking" element={<DocumentsChecking />} />
                <Route path="/non-prescription-drugs" element={<NonPrescriptionDrugs />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
