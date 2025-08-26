import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Assuming Modal component is generic and reusable
import AdvancesDetailModal from './AdvancesDetailModal'; // New component for details
import { advances as localAdvancesApi } from '../localApi';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';
const USE_LOCAL_STORAGE = import.meta.env.VITE_APP_USE_LOCAL_STORAGE === 'true';

const api = {
  advances: USE_LOCAL_STORAGE ? localAdvancesApi : {
    summary: () => fetch(`${API_BASE_URL}/advances/summary`).then(res => res.json()),
    details: (type, month, year) => fetch(`${API_BASE_URL}/advances/details?month=${month}&year=${year}&type=${type}`).then(res => res.json()),
  },
};

const AdvancesDashboard = () => {
  const [summaryData, setSummaryData] = useState({
    debtors: [],
    creditors: []
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailType, setDetailType] = useState('');
  const [detailMonth, setDetailMonth] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.advances.summary();
        const data = USE_LOCAL_STORAGE ? response.data : response;
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching advances summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const getMonthlyTotal = (data, month) => {
    const entry = data.find(item => item.month === month);
    return entry ? parseFloat(entry.total_amount).toFixed(2) : '0.00';
  };

  const handleAmountClick = async (type, month) => {
    try {
      const [year, mon] = month.split('-');
      const response = await api.advances.details(type, mon, year);
      const data = USE_LOCAL_STORAGE ? response.data : response;
      setDetailData(data);
      setDetailType(type);
      setDetailMonth(month);
      setShowDetailModal(true);
    } catch (error) {
      console.error(`Error fetching ${type} details for ${month}:`, error);
    }
  };

  const availableMonths = Array.from(new Set([
    ...summaryData.debtors.map(d => d.month),
    ...summaryData.creditors.map(c => c.month),
  ])).sort();

  const currentDebtorAmount = getMonthlyTotal(summaryData.debtors, selectedMonth);
  const currentCreditorAmount = getMonthlyTotal(summaryData.creditors, selectedMonth);

  return (
    <div className="page-container">
      <h2>Advances Dashboard</h2>

      <div className="filter-section">
        <label htmlFor="month-filter">Select Month:</label>
        <select id="month-filter" className="month-filter-dropdown" value={selectedMonth} onChange={handleMonthChange}>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card" style={{ backgroundColor: '#e6ffe6' }}>
          <h3>Debtors Advances ({new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
          <p 
            style={{ color: 'green', cursor: 'pointer' }}
            onClick={() => handleAmountClick('debtor', selectedMonth)}
          >
            ₹{currentDebtorAmount}
          </p>
        </div>

        <div className="metric-card" style={{ backgroundColor: '#ffe6e6' }}>
          <h3>Creditors Advances ({new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })})</h3>
          <p 
            style={{ color: 'red', cursor: 'pointer' }}
            onClick={() => handleAmountClick('creditor', selectedMonth)}
          >
            ₹{currentCreditorAmount}
          </p>
        </div>
      </div>

      {showDetailModal && (
        <AdvancesDetailModal
          show={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          data={detailData}
          type={detailType}
          month={detailMonth}
        />
      )}
    </div>
  );
};

export default AdvancesDashboard;
