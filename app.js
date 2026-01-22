const state = {
  user: null,
  charts: {},
  selectedCompanyId: null
};

const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('view-title');

function setView(name) {
  views.forEach((view) => {
    view.classList.toggle('hidden', view.id !== name);
  });
  viewTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  document.querySelectorAll('.sidebar button[data-view]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Erro');
  }
  return response.json();
}

async function checkSession() {
  try {
    state.user = await api('/api/me');
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    applyRoleVisibility();
    await loadDashboard();
    await loadCompanies();
  } catch (error) {
    document.getElementById('login').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

function applyRoleVisibility() {
  document.querySelectorAll('[data-role]').forEach((el) => {
    const role = el.dataset.role;
    if (state.user?.role !== role) {
      el.style.display = 'none';
    }
  });
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    state.user = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    await checkSession();
  } catch (error) {
    document.getElementById('login-error').textContent = error.message;
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null;
  await checkSession();
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  document.getElementById('kpi-total').textContent = data.kpis.total;
  document.getElementById('kpi-ativas').textContent = data.kpis.ativas;
  document.getElementById('kpi-inadimplentes').textContent = data.kpis.inadimplentes;
  document.getElementById('kpi-nfe').textContent = data.kpis.emiteNfe;

  renderChart('chart-status', 'pie', {
    labels: data.charts.status.map((item) => item.status),
    data: data.charts.status.map((item) => item.total)
  });

  renderChart('chart-emite', 'bar', {
    labels: ['NFe', 'NFCe', 'ISS'],
    data: [data.charts.emite.nfe, data.charts.emite.nfce, data.charts.emite.iss]
  });

  renderChart('chart-cert', 'bar', {
    labels: ['Ativo', 'Perto', 'Vencido'],
    data: [data.charts.certificados.ativo, data.charts.certificados.perto, data.charts.certificados.vencido]
  });

  const expiringList = document.getElementById('expiring-list');
  expiringList.innerHTML = '';
  data.expiring.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.codigo} - ${item.apelido} (${item.validade})`;
    expiringList.appendChild(li);
  });
}

function renderChart(id, type, payload) {
  const ctx = document.getElementById(id);
  if (state.charts[id]) {
    state.charts[id].destroy();
  }
  state.charts[id] = new Chart(ctx, {
    type,
    data: {
      labels: payload.labels,
      datasets: [{
        data: payload.data,
        backgroundColor: ['#7c3aed', '#2563eb', '#ef4444']
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: type === 'bar' ? {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      } : {}
    }
  });
}

async function loadCompanies() {
  const companies = await api('/api/companies');
  const body = document.getElementById('companies-body');
  body.innerHTML = '';
  companies.forEach((company) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${company.codigo}</td>
      <td>${company.apelido}</td>
      <td>${company.cnpj}</td>
      <td>${company.status}</td>
      <td>${company.emiteNfe ? 'Sim' : 'Não'}</td>
    `;
    body.appendChild(tr);
  });
}

async function createCompany(event) {
  event.preventDefault();
  const payload = {
    apelido: document.getElementById('company-apelido').value,
    cnpj: document.getElementById('company-cnpj').value,
    responsavel: document.getElementById('company-responsavel').value,
    cpf: document.getElementById('company-cpf').value,
    tipoUnidade: document.getElementById('company-tipo').value,
    matrizId: document.getElementById('company-matriz').value || null,
    status: document.getElementById('company-status').value,
    emiteNfe: document.getElementById('company-nfe').checked,
    emiteNfce: document.getElementById('company-nfce').checked,
    emiteIss: document.getElementById('company-iss').checked
  };

  await api('/api/companies', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  event.target.reset();
  await loadCompanies();
}

async function handleSearch(event) {
  const value = event.target.value;
  const resultsBox = document.getElementById('search-results');
  if (!value) {
    resultsBox.style.display = 'none';
    resultsBox.innerHTML = '';
    return;
  }
  const results = await api(`/api/search?q=${encodeURIComponent(value)}`);
  resultsBox.innerHTML = '';
  results.forEach((item) => {
    const div = document.createElement('div');
    div.textContent = `${item.codigo} - ${item.apelido}`;
    div.onclick = async () => {
      resultsBox.style.display = 'none';
      state.selectedCompanyId = item.id;
      const certs = await api(`/api/companies/${item.id}/certificates`);
      const notes = await api(`/api/companies/${item.id}/notes`);
      renderCompanyDetails(certs, notes);
      setView('certificates');
    };
    resultsBox.appendChild(div);
  });
  resultsBox.style.display = results.length ? 'block' : 'none';
}

function renderCompanyDetails(certs, notes) {
  const certsBody = document.getElementById('certificates-body');
  certsBody.innerHTML = certs.map((cert) => `
    <div class="card" style="margin-bottom: 8px;">
      <strong>${cert.validade}</strong> - ${cert.status}
    </div>
  `).join('');

  const notesBody = document.getElementById('notes-body');
  notesBody.innerHTML = notes.map((note) => `
    <div class="card" style="margin-bottom: 8px;">
      <p>${note.texto}</p>
      <span class="muted">${note.created_at} - ${note.created_by}</span>
    </div>
  `).join('');
}

async function createCertificate(event) {
  event.preventDefault();
  if (!state.selectedCompanyId) {
    alert('Selecione uma empresa na busca.');
    return;
  }
  const payload = {
    validade: document.getElementById('cert-validade').value,
    alertDays: Number(document.getElementById('cert-alert').value || 30)
  };
  await api(`/api/companies/${state.selectedCompanyId}/certificates`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  event.target.reset();
  const certs = await api(`/api/companies/${state.selectedCompanyId}/certificates`);
  const notes = await api(`/api/companies/${state.selectedCompanyId}/notes`);
  renderCompanyDetails(certs, notes);
}

async function createNote(event) {
  event.preventDefault();
  if (!state.selectedCompanyId) {
    alert('Selecione uma empresa na busca.');
    return;
  }
  const payload = { texto: document.getElementById('note-text').value };
  await api(`/api/companies/${state.selectedCompanyId}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  event.target.reset();
  const certs = await api(`/api/companies/${state.selectedCompanyId}/certificates`);
  const notes = await api(`/api/companies/${state.selectedCompanyId}/notes`);
  renderCompanyDetails(certs, notes);
}

function registerEvents() {
  document.getElementById('login-submit').addEventListener('click', login);
  document.getElementById('logout').addEventListener('click', logout);
  document.getElementById('search-input').addEventListener('input', handleSearch);
  document.getElementById('company-form').addEventListener('submit', createCompany);
  document.getElementById('certificate-form').addEventListener('submit', createCertificate);
  document.getElementById('note-form').addEventListener('submit', createNote);
  document.querySelectorAll('.sidebar button[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
}

registerEvents();
checkSession();
