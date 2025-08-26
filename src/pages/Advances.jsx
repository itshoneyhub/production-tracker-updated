import React, { useState, useEffect } from 'react';
import Debtors from './Debtors';
import Creditors from './Creditors';
import AdvancesDashboard from '../components/AdvancesDashboard';
import Modal from '../components/Modal';
import '../components/PasswordModal.css';

const Advances = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const lastAuthTime = sessionStorage.getItem('advancesAuthTime');
    if (lastAuthTime && new Date().getTime() - lastAuthTime < 600000) {
      setIsAuthenticated(true);
      setIsModalOpen(false);
    }
  }, []);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'pass') {
      sessionStorage.setItem('advancesAuthTime', new Date().getTime());
      setIsAuthenticated(true);
      setIsModalOpen(false);
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="password-modal-form">
          <h2>Enter password to access this tab</h2>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button type="submit">Submit</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </Modal>
    );
  }

  return (
    <div className="page-container">
      <div className="filter-buttons">
        <button
          type="button"
          className={activeTab === 'Dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('Dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={activeTab === 'Debtors' ? 'active' : ''}
          onClick={() => setActiveTab('Debtors')}
        >
          Debtors
        </button>
        <button
          type="button"
          className={activeTab === 'Creditors' ? 'active' : ''}
          onClick={() => setActiveTab('Creditors')}
        >
          Creditors
        </button>
      </div>
      {activeTab === 'Debtors' && <Debtors showAlert={showAlert} />}
      {activeTab === 'Creditors' && <Creditors showAlert={showAlert} />}
      {activeTab === 'Dashboard' && <AdvancesDashboard />}
    </div>
  );
};

export default Advances;