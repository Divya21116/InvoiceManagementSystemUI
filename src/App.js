import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import InvoiceSystem from './Components/InvoiceVersion';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<InvoiceSystem />} />
            </Routes>
        </Router>
    );
}

export default App;
