import React from 'react';
import Modal from './Modal';

const SettlementHistoryModal = ({ isOpen, onClose, settlements }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Settlement History</h3>
      {settlements && settlements.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Settled Amount</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.id}>
                <td>{s.invoiceNumber}</td>
                <td>{s.settledAmount}</td>
                <td>{new Date(s.settlementDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No settlement history available.</p>
      )}
    </Modal>
  );
};

export default SettlementHistoryModal;
