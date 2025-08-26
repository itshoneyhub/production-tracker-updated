import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import Modal from '../components/Modal';
import SettleModal from '../components/SettleModal';
import { debtors as localDebtorsApi, projects as localProjectsApi } from '../localApi';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';
const USE_LOCAL_STORAGE = import.meta.env.VITE_APP_USE_LOCAL_STORAGE === 'true';

const api = {
  debtors: USE_LOCAL_STORAGE ? localDebtorsApi : {
    get: () => axios.get(`${API_BASE_URL}/debtors`),
    post: (data) => axios.post(`${API_BASE_URL}/debtors`, data),
    put: (id, data) => axios.put(`${API_BASE_URL}/debtors/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/debtors/${id}`),
    settle: (id, invoiceNumber) => axios.post(`${API_BASE_URL}/debtors/${id}/settle`, { invoiceNumber }),
  },
  projects: USE_LOCAL_STORAGE ? localProjectsApi : {
    get: () => axios.get(`${API_BASE_URL}/projects`),
  },
};

const Debtors = ({ showAlert }) => {
  const [debtors, setDebtors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleDebtorId, setSettleDebtorId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyDebtor, setHistoryDebtor] = useState(null);
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

  const fetchDebtors = useCallback(async () => {
    try {
      const response = await api.debtors.get();
      setDebtors(response.data);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      showAlert('Error fetching debtors.', 'error');
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
    fetchDebtors();
    fetchProjects();
  }, [fetchDebtors, fetchProjects]);

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
        await api.debtors.put(editingId, formData);
        fetchDebtors();
        showAlert('Debtor updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating debtor:", error);
        showAlert('Error updating debtor.', 'error');
      }
    } else {
      try {
        await api.debtors.post(formData);
        fetchDebtors();
        showAlert('Debtor created successfully!', 'success');
      } catch (error) {
        console.error("Error creating debtor:", error);
        showAlert('Error creating debtor.', 'error');
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

  const handleEdit = (debtor) => {
    setEditingId(debtor.id);
    setFormData({
      project_id: debtor.project_id,
      customer_name: debtor.customer_name,
      advance_date: new Date(debtor.advance_date),
      advance_amount: debtor.advance_amount,
      paymentTerms: debtor.paymentTerms,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this debtor?");
    if (confirmDelete) {
      try {
        await api.debtors.delete(id);
        fetchDebtors();
        showAlert('Debtor deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting debtor:", error);
        showAlert('Error deleting debtor.', 'error');
      }
    }
  };

  const handleSettleClick = (id) => {
    setSettleDebtorId(id);
    setIsSettleModalOpen(true);
  };

  const handleSettle = async (invoiceNumber, settledAmount) => {
    try {
      await api.debtors.settle(settleDebtorId, settledAmount, invoiceNumber);
      fetchDebtors();
      showAlert('Advance settled successfully!', 'success');
    } catch (error) {
      console.error("Error settling advance:", error);
      showAlert('Error settling advance.', 'error');
    }
  };

  const handleUnsettle = async (settlementId) => {
    try {
      await api.debtors.unsettle(settleDebtorId, settlementId);
      fetchDebtors();
      showAlert('Settlement reversed successfully!', 'success');
    } catch (error) {
      console.error("Error reversing settlement:", error);
      showAlert('Error reversing settlement.', 'error');
    }
  };

  const handleHistoryClick = (debtor) => {
    console.log("History button clicked for debtor:", debtor);
    setHistoryDebtor(debtor);
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

  const currentDebtor = debtors.find(d => d.id === settleDebtorId);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = debtors.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div>
      <h2>Debtors</h2>
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
      {currentDebtor && (
        <SettleModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
          onSettle={handleSettle}
          advanceAmount={currentDebtor.remaining_amount}
          settlements={currentDebtor.settlements}
          onUnsettle={handleUnsettle}
        />
      )}
      {historyDebtor && (
        <SettlementHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          settlements={historyDebtor.settlements || []}
        />
      )}
                  <div className="table-container">
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
                  {currentRecords.map((debtor, index) => (
                    <tr key={debtor.id}>
                      <td>{index + 1}</td>
                      <td>{debtor.project_no}</td>
                      <td>{debtor.project_name}</td>
                      <td>{debtor.customer_name}</td>
                      <td>{new Date(debtor.advance_date).toLocaleDateString()}</td>
                      <td>{debtor.advance_amount}</td>
                      <td>{debtor.totalSettled}</td>
                      <td>{debtor.remaining_amount}</td>
                      <td>{debtor.lastInvoiceNumber}</td>
                      <td>{debtor.paymentTerms}</td>
                      <td>
                        {parseFloat(debtor.remaining_amount) > 0 && (
                          <button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => handleSettleClick(debtor.id)}>Settle</button>
                        )}
                        {parseFloat(debtor.remaining_amount) <= 0 && (
                          <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handleHistoryClick(debtor)}>History</button>
                        )}
                        <button style={{ backgroundColor: 'orange' }} onClick={() => handleEdit(debtor)}>Edit</button>
                        <button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => handleDelete(debtor.id)}>Delete</button>
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
        {Array.from({ length: Math.ceil(debtors.length / recordsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(debtors.length / recordsPerPage)))} disabled={currentPage === Math.ceil(debtors.length / recordsPerPage)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Debtors;

