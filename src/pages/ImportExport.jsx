import React from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || '/api';

const parseDate = (dateInput, fieldName, rowNumber) => {
  if (!dateInput) {
    if (fieldName === 'Project Date') {
      throw new Error(`Project Date is missing in row ${rowNumber}. Please use DD-MM-YYYY format.`);
    }
    return null;
  }

  if (dateInput instanceof Date) {
    return !isNaN(dateInput.getTime()) ? dateInput : null;
  }

  if (typeof dateInput === 'number') {
    const d = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid ${fieldName} in row ${rowNumber}. Please use DD-MM-YYYY format.`);
    }
    return d;
  }

  if (typeof dateInput === 'string') {
    const parts = dateInput.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (parts) {
      const day = parseInt(parts[1], 10);
      const month = parseInt(parts[2], 10);
      let year = parseInt(parts[3], 10);

      if (year < 100) {
        year += (year > 50 ? 1900 : 2000);
      }

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ${fieldName} format in row ${rowNumber}: "${dateInput}". Please use DD-MM-YYYY format.`);
  }
  return d;
};

const ImportExport = ({ showAlert }) => {
  const navigate = useNavigate();

  const handleExport = () => {
    const headers = [
      'Project No',
      'Project Name',
      'Customer Name',
      'Owner',
      'Project Date',
      'Target Date',
      'Dispatch Month',
      'Production Stage',
      'Remarks',
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, 'Project_Template.xlsx');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showAlert('No file selected.', 'info');
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });

      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });

      if (jsonData.length === 0) {
        showAlert('The file is empty or has no data.', 'error');
        return;
      }

      const importedProjects = jsonData.map((row, index) => {
        const parsedTargetDate = parseDate(row['Target Date'], 'Target Date', index + 2);
        return {
          id: uuidv4(),
          projectNo: row['Project No'] || '',
          projectName: row['Project Name'] || '',
          customerName: row['Customer Name'] || '',
          owner: row['Owner'] || '',
          projectDate: parseDate(row['Project Date'], 'Project Date', index + 2),
          targetDate: parsedTargetDate,
          dispatchMonth: parsedTargetDate ? `${parsedTargetDate.toLocaleString('default', { month: 'long' })} ${parsedTargetDate.getFullYear()}` : '',
          productionStage: row['Production Stage'] || '',
          remarks: row['Remarks'] || '',
        };
      });

      // Send imported projects to the backend
      for (const project of importedProjects) {
        try {
          const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error saving project to backend:", project, error);
          showAlert(`Error importing project ${project.projectNo}: ${error.message}`, 'error');
          return;
        }
      }

      showAlert('Projects imported successfully!', 'success');
      navigate('/');

    } catch (error) {
      console.error("Import Error:", error);
      showAlert('Error importing file. Please check the file format and data.', 'error');
    }
  };

  return (
    <div className="page-container">
      <h2>Import/Export</h2>
      <div className="import-export-container">
        <div className="export-section">
          <h3>Export Template</h3>
          <p>Download the Excel template to import projects.</p>
          <button onClick={handleExport}>Download Template</button>
        </div>
        <div className="import-section">
          <h3>Import Projects from your computer</h3>
          <p>Upload an Excel file to import projects.</p>
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
        </div>
        
      </div>
    </div>
  );
};

export default ImportExport;