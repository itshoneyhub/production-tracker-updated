const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// const dbPath = path.join(__dirname, 'db.json');

// let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let db = {
  projects: [],
  stages: [
    { id: '1', name: 'Planning', remarks: '' },
    { id: '2', name: 'Design', remarks: '' },
    { id: '3', name: 'In Progress', remarks: '' },
    { id: '4', name: 'Testing', remarks: '' },
    { id: '5', name: 'Done', remarks: '' },
  ],
  debtors: [],
  creditors: [],
};

const commit = () => {
  // fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

const query = (text, params) => {
  console.log('Executing query:', text, params);
  const [firstWord] = text.trim().split(' ');

  switch (firstWord.toUpperCase()) {
    case 'SELECT':
      return handleSelect(text, params);
    case 'INSERT':
      return handleInsert(text, params);
    case 'UPDATE':
      return handleUpdate(text, params);
    case 'DELETE':
      return handleDelete(text, params);
    default:
      throw new Error(`Unsupported query: ${text}`);
  }
};

const handleSelect = (text, params) => {
  const fromMatch = text.match(/FROM\s+(\w+)/i);
  const table = fromMatch ? fromMatch[1].toLowerCase() : null;

  if (text.includes('LEFT JOIN')) {
    if (table === 'debtors') {
      return {
        rows: db.debtors.map(d => {
          const project = db.projects.find(p => p.id === d.project_id) || {};
          return { ...d, project_no: project.project_no, project_name: project.project_name };
        })
      };
    }
    if (table === 'creditors') {
      return {
        rows: db.creditors.map(c => {
          const project = db.projects.find(p => p.id === c.project_id) || {};
          return { ...c, project_no: project.project_no, project_name: project.project_name };
        })
      };
    }
  }

  return { rows: db[table] || [] };
};

const handleInsert = (text, params) => {
  const intoMatch = text.match(/INTO\s+(\w+)/i);
  const table = intoMatch ? intoMatch[1].toLowerCase() : null;
  const id = uuidv4();
  const newRecord = { id, ...paramsToObject(text, params) };
  db[table].push(newRecord);
  commit();
  return { rows: [newRecord] };
};

const handleUpdate = (text, params) => {
  const updateMatch = text.match(/UPDATE\s+(\w+)/i);
  const table = updateMatch ? updateMatch[1].toLowerCase() : null;
  const whereMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
  const idIndex = whereMatch ? parseInt(whereMatch[1], 10) - 1 : -1;
  const id = params[idIndex];

  const recordIndex = db[table].findIndex(r => r.id === id);
  if (recordIndex === -1) {
    throw new Error('Record not found');
  }

  const updatedRecord = { ...db[table][recordIndex], ...paramsToObjectForUpdate(text, params) };
  db[table][recordIndex] = updatedRecord;
  commit();
  return { rows: [updatedRecord] };
};

const handleDelete = (text, params) => {
  const fromMatch = text.match(/FROM\s+(\w+)/i);
  const table = fromMatch ? fromMatch[1].toLowerCase() : null;
  const whereMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
  const idIndex = whereMatch ? parseInt(whereMatch[1], 10) - 1 : -1;
  const id = params[idIndex];

  const initialLength = db[table].length;
  db[table] = db[table].filter(r => r.id !== id);
  if (db[table].length === initialLength) {
    throw new Error('Record not found');
  }

  commit();
  return { rowCount: 1 };
};

const paramsToObject = (text, params) => {
  const columnsMatch = text.match(/\(([^)]+)\)/);
  const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = params[i];
  });
  return obj;
};

const paramsToObjectForUpdate = (text, params) => {
    const setMatch = text.match(/SET\s+(.+?)\s+WHERE/i);
    const setClause = setMatch ? setMatch[1] : '';
    const assignments = setClause.split(',').map(a => a.trim().split('=')[0].trim());
    const obj = {};
    assignments.forEach((col, i) => {
        obj[col] = params[i];
    });
    return obj;
};


module.exports = {
  query,
  pool: null, // No pool needed for local storage
};

/*
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE, // Changed from DB_NAME
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Error connecting to PostgreSQL database:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
*/