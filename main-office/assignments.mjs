export function normalizeAssignments(value, validKeys) {
  const result = {};
  for (const key of validKeys) {
    const v = value?.[key];
    if (typeof v === 'string' && v.trim()) result[key] = {id:'', employeeCode:'', name:v.trim()};
    else if (v && typeof v.name === 'string' && v.name.trim()) result[key] = {
      id:typeof v.id === 'string' ? v.id : '', employeeCode:typeof v.employeeCode === 'string' ? v.employeeCode : '', name:v.name.trim()
    };
  }
  return result;
}
export function assignEmployee(current, employee, targetKey, validKeys, allowOccupied = false) {
  if (!validKeys.includes(targetKey) || !employee?.id || !employee?.name) throw Error('Choose an employee and seat.');
  const next = normalizeAssignments(current, validKeys);
  const origins = validKeys.filter(k => next[k]?.id === employee.id);
  if (origins.length === 1 && origins[0] === targetKey) return next;
  const occupant = next[targetKey];
  if (occupant && occupant.id !== employee.id && !allowOccupied) throw Error('This seat is occupied.');
  origins.forEach(k => delete next[k]);
  if (occupant && occupant.id !== employee.id && origins.length) next[origins[0]] = occupant;
  next[targetKey] = {id:employee.id,employeeCode:employee.employeeCode || '',name:employee.name};
  return next;
}
export const matchesEmployee = (employee, query) => `${employee.name} ${employee.employeeCode} ${employee.id}`.toLowerCase().includes(query.trim().toLowerCase());
