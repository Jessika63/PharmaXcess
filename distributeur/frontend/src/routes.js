import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import DocumentsChecking from './components/pages/documents_checking';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/documents-checking" element={<DocumentsChecking />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
