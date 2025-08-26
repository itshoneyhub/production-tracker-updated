import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProjectForm = ({
  formData,
  handleInputChange,
  handleDateChange,
  handleSubmit,
  projectNoError,
  stages,
  editingId,
  handleCancel,
  onClose,
}) => {
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Project No</label>
            <input
              type="text"
              name="projectNo"
              value={formData.projectNo}
              onChange={handleInputChange}
              placeholder="Enter project number"
              required
            />
            {projectNoError && <p style={{ color: 'red' }}>{projectNoError}</p>}
          </div>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Enter project name"
            />
          </div>
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="form-group">
            <label>Owner</label>
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              placeholder="Enter owner name"
              required
            />
          </div>
          <div className="form-group">
            <label>Project Date</label>
            <DatePicker
              selected={formData.projectDate}
              onChange={(date) => handleDateChange(date, 'projectDate')}
            />
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <DatePicker
              selected={formData.targetDate}
              onChange={(date) => handleDateChange(date, 'targetDate')}
            />
          </div>
          <div className="form-group">
            <label>Dispatch Month</label>
            <input
              type="text"
              name="dispatchMonth"
              value={formData.dispatchMonth}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Production Stage</label>
            <select
              name="productionStage"
              value={formData.productionStage}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Stage</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.name}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Enter remarks"
            />
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          {editingId ? (
            <>
              <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Save</button>
              <button type="button" className='cancel' onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button type="submit" className="add-button">+ Add</button>
              <button type="button" onClick={onClose} className='cancel'>Cancel</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
