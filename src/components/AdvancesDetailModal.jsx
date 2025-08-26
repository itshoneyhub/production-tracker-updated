import React from 'react';
import Modal from './Modal';

const AdvancesDetailModal = ({ show, onClose, data, type, month }) => {
  if (!show) {
    return null;
  }

  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Advances for ${new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}`;

  return (
    <Modal show={show} onClose={onClose} title={title}>
      <div className="table-container">
        <table className="dashboard-details-table">
          <thead>
            <tr>
              <th>Project No</th>
              <th>Project Name</th>
              <th>Customer Name</th>
              <th>Advance Amount</th>
              <th>Balance Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.projectno}</td>
                  <td>{entry.projectname}</td>
                  <td>{entry.customername}</td>
                  <td>₹{parseFloat(entry.advance_amount).toFixed(2)}</td>
                  <td>₹{parseFloat(entry.balance_amount).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No entries found for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default AdvancesDetailModal;
