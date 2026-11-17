'use strict';
function normalizeEmployees(rows) {
  if (!Array.isArray(rows)) throw new Error('Unexpected employee response');
  return rows.filter(e => e.status === 'ACTIVE').map(e => ({
    id: String(e.id || ''), employeeCode: String(e.employeeCode || ''),
    name: [e.firstName, e.lastName].filter(Boolean).join(' ').trim()
  })).filter(e => e.id && e.name).sort((a,b) => a.name.localeCompare(b.name));
}
module.exports = { normalizeEmployees };
