import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios'; // Import axios
import Modal from '../components/Modal';
import { stages as localStagesApi } from '../localApi';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';
const USE_LOCAL_STORAGE = import.meta.env.VITE_APP_USE_LOCAL_STORAGE === 'true';

// const api = {
//   stages: {
//     get: () => axios.get(`${API_BASE_URL}/stages`),
//     post: (data) => axios.post(`${API_BASE_URL}/stages`, data),
//     put: (id, data) => axios.put(`${API_BASE_URL}/stages/${id}`, data),
//     delete: (id) => axios.delete(`${API_BASE_URL}/stages/${id}`),
//   },
// };

const api = {
  stages: USE_LOCAL_STORAGE ? localStagesApi : {
    get: () => axios.get(`${API_BASE_URL}/stages`),
    post: (data) => axios.post(`${API_BASE_URL}/stages`, data),
    put: (id, data) => axios.put(`${API_BASE_URL}/stages/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/stages/${id}`),
  },
};

const Master = ({ showAlert }) => {
  const [stages, setStages] = useState([]);
  const [stageName, setStageName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch stages from the backend
  const fetchStages = useCallback(async () => {
    try {
      const response = await api.stages.get();
      setStages(response.data);
    } catch (error) {
      console.error("Error fetching stages:", error);
      showAlert('Error fetching stages.', 'error');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]); // Fetch stages on component mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stageName) return;

    if (editingId) {
      try {
        const response = await api.stages.put(editingId, { name: stageName.trim(), remarks });
        setStages(stages.map((stage) =>
          stage.id === editingId ? response.data : stage
        ));
        showAlert('Stage updated successfully!', 'success');
        setEditingId(null);
      } catch (error) {
        console.error("Error updating stage:", error);
        showAlert('Error updating stage.', 'error');
      }
    } else {
      try {
        const response = await api.stages.post({ name: stageName.trim(), remarks });
        setStages([...stages, response.data]);
        showAlert('Stage created successfully!', 'success');
      } catch (error) {
        console.error("Error creating stage:", error);
        showAlert('Error creating stage.', 'error');
      }
    }

    setStageName('');
    setRemarks('');
    setIsModalOpen(false);
  };

  const handleEdit = (stage) => {
    setEditingId(stage.id);
    setStageName(stage.name);
    setRemarks(stage.remarks);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stage?");
    if (confirmDelete) {
      try {
        await api.stages.delete(id);
        setStages(stages.filter((stage) => stage.id !== id));
        showAlert('Stage deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting stage:", error);
        showAlert('Error deleting stage.', 'error');
      }
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setStageName('');
    setRemarks('');
    setIsModalOpen(false);
  }

  return (
    <div className="page-container">
      <h2>Master (Production Stages)</h2>
      <div className="form-actions">
        <button type="button" onClick={() => setIsModalOpen(true)} className="add-button">+ Add</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Stage Name</label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Enter stage name"
                required
              />
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
              />
            </div>
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" style={{ backgroundColor: editingId ? 'green' : '' }}>{editingId ? 'Save' : '+ Add'}</button>
              <button type="button" className="cancel" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Stage Name</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={stage.id}>
                <td data-label="Sr. No">{index + 1}</td>
                <td data-label="Stage Name">{stage.name}</td>
                <td data-label="Remarks">{stage.remarks}</td>
                <td data-label="Actions" className="actions">
                  <button onClick={() => handleEdit(stage)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(stage.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Master;