import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import Modal from '../components/Modal';
import SettleModal from '../components/SettleModal';
import SettlementHistoryModal from '../components/SettlementHistoryModal';
import { creditors as localCreditorsApi, projects as localProjectsApi } from '../localApi';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';
const USE_LOCAL_STORAGE = import.meta.env.VITE_APP_USE_LOCAL_STORAGE === 'true';

const api = {
  creditors: USE_LOCAL_STORAGE ? localCreditorsApi : {
    get: () => axios.get(`${API_BASE_URL}/creditors`),
    post: (data) => axios.post(`${API_BASE_URL}/creditors`, data),
    put: (id, data) => axios.put(`${API_BASE_URL}/creditors/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/creditors/${id}`),
    settle: (id, invoiceNumber) => axios.post(`${API_BASE_URL}/creditors/${id}/settle`, { invoiceNumber }),
  },
  projects: USE_LOCAL_STORAGE ? localProjectsApi : {
    get: () => axios.get(`${API_BASE_URL}/projects`),
  },
};

const Creditors = ({ showAlert }) => {
  const [creditors, setCreditors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleCreditorId, setSettleCreditorId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCreditor, setHistoryCreditor] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    customer_name: '',
    advance_date: new Date(),
    advance_amount: '',
    paymentTerms: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(25);

  const fetchCreditors = useCallback(async () => {
    try {
      const response = await api.creditors.get();
      setCreditors(response.data);
    } catch (error) {
      console.error('Error fetching creditors:', error);
      showAlert('Error fetching creditors.', 'error');
    }
  }, [showAlert]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.projects.get();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showAlert('Error fetching projects.', 'error');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchCreditors();
    fetchProjects();
  }, [fetchCreditors, fetchProjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'project_id') {
      const selectedProject = projects.find(p => p.id === value);
      setFormData({ 
        ...formData, 
        project_id: value, 
        customer_name: selectedProject ? selectedProject.customerName : '' 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      try {
        await api.creditors.put(editingId, formData);
        fetchCreditors();
        showAlert('Creditor updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating creditor:", error);
        showAlert('Error updating creditor.', 'error');
      }
    } else {
      try {
        await api.creditors.post(formData);
        fetchCreditors();
        showAlert('Creditor created successfully!', 'success');
      } catch (error) {
        console.error("Error creating creditor:", error);
        showAlert('Error creating creditor.', 'error');
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      project_id: '',
      customer_name: '',
      advance_date: new Date(),
      advance_amount: '',
      paymentTerms: '',
    });
  };

  const handleEdit = (creditor) => {
    setEditingId(creditor.id);
    setFormData({
      project_id: creditor.project_id,
      customer_name: creditor.customer_name,
      advance_date: new Date(creditor.advance_date),
      advance_amount: creditor.advance_amount,
      paymentTerms: creditor.paymentTerms,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this creditor?");
    if (confirmDelete) {
      try {
        await api.creditors.delete(id);
        fetchCreditors();
        showAlert('Creditor deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting creditor:", error);
        showAlert('Error deleting creditor.', 'error');
      }
    }
  };

  const handleSettleClick = (id) => {
    setSettleCreditorId(id);
    setIsSettleModalOpen(true);
  };

  const handleSettle = async (invoiceNumber, settledAmount) => {
    try {
      await api.creditors.settle(settleCreditorId, settledAmount, invoiceNumber);
      fetchCreditors();
      showAlert('Advance settled successfully!', 'success');
    } catch (error) {
      console.error("Error settling advance:", error);
      showAlert('Error settling advance.', 'error');
    }
  };

  const handleUnsettle = async (settlementId) => {
    try {
      await api.creditors.unsettle(settleCreditorId, settlementId);
      fetchCreditors();
      showAlert('Settlement reversed successfully!', 'success');
    } catch (error) {
      console.error("Error reversing settlement:", error);
      showAlert('Error reversing settlement.', 'error');
    }
  };

  const handleHistoryClick = (creditor) => {
    setHistoryCreditor(creditor);
    setIsHistoryModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      project_id: '',
      customer_name: '',
      advance_date: new Date(),
      advance_amount: '',
      paymentTerms: '',
    });
  };

  const currentCreditor = creditors.find(c => c.id === settleCreditorId);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = creditors.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div>
      <h2>Creditors</h2>
      <button onClick={() => setIsModalOpen(true)}>New</button>
      <Modal isOpen={isModalOpen} onClose={handleCancel}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project</label>
            <select name="project_id" value={formData.project_id} onChange={handleInputChange}>
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectNo} - {project.projectName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Advance Date</label>
            <DatePicker selected={formData.advance_date} onChange={(date) => handleDateChange(date, 'advance_date')} />
          </div>
          <div className="form-group">
            <label>Advance Amount</label>
            <input type="number" name="advance_amount" value={formData.advance_amount} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Payment Terms</label>
            <input type="text" name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} />
          </div>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </Modal>
      {currentCreditor && (
        <SettleModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
          onSettle={handleSettle}
          advanceAmount={currentCreditor.remaining_amount}
          settlements={currentCreditor.settlements}
          onUnsettle={handleUnsettle}
        />
      )}
      {historyCreditor && (
        <SettlementHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryCreditor(null);
          }}
          settlements={historyCreditor.settlements || []}
        />
      )}
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Project No</th>
              <th>Project Name</th>
              <th>Customer</th>
              <th>Advance Date</th>
              <th>Advance Amount</th>
              <th>Settled Amount</th>
              <th>Balance Amount</th>
              <th>Invoice Number</th>
              <th>Payment Terms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((creditor, index) => (
            <tr key={creditor.id}>
              <td>{index + 1}</td>
              <td>{creditor.project_no}</td>
              <td>{creditor.project_name}</td>
              <td>{creditor.customer_name}</td>
              <td>{new Date(creditor.advance_date).toLocaleDateString()}</td>
              <td>{creditor.advance_amount}</td>
              <td>{creditor.totalSettled}</td>
              <td>{creditor.remaining_amount}</td>
              <td>{creditor.lastInvoiceNumber}</td>
              <td>{creditor.paymentTerms}</td>
              <td>
                {parseFloat(creditor.remaining_amount) > 0 && (
                  <button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => handleSettleClick(creditor.id)}>Settle</button>
                )}
                {parseFloat(creditor.remaining_amount) <= 0 && (
                  <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handleHistoryClick(creditor)}>History</button>
                )}
                <button style={{ backgroundColor: 'orange' }} onClick={() => handleEdit(creditor)}>Edit</button>
                <button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => handleDelete(creditor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        {Array.from({ length: Math.ceil(creditors.length / recordsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(creditors.length / recordsPerPage)))} disabled={currentPage === Math.ceil(creditors.length / recordsPerPage)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Creditors;