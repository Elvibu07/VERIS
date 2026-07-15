// ============================================================
// doctor.js — Lógica del panel Doctor
// ============================================================

let sesionDoctor = null;
let doctorData = null;
let currentCitaId = null;
let accionRechazo = null; // 'rechazar' | 'reprogramar'

document.addEventListener('DOMContentLoaded', () => {
  sesionDoctor = requireAuth('doctor');
  if (!sesionDoctor) return;

  doctorData = getDoctorByUserId(sesionDoctor.userId);
  if (!doctorData) { logout(); return; }

  const u = getUserById(sesionDoctor.userId);
  const esp = getEspecialidadById(doctorData.especialidadId);

  document.getElementById('sidebar-name-doc').textContent = u?.nombre?.split(' ')[1] || u?.nombre || 'Doctor';
  document.getElementById('sidebar-esp-doc').textContent = esp?.nombre || 'Médico';
  document.getElementById('sidebar-avatar-doc').textContent = u?.nombre?.[0] || 'D';
  document.getElementById('topbar-avatar-doc').textContent = u?.nombre?.[0] || 'D';

  showSection('agenda');
  updateNotifBadgeDoc();
});

// ── Navegación ──
function showSection(sec) {
  const secciones = ['agenda','solicitudes','historial','perfil','horarios','notificaciones'];
  secciones.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.style.display = s === sec ? 'block' : 'none';
    const nav = document.getElementById('nav-' + s);
    if (nav) nav.classList.toggle('active', s === sec);
  });
  document.getElementById('topbar-title-doc').textContent = {
    agenda:'Mi Agenda', solicitudes:'Solicitudes', historial:'Historial de Consultas',
    perfil:'Mi Perfil', horarios:'Mis Horarios', notificaciones:'Notificaciones'
  }[sec] || sec;

  const r = { agenda:renderAgenda, solicitudes:renderSolicitudes, historial:renderHistorialDoc,
               perfil:renderPerfil, horarios:renderHorarios, notificaciones:renderNotifDoc };
  if (r[sec]) r[sec]();
}

// ── AGENDA ──
function renderAgenda() {
  const citas = getCitasDoctor(doctorData.id);
  const pendientes = citas.filter(c => c.estado === 'pendiente').length;
  const aceptadas = citas.filter(c => c.estado === 'aceptada').length;
  const finalizadas = citas.filter(c => c.estado === 'finalizada').length;

  document.getElementById('doc-kpis').innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--warning);">
      <div class="kpi-icon">🕐</div>
      <div class="kpi-value">${pendientes}</div>
      <div class="kpi-label">Pendientes de revisión</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--success);">
      <div class="kpi-icon">✅</div>
      <div class="kpi-value">${aceptadas}</div>
      <div class="kpi-label">Citas aceptadas</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--primary);">
      <div class="kpi-icon">📋</div>
      <div class="kpi-value">${finalizadas}</div>
      <div class="kpi-label">Consultas realizadas</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--secondary);">
      <div class="kpi-icon">⭐</div>
      <div class="kpi-value">${doctorData.calificacion}</div>
      <div class="kpi-label">Calificación promedio</div>
    </div>
  `;

  switchAgendaTab('proximas', document.querySelector('.tab-btn.active'));
}

let agendaTabActual = 'proximas';
function switchAgendaTab(tab, btn) {
  agendaTabActual = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAgendaContent(tab);
}

function renderAgendaContent(tab) {
  const hoy = new Date().toISOString().split('T')[0];
  let citas = getCitasDoctor(doctorData.id);

  if (tab === 'proximas') citas = citas.filter(c => c.fecha >= hoy && ['aceptada','pendiente'].includes(c.estado));
  else if (tab === 'hoy') citas = citas.filter(c => c.fecha === hoy);
  // 'todas' no filtra

  citas.sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  if (citas.length === 0) {
    document.getElementById('agenda-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3>Sin citas ${tab === 'hoy' ? 'para hoy' : tab === 'proximas' ? 'próximas' : ''}</h3>
        <p>Tu agenda está libre por ahora.</p>
      </div>`;
    return;
  }

  document.getElementById('agenda-content').innerHTML = citas.map(c => {
    const pac = getPacienteNombre(c.pacienteId);
    const esp = getEspecialidadById(c.especialidadId);
    const hoyStr = new Date().toISOString().split('T')[0];
    const esHoy = c.fecha === hoyStr;
    const puedIniciar = c.estado === 'aceptada';

    return `<div class="card" style="margin-bottom:14px;display:flex;gap:16px;align-items:center;">
      <div style="text-align:center;min-width:60px;">
        <div style="font-size:1.3rem;font-weight:800;color:var(--primary);">${c.hora}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${formatFechaCorta(c.fecha)}</div>
      </div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
          <div class="avatar">${pac[0]}</div>
          <div>
            <strong>${pac}</strong>
            <div style="font-size:0.8rem;color:var(--text-muted);">${esp?.nombre || ''} ${esHoy ? '<span class="badge badge-primary" style="font-size:0.7rem;margin-left:4px;">HOY</span>' : ''}</div>
          </div>
        </div>
        <div style="font-size:0.83rem;color:var(--text-secondary);">📝 ${c.motivo}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        ${estadoBadge(c.estado)}
        <button class="btn btn-sm btn-secondary" onclick="verDetalleCita('${c.id}')">Ver detalles</button>
        <button class="btn btn-sm btn-secondary" onclick="verHistorialPaciente('${c.pacienteId}')">📂 Historial</button>
        ${puedIniciar ? `<button class="btn btn-sm btn-primary" onclick="iniciarVideoconsulta('${c.id}')">📹 Iniciar consulta</button>` : ''}
        ${c.estado === 'en_curso' ? `<button class="btn btn-sm btn-success" onclick="abrirModalFinalizar('${c.id}')">✅ Finalizar</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── SOLICITUDES ──
function renderSolicitudes() {
  const citas = getCitasDoctor(doctorData.id).filter(c => c.estado === 'pendiente');
  const badge = document.getElementById('nav-solicitudes-count');
  if (badge) badge.textContent = citas.length > 0 ? citas.length : '';

  if (citas.length === 0) {
    document.getElementById('solicitudes-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✉️</div>
        <h3>Sin solicitudes pendientes</h3>
        <p>No hay nuevas solicitudes de cita.</p>
      </div>`;
    return;
  }

  document.getElementById('solicitudes-list').innerHTML = citas.map(c => {
    const pac = getPacienteNombre(c.pacienteId);
    const esp = getEspecialidadById(c.especialidadId);
    return `<div class="card" style="margin-bottom:14px;">
      <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">
        <div class="avatar avatar-lg">${pac[0]}</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:2px;">${pac}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">${esp?.nombre || ''} — ${formatFecha(c.fecha)} a las ${c.hora}</div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:var(--radius);padding:10px;margin-bottom:12px;">
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:4px;">MOTIVO DE CONSULTA</div>
            <div style="font-size:0.88rem;color:var(--text-primary);">${c.motivo}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-success btn-sm" onclick="aceptarCita('${c.id}')">✅ Aceptar</button>
            <button class="btn btn-danger btn-sm" onclick="abrirRechazo('${c.id}','rechazar')">❌ Rechazar</button>
            <button class="btn btn-warning btn-sm" onclick="abrirRechazo('${c.id}','reprogramar')">📅 Proponer reprogramación</button>
            <button class="btn btn-secondary btn-sm" onclick="verHistorialPaciente('${c.pacienteId}')">📂 Ver historial</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function aceptarCita(citaId) {
  const cita = getCitas().find(c => c.id === citaId);
  actualizarCita(citaId, { estado: 'aceptada' });
  // Notificar paciente
  const pac = getPacienteById(cita.pacienteId);
  if (pac) {
    const u = getUserById(pac.usuarioId);
    if (u) agregarNotificacion(u.id, 'cita_aceptada', `Tu cita del ${formatFechaCorta(cita.fecha)} a las ${cita.hora} ha sido ACEPTADA por ${getUserById(sesionDoctor.userId)?.nombre}.`);
  }
  showToast('Cita aceptada correctamente.', 'success');
  renderSolicitudes();
  updateNotifBadgeDoc();
}

function abrirRechazo(citaId, accion) {
  currentCitaId = citaId;
  accionRechazo = accion;
  document.getElementById('rechazar-motivo').value = '';
  document.getElementById('modal-rechazar-title').textContent = accion === 'rechazar' ? 'Rechazar solicitud' : 'Proponer reprogramación';
  document.getElementById('reprogramar-fecha-group').style.display = accion === 'reprogramar' ? 'block' : 'none';
  document.getElementById('btn-confirm-rechazo').textContent = accion === 'rechazar' ? '❌ Rechazar' : '📅 Proponer';
  document.getElementById('btn-confirm-rechazo').className = `btn ${accion === 'rechazar' ? 'btn-danger' : 'btn-warning'}`;
  document.getElementById('modal-rechazar').classList.add('active');
}

function confirmarRechazo() {
  const motivo = document.getElementById('rechazar-motivo').value.trim();
  if (!motivo) { showToast('Ingresa un motivo.', 'error'); return; }

  if (accionRechazo === 'rechazar') {
    actualizarCita(currentCitaId, { estado: 'rechazada', notas: motivo });
    showToast('Cita rechazada.', 'warning');
  } else {
    const fecha = document.getElementById('reprogram-fecha').value;
    const hora = document.getElementById('reprogram-hora').value;
    if (!fecha || !hora) { showToast('Selecciona fecha y hora de reprogramación.', 'error'); return; }
    actualizarCita(currentCitaId, { estado: 'reprogramada', fechaNueva: fecha, horaNueva: hora, motivoReprogramacion: motivo });
    showToast('Propuesta de reprogramación enviada al paciente.', 'info');
  }

  // Notificación al paciente
  const cita = getCitas().find(c => c.id === currentCitaId);
  if (cita) {
    const pac = getPacienteById(cita.pacienteId);
    if (pac) {
      const u = getUserById(pac.usuarioId);
      if (u) agregarNotificacion(u.id, accionRechazo === 'rechazar' ? 'cita_rechazada' : 'cita_reprogramada',
        accionRechazo === 'rechazar'
          ? `Tu cita del ${formatFechaCorta(cita.fecha)} fue rechazada. Motivo: ${motivo}`
          : `El doctor propone reprogramar tu cita al ${formatFechaCorta(document.getElementById('reprogram-fecha').value)}.`
      );
    }
  }

  cerrarModal('modal-rechazar');
  renderSolicitudes();
}

// ── HISTORIAL DOCTOR ──
function renderHistorialDoc() {
  const citas = getCitasDoctor(doctorData.id).filter(c => c.estado === 'finalizada');
  if (citas.length === 0) {
    document.getElementById('historial-doc-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <h3>Sin consultas finalizadas</h3>
      </div>`;
    return;
  }

  document.getElementById('historial-doc-list').innerHTML = citas.map(c => {
    const pac = getPacienteNombre(c.pacienteId);
    const esp = getEspecialidadById(c.especialidadId);
    const receta = getRecetas().find(r => r.citaId === c.id);
    const cert = getCertificados().find(r => r.citaId === c.id);
    const orden = getOrdenes().find(r => r.citaId === c.id);

    return `<div class="card" style="margin-bottom:14px;">
      <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">
        <div class="avatar avatar-lg">${pac[0]}</div>
        <div style="flex:1;">
          <div style="font-weight:700;">${pac}</div>
          <div style="font-size:0.82rem;color:var(--text-muted);">${esp?.nombre || ''} — ${formatFechaCorta(c.fecha)}</div>
          ${c.notas ? `<div style="margin-top:8px;padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--radius);font-size:0.85rem;">📝 ${c.notas}</div>` : ''}
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            ${receta ? `<button class="btn btn-sm btn-outline" onclick="verRecetaPDF('${receta.id}')">📄 Receta</button>` : ''}
            ${cert ? `<button class="btn btn-sm btn-outline" onclick="verCertPDF('${cert.id}')">📄 Certificado</button>` : ''}
            ${orden ? `<button class="btn btn-sm btn-outline" onclick="verOrdenPDF('${orden.id}')">📄 Orden Lab.</button>` : ''}
            <button class="btn btn-sm btn-secondary" onclick="verHistorialPaciente('${c.pacienteId}')">📂 Historial</button>
          </div>
        </div>
        <div>${c.calificacion ? `<span style="color:var(--warning);">${'⭐'.repeat(c.calificacion)}</span>` : '<span style="color:var(--text-muted);font-size:0.8rem;">Sin calificar</span>'}</div>
      </div>
    </div>`;
  }).join('');
}

// ── PERFIL ──
function renderPerfil() {
  const u = getUserById(sesionDoctor.userId);
  const esp = getEspecialidadById(doctorData.especialidadId);

  document.getElementById('perfil-doc-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Información personal</span></div>
        <div class="form-group"><label class="form-label">Nombre completo</label>
          <input type="text" class="form-control" id="prof-nombre" value="${u?.nombre || ''}"></div>
        <div class="form-group"><label class="form-label">Correo electrónico</label>
          <input type="email" class="form-control" id="prof-email" value="${u?.email || ''}"></div>
        <div class="form-group"><label class="form-label">Teléfono / WhatsApp</label>
          <input type="tel" class="form-control" id="prof-tel" value="${u?.telefono || ''}"></div>
        <button class="btn btn-primary" onclick="guardarPerfil()">💾 Guardar cambios</button>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Perfil profesional</span></div>
        <div class="form-group"><label class="form-label">Especialidad</label>
          <input type="text" class="form-control" value="${esp?.nombre || ''}" readonly></div>
        <div class="form-group"><label class="form-label">Credenciales / Títulos</label>
          <input type="text" class="form-control" id="prof-cred" value="${doctorData.credenciales || ''}"></div>
        <div class="form-group"><label class="form-label">Tarifa por consulta ($)</label>
          <input type="number" class="form-control" id="prof-tarifa" value="${doctorData.tarifa}"></div>
        <div class="form-group"><label class="form-label">Descripción</label>
          <textarea class="form-control" id="prof-desc">${doctorData.descripcion || ''}</textarea></div>
        <button class="btn btn-primary" onclick="guardarPerfilProfesional()">💾 Guardar</button>
      </div>
    </div>
    <div class="card" style="margin-top:20px;">
      <div class="card-header"><span class="card-title">Cambiar contraseña</span></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nueva contraseña</label>
          <input type="password" class="form-control" id="prof-new-pass" placeholder="Nueva contraseña"></div>
        <div class="form-group"><label class="form-label">Confirmar contraseña</label>
          <input type="password" class="form-control" id="prof-new-pass2" placeholder="Repetir contraseña"></div>
      </div>
      <button class="btn btn-secondary" onclick="cambiarPassword()">🔒 Actualizar contraseña</button>
    </div>
  `;
}

function guardarPerfil() {
  const nombre = document.getElementById('prof-nombre').value.trim();
  const email = document.getElementById('prof-email').value.trim();
  const telefono = document.getElementById('prof-tel').value.trim();
  if (!nombre || !email) { showToast('Nombre y correo son obligatorios.', 'error'); return; }
  actualizarUsuario(sesionDoctor.userId, { nombre, email, telefono });
  showToast('Perfil actualizado.', 'success');
}

function guardarPerfilProfesional() {
  const credenciales = document.getElementById('prof-cred').value.trim();
  const tarifa = parseFloat(document.getElementById('prof-tarifa').value) || 0;
  const descripcion = document.getElementById('prof-desc').value.trim();
  actualizarDoctor(doctorData.id, { credenciales, tarifa, descripcion });
  showToast('Perfil profesional actualizado.', 'success');
}

function cambiarPassword() {
  const p1 = document.getElementById('prof-new-pass').value;
  const p2 = document.getElementById('prof-new-pass2').value;
  if (p1.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres.', 'error'); return; }
  if (p1 !== p2) { showToast('Las contraseñas no coinciden.', 'error'); return; }
  actualizarUsuario(sesionDoctor.userId, { password: p1 });
  showToast('Contraseña actualizada.', 'success');
  document.getElementById('prof-new-pass').value = '';
  document.getElementById('prof-new-pass2').value = '';
}

// ── HORARIOS ──
function renderHorarios() {
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const nombDias = { lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado', domingo:'Domingo' };
  const todosSlots = ['07:00','08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];

  document.getElementById('horarios-doc-content').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">
      ${dias.map(dia => {
        const seleccionados = doctorData.horarios?.[dia] || [];
        return `<div class="card">
          <div class="card-header"><span class="card-title">${nombDias[dia]}</span></div>
          <div class="slots-grid" id="slots-${dia}">
            ${todosSlots.map(h => `
              <button class="slot-btn ${seleccionados.includes(h) ? 'selected' : ''}"
                onclick="toggleSlot('${dia}','${h}',this)">${h}</button>
            `).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-top:20px;text-align:right;">
      <button class="btn btn-primary" onclick="guardarHorarios()">💾 Guardar horarios</button>
    </div>
  `;
}

function toggleSlot(dia, hora, btn) {
  btn.classList.toggle('selected');
}

function guardarHorarios() {
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const horarios = {};
  dias.forEach(dia => {
    const btns = document.querySelectorAll(`#slots-${dia} .slot-btn.selected`);
    horarios[dia] = Array.from(btns).map(b => b.textContent.trim());
  });
  actualizarDoctor(doctorData.id, { horarios });
  doctorData.horarios = horarios;
  showToast('Horarios guardados correctamente.', 'success');
}

// ── VER DETALLE CITA ──
function verDetalleCita(citaId) {
  const cita = getCitas().find(c => c.id === citaId);
  if (!cita) return;
  const pac = getPacienteNombre(cita.pacienteId);
  const esp = getEspecialidadById(cita.especialidadId);
  const u = getUserById(getPacienteById(cita.pacienteId)?.usuarioId);

  document.getElementById('modal-cita-doc-body').innerHTML = `
    <div class="info-row"><span class="info-row-label">Paciente</span><span class="info-row-value">${pac}</span></div>
    <div class="info-row"><span class="info-row-label">Teléfono</span><span class="info-row-value">${u?.telefono || '—'}</span></div>
    <div class="info-row"><span class="info-row-label">Especialidad</span><span class="info-row-value">${esp?.nombre || '?'}</span></div>
    <div class="info-row"><span class="info-row-label">Fecha y hora</span><span class="info-row-value">${formatFecha(cita.fecha)} — ${cita.hora}</span></div>
    <div class="info-row"><span class="info-row-label">Motivo</span><span class="info-row-value">${cita.motivo}</span></div>
    <div class="info-row"><span class="info-row-label">Estado</span><span class="info-row-value">${estadoBadge(cita.estado)}</span></div>
    <div class="info-row"><span class="info-row-label">Pago</span><span class="info-row-value">${cita.estadoPago === 'pagado' ? '<span class="badge badge-success">Pagado</span>' : '<span class="badge badge-warning">Pendiente</span>'}</span></div>
    ${cita.notas ? `<div class="info-row"><span class="info-row-label">Notas clínicas</span><span class="info-row-value">${cita.notas}</span></div>` : ''}
  `;

  const footer = document.getElementById('modal-cita-doc-footer');
  footer.innerHTML = `<button class="btn btn-secondary" onclick="cerrarModal('modal-cita-doc')">Cerrar</button>`;
  if (cita.estado === 'aceptada') {
    footer.innerHTML += `<button class="btn btn-primary" onclick="cerrarModal('modal-cita-doc');iniciarVideoconsulta('${cita.id}')">📹 Iniciar consulta</button>`;
  }
  if (cita.estado === 'en_curso') {
    footer.innerHTML += `<button class="btn btn-success" onclick="cerrarModal('modal-cita-doc');abrirModalFinalizar('${cita.id}')">✅ Finalizar</button>`;
  }
  document.getElementById('modal-cita-doc').classList.add('active');
}

// ── VER HISTORIAL PACIENTE ──
function verHistorialPaciente(pacienteId) {
  const paciente = getPacienteById(pacienteId);
  const u = getUserById(paciente?.usuarioId);
  const hist = getHistorial().find(h => h.pacienteId === pacienteId);

  if (!hist) {
    document.getElementById('historial-pac-content').innerHTML = '<p style="color:var(--text-muted);">Sin historial clínico registrado.</p>';
  } else {
    document.getElementById('historial-pac-content').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="info-row"><span class="info-row-label">Paciente</span><span class="info-row-value"><strong>${u?.nombre || '?'}</strong></span></div>
        <div class="info-row"><span class="info-row-label">Grupo sanguíneo</span><span class="info-row-value">${hist.grupoSanguineo || '—'}</span></div>
        <div class="info-row"><span class="info-row-label">Peso</span><span class="info-row-value">${hist.peso || '—'}</span></div>
        <div class="info-row"><span class="info-row-label">Altura</span><span class="info-row-value">${hist.altura || '—'}</span></div>
      </div>
      <div class="hist-section">
        <div class="hist-label">Enfermedades crónicas</div>
        <div class="hist-tags">${hist.enfermedadesCronicas.length ? hist.enfermedadesCronicas.map(e => `<span class="hist-tag">${e}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguna</span>'}</div>
      </div>
      <div class="hist-section">
        <div class="hist-label">Alergias</div>
        <div class="hist-tags">${hist.alergias.length ? hist.alergias.map(a => `<span class="hist-tag danger">${a}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguna</span>'}</div>
      </div>
      <div class="hist-section">
        <div class="hist-label">Medicamentos actuales</div>
        <div class="hist-tags">${hist.medicamentosActuales.length ? hist.medicamentosActuales.map(m => `<span class="hist-tag success">${m}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguno</span>'}</div>
      </div>
      <div class="info-row"><span class="info-row-label">Antecedentes personales</span><span class="info-row-value">${hist.antecedentesPersonales || '—'}</span></div>
      <div class="info-row"><span class="info-row-label">Antecedentes familiares</span><span class="info-row-value">${hist.antecedentesFamiliares || '—'}</span></div>
      <div class="info-row"><span class="info-row-label">Antecedentes quirúrgicos</span><span class="info-row-value">${hist.antecedentesQuirurgicos.join(', ') || 'Ninguno'}</span></div>
    `;
  }
  document.getElementById('modal-historial-paciente').classList.add('active');
}

// ── INICIAR VIDEOCONSULTA ──
function iniciarVideoconsulta(citaId) {
  actualizarCita(citaId, { estado: 'en_curso' });
  sessionStorage.setItem('videoconsulta_cita', citaId);
  sessionStorage.setItem('videoconsulta_rol', 'doctor');
  window.location.href = 'videoconsulta.html';
}

// ── MODAL FINALIZAR ──
let citaFinalizandoId = null;
let finTabActual = 'diagnostico';

function abrirModalFinalizar(citaId) {
  citaFinalizandoId = citaId;
  switchFinTab('diagnostico', document.querySelector('#modal-finalizar .tab-btn'));
  document.getElementById('modal-finalizar').classList.add('active');
}

function switchFinTab(tab, btn) {
  finTabActual = tab;
  const tabs = ['diagnostico','receta','certificado','laboratorio'];
  tabs.forEach(t => {
    const el = document.getElementById('fin-tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('#modal-finalizar .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function agregarMedicamento() {
  const row = document.createElement('div');
  row.className = 'medicamento-row';
  row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;align-items:end;margin-bottom:10px;';
  row.innerHTML = `
    <div class="form-group" style="margin:0;"><input type="text" class="form-control med-nombre" placeholder="Medicamento"></div>
    <div class="form-group" style="margin:0;"><input type="text" class="form-control med-dosis" placeholder="Dosis"></div>
    <div class="form-group" style="margin:0;"><input type="text" class="form-control med-frecuencia" placeholder="Frecuencia"></div>
    <div class="form-group" style="margin:0;"><input type="text" class="form-control med-duracion" placeholder="Duración"></div>
    <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
  `;
  document.getElementById('receta-medicamentos').appendChild(row);
}

function finalizarConsulta() {
  const diagnostico = document.getElementById('fin-diagnostico').value.trim();
  const notas = document.getElementById('fin-notas').value.trim();
  if (!diagnostico) { showToast('Ingresa el diagnóstico.', 'error'); return; }

  // Actualizar cita
  actualizarCita(citaFinalizandoId, { estado: 'finalizada', notas: notas || '' });

  // Receta
  const meds = document.querySelectorAll('.medicamento-row');
  const medicamentos = [];
  meds.forEach(row => {
    const nombre = row.querySelector('.med-nombre')?.value.trim();
    if (nombre) medicamentos.push({
      nombre,
      dosis: row.querySelector('.med-dosis')?.value.trim() || '',
      frecuencia: row.querySelector('.med-frecuencia')?.value.trim() || '',
      duracion: row.querySelector('.med-duracion')?.value.trim() || ''
    });
  });
  if (medicamentos.length > 0) {
    const u = getUserById(sesionDoctor.userId);
    agregarReceta({
      id: generateId('r'),
      citaId: citaFinalizandoId,
      pacienteId: getCitas().find(c => c.id === citaFinalizandoId)?.pacienteId,
      doctorId: doctorData.id,
      fecha: new Date().toISOString().split('T')[0],
      diagnostico,
      medicamentos,
      observaciones: document.getElementById('receta-obs')?.value || '',
      firmaDigital: `${u?.nombre} — Reg. ${u?.identificacion}`
    });
  }

  // Certificado
  const certContenido = document.getElementById('cert-contenido')?.value.trim();
  if (certContenido) {
    agregarCertificado({
      id: generateId('cert'),
      citaId: citaFinalizandoId,
      pacienteId: getCitas().find(c => c.id === citaFinalizandoId)?.pacienteId,
      doctorId: doctorData.id,
      fecha: new Date().toISOString().split('T')[0],
      tipo: document.getElementById('cert-tipo')?.value || 'Consulta realizada',
      contenido: certContenido,
      diasReposo: parseInt(document.getElementById('cert-dias')?.value) || 0
    });
  }

  // Orden laboratorio
  const labExamenes = document.getElementById('lab-examenes')?.value.trim();
  if (labExamenes) {
    agregarOrden({
      id: generateId('ord'),
      citaId: citaFinalizandoId,
      pacienteId: getCitas().find(c => c.id === citaFinalizandoId)?.pacienteId,
      doctorId: doctorData.id,
      fecha: new Date().toISOString().split('T')[0],
      examenes: labExamenes.split('\n').filter(e => e.trim()),
      indicaciones: document.getElementById('lab-indicaciones')?.value || ''
    });
  }

  // Notificar paciente
  const cita = getCitas().find(c => c.id === citaFinalizandoId);
  if (cita) {
    const pac = getPacienteById(cita.pacienteId);
    if (pac) {
      const u2 = getUserById(pac.usuarioId);
      if (u2) agregarNotificacion(u2.id, 'consulta_finalizada', 'Tu consulta ha finalizado. Puedes descargar tu receta y documentos desde tu perfil.');
    }
  }

  cerrarModal('modal-finalizar');
  showToast('Consulta finalizada correctamente.', 'success');
  renderAgenda();
  renderHistorialDoc();
}

// ── VER PDFs ──
function verRecetaPDF(recetaId) {
  const r = getRecetas().find(rec => rec.id === recetaId);
  if (!r) return;
  const docNombre = getDoctorNombre(r.doctorId);
  const pacNombre = getPacienteNombre(r.pacienteId);

  showModal('Receta Médica', `
    <div class="pdf-preview">
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="font-size:1.3rem;">🏥 TeleMed — Receta Médica</h2>
        <p style="font-size:0.85rem;color:#555;">Fecha: ${r.fecha}</p>
      </div>
      <div class="pdf-field"><span class="pdf-label">Paciente:</span> ${pacNombre}</div>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${docNombre}</div>
      <div class="pdf-field"><span class="pdf-label">Diagnóstico:</span> ${r.diagnostico}</div>
      <hr style="margin:16px 0;">
      <h3 style="font-size:1rem;margin-bottom:12px;">Medicamentos:</h3>
      ${r.medicamentos.map(m => `<div style="background:#f5f5f5;border-radius:6px;padding:10px;margin-bottom:8px;">
        <strong>${m.nombre}</strong> — ${m.dosis}<br>
        <small>Frecuencia: ${m.frecuencia} | Duración: ${m.duracion}</small>
      </div>`).join('')}
      ${r.observaciones ? `<div class="pdf-field" style="margin-top:12px;"><span class="pdf-label">Observaciones:</span> ${r.observaciones}</div>` : ''}
      <div style="margin-top:24px;text-align:right;font-size:0.85rem;color:#666;">${r.firmaDigital}</div>
    </div>
  `);
}

function verCertPDF(certId) {
  const c = getCertificados().find(c => c.id === certId);
  if (!c) return;
  const docNombre = getDoctorNombre(c.doctorId);
  const pacNombre = getPacienteNombre(c.pacienteId);

  showModal('Certificado Médico', `
    <div class="pdf-preview">
      <h2>🏥 TeleMed — Certificado Médico</h2>
      <p style="font-size:0.85rem;color:#555;">Fecha: ${c.fecha}</p>
      <hr style="margin:16px 0;">
      <div class="pdf-field"><span class="pdf-label">Paciente:</span> ${pacNombre}</div>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${docNombre}</div>
      <div class="pdf-field"><span class="pdf-label">Tipo:</span> ${c.tipo}</div>
      ${c.diasReposo ? `<div class="pdf-field"><span class="pdf-label">Días de reposo:</span> ${c.diasReposo}</div>` : ''}
      <div style="margin-top:16px;padding:16px;border:1px solid #ccc;border-radius:8px;">${c.contenido}</div>
      <div style="margin-top:24px;text-align:right;font-size:0.85rem;color:#666;">Firma: ${docNombre}</div>
    </div>
  `);
}

function verOrdenPDF(ordenId) {
  const o = getOrdenes().find(o => o.id === ordenId);
  if (!o) return;
  const docNombre = getDoctorNombre(o.doctorId);
  const pacNombre = getPacienteNombre(o.pacienteId);

  showModal('Orden de Laboratorio', `
    <div class="pdf-preview">
      <h2>🏥 TeleMed — Orden de Laboratorio</h2>
      <p style="font-size:0.85rem;color:#555;">Fecha: ${o.fecha}</p>
      <hr style="margin:16px 0;">
      <div class="pdf-field"><span class="pdf-label">Paciente:</span> ${pacNombre}</div>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${docNombre}</div>
      <h3 style="margin:16px 0 8px;font-size:1rem;">Exámenes solicitados:</h3>
      <ul style="margin-left:20px;">${o.examenes.map(e => `<li>${e}</li>`).join('')}</ul>
      ${o.indicaciones ? `<div class="pdf-field" style="margin-top:12px;"><span class="pdf-label">Indicaciones:</span> ${o.indicaciones}</div>` : ''}
    </div>
  `);
}

// ── NOTIFICACIONES ──
function renderNotifDoc() {
  const notifs = getNotificaciones().filter(n => n.usuarioId === sesionDoctor.userId);
  document.getElementById('notif-list-doc').innerHTML = notifs.length === 0
    ? '<div class="empty-state"><div class="empty-state-icon">🔔</div><h3>Sin notificaciones</h3></div>'
    : notifs.map(n => `
        <div class="notif-item ${n.leida ? '' : 'unread'}" onclick="marcarNotificacionLeida('${n.id}');renderNotifDoc();updateNotifBadgeDoc();">
          <div class="notif-content">
            <div class="notif-text">${n.mensaje}</div>
            <div class="notif-time">${new Date(n.timestamp).toLocaleString('es-ES')}</div>
          </div>
          ${n.leida ? '' : '<span class="badge badge-primary">Nueva</span>'}
        </div>
      `).join('');
}

function updateNotifBadgeDoc() {
  const count = getNotificacionesNoLeidas(sesionDoctor.userId).length;
  const badge = document.getElementById('nav-notif-count-doc');
  const dot = document.getElementById('notif-dot-doc');
  if (badge) badge.textContent = count > 0 ? count : '';
  if (dot) dot.style.display = count > 0 ? 'block' : 'none';
}

function cerrarModal(id) {
  document.getElementById(id)?.classList.remove('active');
}
