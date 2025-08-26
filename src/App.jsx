import React, { useState, useCallback } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import Master from './pages/Master';
import ImportExport from './pages/ImportExport';
import Advances from './pages/Advances';
import LoginPage from './pages/LoginPage';
import AlertMessage from './components/AlertMessage'; // Import AlertMessage
import Portal from './components/Portal'; // Import Portal

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type) => {
    setAlert({ message, type });
    // Alert will auto-dismiss via its internal timer
  }, []);

  return (
    <Router>
      <Portal wrapperId="alert-root">
        <AlertMessage message={alert?.message} type={alert?.type} onDismiss={() => setAlert(null)} />
      </Portal>
      <>
        <Navbar /> {/* Removed onLogout prop */}
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project-list" element={<ProjectList showAlert={showAlert} />} />
            <Route path="/advances" element={<Advances showAlert={showAlert} />} />
            <Route path="/master" element={<Master showAlert={showAlert} />} />
            <Route path="/import-export" element={<ImportExport showAlert={showAlert} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </>
    </Router>
  );
}

export default App;