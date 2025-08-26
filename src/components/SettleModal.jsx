import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const SettleModal = ({ isOpen, onClose, onSettle, advanceAmount, settlements, onUnsettle }) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [settleAmount, setSettleAmount] = useState(advanceAmount);

  useEffect(() => {
    setSettleAmount(advanceAmount);
  }, [advanceAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSettle(invoiceNumber, settleAmount);
    setInvoiceNumber('');
    setSettleAmount(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Invoice Number</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            required
            min="0"
            max={advanceAmount}
          />
        </div>
        <div className="form-actions">
          <button type="submit">OK</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>

      {settlements && settlements.length > 0 && (
        <div className="settlement-history">
          <h3>Settlement History</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id}>
                  <td>{s.invoiceNumber}</td>
                  <td>{s.settledAmount}</td>
                  <td>{new Date(s.settlementDate).toLocaleString()}</td>
                  <td>
                    <button onClick={() => onUnsettle(s.id)}>Unsettle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default SettleModal;
