import { matchesEmployee, assignEmployee } from './assignments.mjs';

export function createDirectory({ seats, seatName, selectedSeat, read, save, focusSeat }) {
  let employees = [], failure = '', loading = false, targetKey = null, selectedEmployeeId = null;
  const el = id => document.getElementById(id), dialog = el('assignment-dialog');
  const validKeys = seats.map(s => s.key);
  const label = key => seatName(seats.find(s => s.key === key)) || key;
  function renderSearch() {
    const container = el('person-results'), query = el('q').value.trim();
    container.hidden = !query && !failure;
    container.replaceChildren();
    if (!query && !failure) return;
    const matches = query ? employees.filter(e => matchesEmployee(e, query)) : [];
    const status = document.createElement('p');
    status.style.cssText = 'font-size:11px;line-height:1.5;margin:5px 0;color:#c9dff2';
    status.textContent = loading ? 'Loading employees…' : failure || (matches.length ? 'Click a person to select · Double-click to assign to the selected seat' : 'No matching employees.');
    container.append(status);
    if (failure) return;
    for (const employee of matches.slice(0, 120)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'employee-row';
      b.setAttribute('aria-pressed', String(selectedEmployeeId === employee.id));
      const name = document.createElement('strong'); name.textContent = employee.name;
      const detail = document.createElement('span'); detail.textContent = employee.employeeCode || employee.id;
      b.append(name, detail);
      b.onclick = () => {
        selectedEmployeeId = employee.id;
        container.querySelectorAll('button').forEach(child => child.setAttribute('aria-pressed', String(child === b)));
      };
      b.ondblclick = () => {
        const key = selectedSeat();
        if (!key) { status.textContent = 'Select a seat first, then double-click an employee.'; return; }
        open(key);
      };
      container.append(b);
    }
  }
  function render() {
    el('directory-login').hidden = !failure;
    el('directory-login').textContent = 'RETRY EMPLOYEE LIST';
    renderSearch();
    if (!targetKey) return;
    const target = seats.find(s => s.key === targetKey);
    if (!target) return;
    const current = read(), occupant = current[targetKey];
    el('assignment-title').textContent = 'Assign to ' + seatName(target);
    el('assignment-current').textContent = occupant ? 'Currently: ' + occupant.name + (occupant.employeeCode ? ' · ' + occupant.employeeCode : '') : 'Empty seat';
    el('assignment-clear').disabled = !occupant;
    const query = el('employee-search').value;
    const matches = employees.filter(e => matchesEmployee(e, query));
    el('assignment-note').textContent = loading ? 'Loading employees…' : failure || matches.length + ' employees · Click a name to assign to this seat.';
    el('directory-retry').hidden = !failure;
    const container = el('assignment-employees'); container.replaceChildren();
    if (!matches.length && !loading && !failure) {
      const p = document.createElement('p'); p.textContent = 'No employees match that name or ID.'; container.append(p);
    }
    for (const employee of matches.slice(0, 200)) {
      const origin = Object.keys(current).find(k => current[k]?.id === employee.id);
      const selected = occupant?.id === employee.id;
      const b = document.createElement('button'); b.className = 'employee-row'; b.type = 'button';
      b.setAttribute('aria-pressed', String(selected));
      const name = document.createElement('strong'); name.textContent = employee.name;
      const meta = document.createElement('span'); meta.textContent = employee.employeeCode || employee.id;
      const action = document.createElement('span');
      action.textContent = selected ? '✓ Assigned to this seat'
        : origin ? (occupant ? 'Swap with ' + occupant.name + ' at ' + label(origin) : 'Move from ' + label(origin))
        : occupant ? 'Assign here · ' + occupant.name + ' becomes unassigned' : 'Assign to this seat';
      b.append(name, meta, action);
      b.onclick = () => {
        try {
          const next = assignEmployee(read(), employee, targetKey, validKeys, true);
          if (save(next)) { dialog.close(); focusSeat(targetKey, false); }
        } catch (error) { el('assignment-note').textContent = error.message; }
      };
      container.append(b);
    }
  }
  async function load() {
    loading = true; failure = ''; render();
    try {
      const response = await fetch('/api/employees', {cache:'no-store'});
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.employees)) throw Error(data.error || 'Employee directory unavailable.');
      employees = data.employees;
    } catch (error) { failure = error.message || 'Employee directory unavailable.'; employees = []; }
    loading = false; render();
  }
  const retry = () => { load(); };
  function open(key) {
    if (!validKeys.includes(key)) return;
    targetKey = key;
    el('employee-search').value = el('q').value;
    render();
    if (!dialog.open) dialog.showModal();
    el('employee-search').focus();
  }
  el('employee-search').oninput = render;
  el('assignment-close').onclick = () => dialog.close();
  el('assignment-clear').onclick = () => {
    const next = { ...read() }; delete next[targetKey];
    if (save(next)) { dialog.close(); focusSeat(targetKey, false); }
  };
  el('directory-retry').onclick = retry;
  el('directory-login').onclick = retry;
  load();
  return { open, render, retry };
}
