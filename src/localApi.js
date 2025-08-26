
const PROJECTS_KEY = 'projects';
const STAGES_KEY = 'stages';
const DEBTORS_KEY = 'debtors';
const CREDITORS_KEY = 'creditors';

// Seed initial data if local storage is empty
if (!localStorage.getItem(PROJECTS_KEY)) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
}

if (!localStorage.getItem(STAGES_KEY)) {
  localStorage.setItem(STAGES_KEY, JSON.stringify([
    { id: '1', name: 'Planning', remarks: '' },
    { id: '2', name: 'Design', remarks: '' },
    { id: '3', name: 'In Progress', remarks: '' },
    { id: '4', name: 'Testing', remarks: '' },
    { id: '5', name: 'Done', remarks: '' },
  ]));
}

if (!localStorage.getItem(DEBTORS_KEY)) {
  localStorage.setItem(DEBTORS_KEY, JSON.stringify([]));
}

if (!localStorage.getItem(CREDITORS_KEY)) {
  localStorage.setItem(CREDITORS_KEY, JSON.stringify([]));
}

const getProjects = () => {
  return JSON.parse(localStorage.getItem(PROJECTS_KEY));
};

const getStages = () => {
  return JSON.parse(localStorage.getItem(STAGES_KEY));
};

const getDebtors = () => {
  const debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  const projects = getProjects();
  return debtors.map(d => {
    const project = projects.find(p => p.id === d.project_id) || {};
    const totalSettled = (d.settlements || []).reduce((sum, s) => sum + parseFloat(s.settledAmount), 0);
    const remainingAmount = parseFloat(d.advance_amount) - totalSettled;
    const lastSettlement = (d.settlements || []).length > 0 ? d.settlements[d.settlements.length - 1] : null;
    return { 
      ...d, 
      project_no: project.projectNo, 
      project_name: project.projectName, 
      remaining_amount: remainingAmount.toFixed(2),
      totalSettled: totalSettled.toFixed(2),
      lastInvoiceNumber: lastSettlement ? lastSettlement.invoiceNumber : '',
      settled: remainingAmount <= 0 // Mark as settled if remaining amount is zero or less
    };
  });
};

const getCreditors = () => {
  const creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  const projects = getProjects();
  return creditors.map(c => {
    const project = projects.find(p => p.id === c.project_id) || {};
    const totalSettled = (c.settlements || []).reduce((sum, s) => sum + parseFloat(s.settledAmount), 0);
    const remainingAmount = parseFloat(c.advance_amount) - totalSettled;
    const lastSettlement = (c.settlements || []).length > 0 ? c.settlements[c.settlements.length - 1] : null;
    return { 
      ...c, 
      project_no: project.projectNo, 
      project_name: project.projectName, 
      remaining_amount: remainingAmount.toFixed(2),
      totalSettled: totalSettled.toFixed(2),
      lastInvoiceNumber: lastSettlement ? lastSettlement.invoiceNumber : '',
      settled: remainingAmount <= 0 // Mark as settled if remaining amount is zero or less
    };
  });
};

const getAdvancesSummary = () => {
  const debtors = getDebtors().filter(d => parseFloat(d.remaining_amount) > 0);
  const creditors = getCreditors().filter(c => parseFloat(c.remaining_amount) > 0);

  const summarize = (data) => {
    return data.reduce((acc, item) => {
      const month = new Date(item.advance_date).toISOString().slice(0, 7);
      const existing = acc.find(x => x.month === month);
      if (existing) {
        existing.total_amount = (parseFloat(existing.total_amount) + parseFloat(item.remaining_amount)).toString();
      } else {
        acc.push({ month, total_amount: item.remaining_amount });
      }
      return acc;
    }, []);
  };

  return { debtors: summarize(debtors), creditors: summarize(creditors) };
};

const getAdvanceDetails = (type, month, year) => {
  const data = type === 'debtor' ? getDebtors() : getCreditors();
  return data.filter(item => {
    const date = new Date(item.advance_date);
    return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(month);
  });
};

const addProject = (project) => {
  const projects = getProjects();
  const newProject = { ...project, id: Date.now().toString() };
  projects.push(newProject);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return newProject;
};

const updateProject = (id, updatedProject) => {
  let projects = getProjects();
  projects = projects.map(p => (p.id === id ? { ...p, ...updatedProject } : p));
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return updatedProject;
};

const deleteProject = (id) => {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const addDebtor = (debtor) => {
  const debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  const newDebtor = { ...debtor, id: Date.now().toString(), settlements: [], paymentTerms: '' };
  debtors.push(newDebtor);
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
  return newDebtor;
};

const updateDebtor = (id, updatedDebtor) => {
  let debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  debtors = debtors.map(d => (d.id === id ? { ...d, ...updatedDebtor } : d));
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
  return updatedDebtor;
};

const deleteDebtor = (id) => {
  let debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  debtors = debtors.filter(d => d.id !== id);
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
};

const settleDebtor = (id, settledAmount, invoiceNumber) => {
  let debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  debtors = debtors.map(d => {
    if (d.id === id) {
      const newSettlement = { id: Date.now().toString(), invoiceNumber, settledAmount, settlementDate: new Date().toISOString() };
      const updatedSettlements = [...(d.settlements || []), newSettlement];
      return { ...d, settlements: updatedSettlements };
    }
    return d;
  });
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
};

const unsettleDebtor = (debtorId, settlementId) => {
  let debtors = JSON.parse(localStorage.getItem(DEBTORS_KEY));
  debtors = debtors.map(d => {
    if (d.id === debtorId) {
      const updatedSettlements = (d.settlements || []).filter(s => s.id !== settlementId);
      return { ...d, settlements: updatedSettlements };
    }
    return d;
  });
  localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
};

const addCreditor = (creditor) => {
  const creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  const newCreditor = { ...creditor, id: Date.now().toString(), settlements: [], paymentTerms: '' };
  creditors.push(newCreditor);
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(creditors));
  return newCreditor;
};

const updateCreditor = (id, updatedCreditor) => {
  let creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  creditors = creditors.map(c => (c.id === id ? { ...c, ...updatedCreditor } : c));
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(creditors));
  return updatedCreditor;
};

const deleteCreditor = (id) => {
  let creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  creditors = creditors.filter(c => c.id !== id);
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(creditors));
};

const settleCreditor = (id, settledAmount, invoiceNumber) => {
  let creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  creditors = creditors.map(c => {
    if (c.id === id) {
      const newSettlement = { id: Date.now().toString(), invoiceNumber, settledAmount, settlementDate: new Date().toISOString() };
      const updatedSettlements = [...(c.settlements || []), newSettlement];
      return { ...c, settlements: updatedSettlements };
    }
    return c;
  });
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(creditors));
};

const unsettleCreditor = (creditorId, settlementId) => {
  let creditors = JSON.parse(localStorage.getItem(CREDITORS_KEY));
  creditors = creditors.map(c => {
    if (c.id === creditorId) {
      const updatedSettlements = (c.settlements || []).filter(s => s.id !== settlementId);
      return { ...c, settlements: updatedSettlements };
    }
    return c;
  });
  localStorage.setItem(CREDITORS_KEY, JSON.stringify(creditors));
};

const addStage = (stage) => {
  const stages = getStages();
  const newStage = { ...stage, id: Date.now().toString() };
  stages.push(newStage);
  localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
  return newStage;
};

const updateStage = (id, updatedStage) => {
  let stages = getStages();
  stages = stages.map(s => (s.id === id ? { ...s, ...updatedStage } : s));
  localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
  return updatedStage;
};

const deleteStage = (id) => {
  let stages = getStages();
  stages = stages.filter(s => s.id !== id);
  localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
};

export const projects = {
  get: () => Promise.resolve({ data: getProjects() }),
  post: (project) => Promise.resolve({ data: addProject(project) }),
  put: (id, project) => Promise.resolve({ data: updateProject(id, project) }),
  delete: (id) => Promise.resolve(deleteProject(id)),
};

export const stages = {
  get: () => Promise.resolve({ data: getStages() }),
  post: (stage) => Promise.resolve({ data: addStage(stage) }),
  put: (id, stage) => Promise.resolve({ data: updateStage(id, stage) }),
  delete: (id) => Promise.resolve(deleteStage(id)),
};

export const debtors = {
  get: () => Promise.resolve({ data: getDebtors() }),
  post: (debtor) => Promise.resolve({ data: addDebtor(debtor) }),
  put: (id, debtor) => Promise.resolve({ data: updateDebtor(id, debtor) }),
  delete: (id) => Promise.resolve(deleteDebtor(id)),
  settle: (id, settledAmount, invoiceNumber) => Promise.resolve(settleDebtor(id, settledAmount, invoiceNumber)),
  unsettle: (debtorId, settlementId) => Promise.resolve(unsettleDebtor(debtorId, settlementId)),
};

export const creditors = {
  get: () => Promise.resolve({ data: getCreditors() }),
  post: (creditor) => Promise.resolve({ data: addCreditor(creditor) }),
  put: (id, creditor) => Promise.resolve({ data: updateCreditor(id, creditor) }),
  delete: (id) => Promise.resolve(deleteCreditor(id)),
  settle: (id, settledAmount, invoiceNumber) => Promise.resolve(settleCreditor(id, settledAmount, invoiceNumber)),
  unsettle: (creditorId, settlementId) => Promise.resolve(unsettleCreditor(creditorId, settlementId)),
};

export const advances = {
  summary: () => Promise.resolve({ data: getAdvancesSummary() }),
  details: (type, month, year) => Promise.resolve({ data: getAdvanceDetails(type, month, year) }),
};
