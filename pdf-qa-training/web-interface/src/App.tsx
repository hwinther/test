import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Advanced from './pages/Advanced';
import NorwegianLegal from './pages/NorwegianLegal';
import TestAssets from './pages/TestAssets';
import EditorMock from './pages/EditorMock';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/advanced" element={<Advanced />} />
        <Route path="/norwegian" element={<NorwegianLegal />} />
        <Route path="/test-assets" element={<TestAssets />} />
        <Route path="/editor" element={<EditorMock />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
