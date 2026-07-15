// ============================================================
// admin.js — Lógica del panel Administrador
// ============================================================

let sesionAdmin = null;
let editingDoctorId = null;

document.addEventListener('DOMContentLoaded', () => {
  sesionAdmin = requireAuth('admin');
  if (!sesionAdmin) return;

  // Setup UI
  document.getElementById('sidebar-name').textContent = sesionAdmin.nombre.split(' ')[0];
  document.getElementById('sidebar-avatar').textContent = sesionAdmin.nombre[0].toUpperCase();
  document.getElementById('topbar-avatar').textContent = sesionAdmin.nombre[0].toUpperCase();

  // Cargar sección inicial
  showSection('dashboard');
  updateNotifBadge();
});

// ── Navegación ──
function showSection(sec) {
  const secciones = ['dashboard', 'doctores', 'pacientes', 'especialidades', 'citas', 'pagos', 'notificaciones'];
  secciones.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.style.display = s === sec ? 'block' : 'none';
    const nav = document.getElementById('nav-' + s);
    if (nav) nav.classList.toggle('active', s === sec);
  });
  document.getElementById('topbar-title').textContent = {
    dashboard: 'Dashboard', doctores: 'Doctores', pacientes: 'Pacientes',
    especialidades: 'Especialidades', citas: 'Citas', pagos: 'Pagos',
    notificaciones: 'Notificaciones'
  }[sec] || sec;

  // Renderizar sección
  const renderers = {
    dashboard: renderDashboard,
    doctores: renderDoctores,
    pacientes: renderPacientes,
    especialidades: renderEspecialidades,
    citas: renderCitas,
    pagos: renderPagos,
    notificaciones: renderNotificaciones
  };
  if (renderers[sec]) renderers[sec]();
}

// ── DASHBOARD ──
function renderDashboard() {
  const stats = getEstadisticas();

  const kpis = [
    { icon: '🧑‍🦱', value: stats.totalPacientes, label: 'Pacientes registrados', color: 'var(--primary)' },
    { icon: '👨‍⚕️', value: stats.doctoresActivos, label: 'Médicos activos', color: 'var(--success)' },
    { icon: '✅', value: stats.citasRealizadas, label: 'Consultas realizadas', color: 'var(--secondary)' },
    { icon: '🕐', value: stats.citasPendientes, label: 'Citas pendientes', color: 'var(--warning)' },
    { icon: '❌', value: stats.citasCanceladas, label: 'Citas canceladas', color: 'var(--danger)' },
    { icon: '💰', value: '$' + stats.ingresoTotal.toFixed(2), label: 'Ingreso total', color: 'var(--accent)' }
  ];

  document.getElementById('kpi-grid').innerHTML = kpis.map(k => `
    <div class="kpi-card" style="--kpi-color:${k.color};">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');

  // Citas recientes (últimas 5)
  const citas = getCitas().slice(-5).reverse();
  document.getElementById('dashboard-citas-recientes').innerHTML = citas.length === 0
    ? '<div class="empty-state"><p>Sin citas registradas</p></div>'
    : `<div class="table-wrapper"><table>
        <thead><tr><th>Paciente</th><th>Doctor</th><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>${citas.map(c => `
          <tr>
            <td><strong>${getPacienteNombre(c.pacienteId)}</strong></td>
            <td>${getDoctorNombre(c.doctorId)}</td>
            <td>${formatFechaCorta(c.fecha)}</td>
            <td>${estadoBadge(c.estado)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;

  // Doctores
  const doctores = getDoctores().slice(0, 4);
  document.getElementById('dashboard-doctores').innerHTML = doctores.map(d => {
    const u = getUserById(d.usuarioId);
    const esp = getEspecialidadById(d.especialidadId);
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
      <div class="avatar">${u ? u.nombre[0] : '?'}</div>
      <div style="flex:1;">
        <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary);">${u ? u.nombre : '?'}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);">${esp ? esp.nombre : '?'}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:0.8rem;color:var(--warning);">⭐ ${d.calificacion}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${d.totalConsultas} consultas</div>
      </div>
    </div>`;
  }).join('');

  // Gráfico especialidades
  const citas2 = getCitas();
  const espCount = {};
  citas2.forEach(c => {
    const esp = getEspecialidadById(c.especialidadId);
    if (esp) espCount[esp.nombre] = (espCount[esp.nombre] || 0) + 1;
  });
  const total = citas2.length || 1;
  const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--warning)', 'var(--danger)', 'var(--info)'];
  let i = 0;
  document.getElementById('chart-especialidades').innerHTML = Object.entries(espCount).map(([nombre, count]) => {
    const pct = Math.round((count / total) * 100);
    const color = colors[i++ % colors.length];
    return `<div style="flex:1;min-width:150px;">
      <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:6px;">
        <span style="color:var(--text-secondary);">${nombre}</span>
        <span style="color:var(--text-primary);font-weight:600;">${count}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
      </div>
    </div>`;
  }).join('') || '<p style="color:var(--text-muted);">Sin datos suficientes</p>';
}

// ── DOCTORES ──
function renderDoctores() {
  const query = (document.getElementById('search-doctor')?.value || '').toLowerCase();
  const doctores = getDoctores().filter(d => {
    const u = getUserById(d.usuarioId);
    return !query || (u && u.nombre.toLowerCase().includes(query));
  });

  document.getElementById('tabla-doctores').innerHTML = doctores.length === 0
    ? '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px;">Sin resultados</td></tr>'
    : doctores.map(d => {
        const u = getUserById(d.usuarioId);
        const esp = getEspecialidadById(d.especialidadId);
        const aprobado = d.estadoAprobacion === 'aprobado';
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar avatar-sm">${u ? u.nombre[0] : '?'}</div>
              <div>
                <strong>${u ? u.nombre : '?'}</strong>
                <div style="font-size:0.78rem;color:var(--text-muted);">${u ? u.email : ''}</div>
              </div>
            </div>
          </td>
          <td>${esp ? `${esp.icono} ${esp.nombre}` : '?'}</td>
          <td style="font-size:0.82rem;">${u ? u.telefono : '?'}</td>
          <td><span style="color:var(--warning);">⭐ ${d.calificacion}</span> <span style="color:var(--text-muted);font-size:0.8rem;">(${d.totalConsultas})</span></td>
          <td>${aprobado ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-warning">Pendiente</span>'}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="toggleAprobacionDoctor('${d.id}')">${aprobado ? '🔒 Bloquear' : '✅ Aprobar'}</button>
              <button class="btn btn-sm btn-outline" onclick="editarDoctor('${d.id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarDoctorConfirm('${d.id}')">🗑️</button>
            </div>
          </td>
        </tr>`;
      }).join('');
}

function toggleAprobacionDoctor(doctorId) {
  const d = getDoctorById(doctorId);
  const nuevo = d.estadoAprobacion === 'aprobado' ? 'bloqueado' : 'aprobado';
  actualizarDoctor(doctorId, { estadoAprobacion: nuevo });
  const u = getUserById(d.usuarioId);
  actualizarUsuario(d.usuarioId, { estado: nuevo === 'aprobado' ? 'activo' : 'inactivo' });
  showToast(`Dr. ${u?.nombre} ${nuevo === 'aprobado' ? 'aprobado' : 'bloqueado'} correctamente.`, nuevo === 'aprobado' ? 'success' : 'warning');
  renderDoctores();
}

function eliminarDoctorConfirm(doctorId) {
  const d = getDoctorById(doctorId);
  const u = getUserById(d?.usuarioId);
  showConfirm(`¿Eliminar al doctor ${u?.nombre}? Esta acción no se puede deshacer.`, () => {
    eliminarDoctor(doctorId);
    showToast('Doctor eliminado.', 'success');
    renderDoctores();
    renderDashboard();
  });
}

function abrirModalNuevoDoctor() {
  editingDoctorId = null;
  document.getElementById('modal-doctor-title').textContent = 'Nuevo Doctor';
  ['doc-nombre','doc-email','doc-telefono','doc-identificacion','doc-tarifa','doc-password','doc-descripcion','doc-credenciales'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Poblar especialidades
  const sel = document.getElementById('doc-especialidad');
  sel.innerHTML = getEspecialidades().map(e => `<option value="${e.id}">${e.icono} ${e.nombre}</option>`).join('');
  document.getElementById('modal-doctor').classList.add('active');
}

function editarDoctor(doctorId) {
  editingDoctorId = doctorId;
  const d = getDoctorById(doctorId);
  const u = getUserById(d.usuarioId);
  document.getElementById('modal-doctor-title').textContent = 'Editar Doctor';
  document.getElementById('doc-nombre').value = u?.nombre || '';
  document.getElementById('doc-email').value = u?.email || '';
  document.getElementById('doc-telefono').value = u?.telefono || '';
  document.getElementById('doc-identificacion').value = u?.identificacion || '';
  document.getElementById('doc-tarifa').value = d.tarifa;
  document.getElementById('doc-password').value = '';
  document.getElementById('doc-descripcion').value = d.descripcion || '';
  document.getElementById('doc-credenciales').value = d.credenciales || '';

  const sel = document.getElementById('doc-especialidad');
  sel.innerHTML = getEspecialidades().map(e => `<option value="${e.id}" ${e.id === d.especialidadId ? 'selected' : ''}>${e.icono} ${e.nombre}</option>`).join('');
  document.getElementById('modal-doctor').classList.add('active');
}

function guardarDoctor() {
  const nombre = document.getElementById('doc-nombre').value.trim();
  const email = document.getElementById('doc-email').value.trim();
  const telefono = document.getElementById('doc-telefono').value.trim();
  const identificacion = document.getElementById('doc-identificacion').value.trim();
  const especialidadId = document.getElementById('doc-especialidad').value;
  const tarifa = parseFloat(document.getElementById('doc-tarifa').value) || 0;
  const password = document.getElementById('doc-password').value;
  const descripcion = document.getElementById('doc-descripcion').value.trim();
  const credenciales = document.getElementById('doc-credenciales').value.trim();

  if (!nombre || !email || !especialidadId) { showToast('Completa los campos obligatorios.', 'error'); return; }

  if (editingDoctorId) {
    const d = getDoctorById(editingDoctorId);
    actualizarUsuario(d.usuarioId, { nombre, email, telefono, identificacion, ...(password && { password }) });
    actualizarDoctor(editingDoctorId, { especialidadId, tarifa, descripcion, credenciales });
    showToast('Doctor actualizado correctamente.', 'success');
  } else {
    if (!password) { showToast('Ingresa una contraseña.', 'error'); return; }
    if (getUsuarios().find(u => u.email === email)) { showToast('El correo ya está registrado.', 'error'); return; }
    const userId = generateId('u');
    const doctorId = generateId('d');
    agregarUsuario({ id: userId, rol: 'doctor', nombre, email, password, telefono, identificacion, estado: 'activo', avatar: null, fechaRegistro: new Date().toISOString().split('T')[0] });
    agregarDoctor({ id: doctorId, usuarioId: userId, especialidadId, descripcion, credenciales, tarifa, calificacion: 5.0, totalConsultas: 0, horarios: { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], domingo: [] }, estadoAprobacion: 'aprobado' });
    showToast('Doctor registrado correctamente.', 'success');
  }
  cerrarModal('modal-doctor');
  renderDoctores();
  editingDoctorId = null;
}

// ── PACIENTES ──
function renderPacientes() {
  const query = (document.getElementById('search-paciente')?.value || '').toLowerCase();
  const pacientes = getPacientes().filter(p => {
    const u = getUserById(p.usuarioId);
    return !query || (u && u.nombre.toLowerCase().includes(query));
  });

  document.getElementById('tabla-pacientes').innerHTML = pacientes.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Sin pacientes</td></tr>'
    : pacientes.map(p => {
        const u = getUserById(p.usuarioId);
        const citas = getCitasPaciente(p.id);
        const activo = u?.estado === 'activo';
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar">${u ? u.nombre[0] : '?'}</div>
              <div>
                <strong>${u?.nombre || '?'}</strong>
                <div style="font-size:0.78rem;color:var(--text-muted);">${u?.email || ''}</div>
              </div>
            </div>
          </td>
          <td style="font-size:0.85rem;">${u?.identificacion || '—'}</td>
          <td style="font-size:0.85rem;">${u?.telefono || '—'}</td>
          <td>${p.convenioSeguro ? `<span class="badge badge-info">${p.convenioSeguro}</span>` : '<span style="color:var(--text-muted);">—</span>'}</td>
          <td style="font-weight:600;color:var(--text-primary);">${citas.length}</td>
          <td>${activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-danger">Inactivo</span>'}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="togglePacienteEstado('${u?.id}','${activo}')">${activo ? '🔒 Desactivar' : '✅ Activar'}</button>
          </td>
        </tr>`;
      }).join('');
}

function togglePacienteEstado(userId, activo) {
  const nuevoEstado = activo === 'true' ? 'inactivo' : 'activo';
  actualizarUsuario(userId, { estado: nuevoEstado });
  showToast(`Paciente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}.`, nuevoEstado === 'activo' ? 'success' : 'warning');
  renderPacientes();
}

// ── ESPECIALIDADES ──
function renderEspecialidades() {
  const especialidades = getEspecialidades();
  document.getElementById('grid-especialidades').innerHTML = especialidades.map(e => `
    <div class="card card-sm" style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:2rem;">${e.icono}</div>
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--text-primary);">${e.nombre}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${e.descripcion}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-sm btn-danger" onclick="eliminarEspecialidadConfirm('${e.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function abrirModalEspecialidad() {
  ['esp-nombre','esp-icono','esp-descripcion'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  document.getElementById('modal-especialidad').classList.add('active');
}

function guardarEspecialidad() {
  const nombre = document.getElementById('esp-nombre').value.trim();
  const icono = document.getElementById('esp-icono').value.trim() || '🩺';
  const descripcion = document.getElementById('esp-descripcion').value.trim();
  if (!nombre) { showToast('Ingresa el nombre de la especialidad.', 'error'); return; }
  const db = getDB();
  db.especialidades.push({ id: generateId('e'), nombre, icono, descripcion, activo: true });
  saveDB(db);
  cerrarModal('modal-especialidad');
  showToast('Especialidad creada.', 'success');
  renderEspecialidades();
}

function eliminarEspecialidadConfirm(id) {
  showConfirm('¿Eliminar esta especialidad?', () => {
    const db = getDB();
    db.especialidades = db.especialidades.filter(e => e.id !== id);
    saveDB(db);
    showToast('Especialidad eliminada.', 'success');
    renderEspecialidades();
  });
}

// ── CITAS ──
function renderCitas() {
  const query = (document.getElementById('search-cita')?.value || '').toLowerCase();
  const estadoFiltro = document.getElementById('filter-estado-cita')?.value || '';
  const espFiltro = document.getElementById('filter-especialidad-cita')?.value || '';

  // Poblar filtro especialidades
  const sel = document.getElementById('filter-especialidad-cita');
  if (sel && sel.children.length < 2) {
    getEspecialidades().forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id; opt.textContent = e.nombre;
      sel.appendChild(opt);
    });
  }

  let citas = getCitas();
  if (estadoFiltro) citas = citas.filter(c => c.estado === estadoFiltro);
  if (espFiltro) citas = citas.filter(c => c.especialidadId === espFiltro);
  if (query) {
    citas = citas.filter(c =>
      getPacienteNombre(c.pacienteId).toLowerCase().includes(query) ||
      getDoctorNombre(c.doctorId).toLowerCase().includes(query)
    );
  }

  document.getElementById('tabla-citas').innerHTML = citas.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Sin citas</td></tr>'
    : citas.map(c => {
        const esp = getEspecialidadById(c.especialidadId);
        return `<tr>
          <td><strong>${getPacienteNombre(c.pacienteId)}</strong></td>
          <td>${getDoctorNombre(c.doctorId)}</td>
          <td>${esp ? `${esp.icono} ${esp.nombre}` : '?'}</td>
          <td style="font-size:0.85rem;">${formatFechaCorta(c.fecha)}<br><span style="color:var(--text-muted);">${c.hora}</span></td>
          <td style="font-size:0.82rem;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${c.motivo}">${c.motivo}</td>
          <td>${estadoBadge(c.estado)}</td>
          <td>${c.estadoPago === 'pagado' ? '<span class="badge badge-success">Pagado</span>' : '<span class="badge badge-warning">Pendiente</span>'}</td>
        </tr>`;
      }).join('');
}

// ── PAGOS ──
function renderPagos() {
  const stats = getEstadisticas();
  document.getElementById('kpi-ingreso').textContent = '$' + stats.ingresoTotal.toFixed(2);
  const pagos = getPagos();
  document.getElementById('kpi-pagos-completados').textContent = pagos.filter(p => p.estado === 'completado').length;

  document.getElementById('tabla-pagos').innerHTML = pagos.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Sin pagos</td></tr>'
    : pagos.map(p => {
        const cita = getCitas().find(c => c.id === p.citaId);
        return `<tr>
          <td style="font-size:0.82rem;color:var(--text-muted);">${p.citaId}</td>
          <td><strong>${cita ? getPacienteNombre(cita.pacienteId) : '?'}</strong></td>
          <td>${cita ? getDoctorNombre(cita.doctorId) : '?'}</td>
          <td style="font-weight:700;color:var(--success);">$${p.monto.toFixed(2)}</td>
          <td style="text-transform:capitalize;">${p.metodo}</td>
          <td><span class="badge badge-success">${p.estado}</span></td>
          <td style="font-size:0.82rem;">${new Date(p.timestamp).toLocaleDateString('es-ES')}</td>
        </tr>`;
      }).join('');
}

// ── NOTIFICACIONES ──
function renderNotificaciones() {
  const notifs = getNotificaciones();
  document.getElementById('notif-list-admin').innerHTML = notifs.length === 0
    ? '<div class="empty-state"><div class="empty-state-icon">🔔</div><h3>Sin notificaciones</h3></div>'
    : notifs.map(n => `
        <div class="notif-item ${n.leida ? '' : 'unread'}" onclick="marcarNotificacionLeida('${n.id}');renderNotificaciones();updateNotifBadge();">
          <div class="notif-content">
            <div class="notif-text">${n.mensaje}</div>
            <div class="notif-time">${new Date(n.timestamp).toLocaleString('es-ES')}</div>
          </div>
          ${n.leida ? '' : '<span class="badge badge-primary">Nueva</span>'}
        </div>
      `).join('');
}

function updateNotifBadge() {
  const count = getNotificaciones().filter(n => !n.leida).length;
  const badge = document.getElementById('nav-notif-count');
  const dot = document.getElementById('notif-dot');
  if (badge) badge.textContent = count > 0 ? count : '';
  if (dot) dot.style.display = count > 0 ? 'block' : 'none';
}

// ── Cerrar modal ──
function cerrarModal(id) {
  document.getElementById(id)?.classList.remove('active');
}
