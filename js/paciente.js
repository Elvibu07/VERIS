// ============================================================
// paciente.js — Lógica del panel Paciente
// ============================================================

let sesionPaciente = null;
let pacienteData = null;
let citaCalificandoId = null;
let calificacionSeleccionada = 5;
let docTabActual = 'recetas';

document.addEventListener('DOMContentLoaded', () => {
  sesionPaciente = requireAuth('paciente');
  if (!sesionPaciente) return;

  pacienteData = getPacienteByUserId(sesionPaciente.userId);
  if (!pacienteData) { logout(); return; }

  const u = getUserById(sesionPaciente.userId);
  document.getElementById('sidebar-name-pac').textContent = u?.nombre?.split(' ')[0] || 'Paciente';
  document.getElementById('sidebar-avatar-pac').textContent = u?.nombre?.[0] || 'P';
  document.getElementById('topbar-avatar-pac').textContent = u?.nombre?.[0] || 'P';

  showSection('miscitas');
  updateNotifBadgePac();
});

// ── Navegación ──
function showSection(sec) {
  const secciones = ['miscitas','historial','documentos','notificaciones','perfil'];
  secciones.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.style.display = s === sec ? 'block' : 'none';
    const nav = document.getElementById('nav-' + s);
    if (nav) nav.classList.toggle('active', s === sec);
  });
  document.getElementById('topbar-title-pac').textContent = {
    miscitas:'Mis Citas', historial:'Mi Historial Médico',
    documentos:'Mis Documentos', notificaciones:'Notificaciones', perfil:'Mi Perfil'
  }[sec] || sec;

  const r = { miscitas:renderMisCitas, historial:renderHistorialPac,
               documentos:renderDocumentos, notificaciones:renderNotifPac, perfil:renderPerfilPac };
  if (r[sec]) r[sec]();
}

function irAgendar() {
  window.location.href = 'agendar-cita.html';
}

// ── MIS CITAS ──
function renderMisCitas() {
  switchCitasTab('activas', document.querySelector('#sec-miscitas .tab-btn'));
  renderProximaCita();
}

function renderProximaCita() {
  const hoy = new Date().toISOString().split('T')[0];
  const citas = getCitasPaciente(pacienteData.id)
    .filter(c => c.fecha >= hoy && ['aceptada','pendiente','en_curso'].includes(c.estado))
    .sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  const banner = document.getElementById('proxima-cita-banner');
  if (citas.length === 0) { banner.innerHTML = ''; return; }

  const c = citas[0];
  const doc = getDoctorNombre(c.doctorId);
  const esp = getEspecialidadById(c.especialidadId);
  const esHoy = c.fecha === hoy;
  const ahora = new Date();
  const citaTime = new Date(`${c.fecha}T${c.hora}:00`);
  const diffMin = Math.round((citaTime - ahora) / 60000);
  const puedConectar = diffMin <= 3 && diffMin >= -90 && c.estado === 'aceptada';

  banner.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(26,127,232,0.15),rgba(0,201,177,0.1));border:1px solid rgba(26,127,232,0.3);border-radius:var(--radius-lg);padding:20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
      <div style="font-size:3rem;">📹</div>
      <div style="flex:1;">
        <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--primary-light);margin-bottom:4px;">
          ${esHoy ? '📌 PRÓXIMA CITA — HOY' : '📌 PRÓXIMA CITA'}
        </div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);">${doc} — ${esp?.nombre || ''}</div>
        <div style="font-size:0.88rem;color:var(--text-secondary);">${formatFecha(c.fecha)} a las ${c.hora}</div>
        ${puedConectar ? '<div style="color:var(--success);font-size:0.85rem;font-weight:600;margin-top:4px;">🟢 ¡La sala ya está disponible! Puedes conectarte ahora.</div>' : ''}
        ${esHoy && !puedConectar && diffMin > 0 ? `<div style="color:var(--warning);font-size:0.85rem;margin-top:4px;">⏱️ Disponible para conectar en ${diffMin} minutos</div>` : ''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${estadoBadge(c.estado)}
        ${puedConectar ? `<button class="btn btn-success" onclick="conectarVideoconsulta('${c.id}')">📹 Conectarme</button>` : ''}
      </div>
    </div>
  `;
}

let citasTabActual = 'activas';
function switchCitasTab(tab, btn) {
  citasTabActual = tab;
  document.querySelectorAll('#sec-miscitas .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCitasContent(tab);
}

function renderCitasContent(tab) {
  const hoy = new Date().toISOString().split('T')[0];
  let citas = getCitasPaciente(pacienteData.id);

  if (tab === 'activas') citas = citas.filter(c => ['pendiente','aceptada','en_curso','reprogramada'].includes(c.estado));
  else if (tab === 'pasadas') citas = citas.filter(c => ['finalizada','cancelada','rechazada'].includes(c.estado));

  citas.sort((a,b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  if (citas.length === 0) {
    document.getElementById('citas-pac-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3>Sin citas ${tab === 'activas' ? 'activas' : tab === 'pasadas' ? 'en el historial' : ''}</h3>
        <p>Agenda tu primera cita médica.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="irAgendar()">Agendar cita</button>
      </div>`;
    return;
  }

  document.getElementById('citas-pac-content').innerHTML = citas.map(c => {
    const doc = getDoctorNombre(c.doctorId);
    const esp = getEspecialidadById(c.especialidadId);
    const esHoy = c.fecha === hoy;
    const ahora = new Date();
    const citaTime = new Date(`${c.fecha}T${c.hora}:00`);
    const diffMin = Math.round((citaTime - ahora) / 60000);
    const puedConectar = diffMin <= 3 && diffMin >= -90 && c.estado === 'aceptada';

    const acciones = [];
    if (c.estado === 'pendiente' || c.estado === 'aceptada') {
      acciones.push(`<button class="btn btn-sm btn-danger" onclick="cancelarCitaConfirm('${c.id}')">❌ Cancelar</button>`);
    }
    if (puedConectar) {
      acciones.push(`<button class="btn btn-sm btn-success" onclick="conectarVideoconsulta('${c.id}')">📹 Conectarme</button>`);
    }
    if (c.estado === 'reprogramada') {
      acciones.push(`<button class="btn btn-sm btn-success" onclick="aceptarReprogramacion('${c.id}')">✅ Aceptar reprogramación</button>`);
      acciones.push(`<button class="btn btn-sm btn-danger" onclick="cancelarCitaConfirm('${c.id}')">❌ Rechazar</button>`);
    }
    if (c.estado === 'finalizada' && !c.calificacion) {
      acciones.push(`<button class="btn btn-sm btn-warning" onclick="abrirCalificacion('${c.id}')">⭐ Calificar</button>`);
    }
    acciones.push(`<button class="btn btn-sm btn-secondary" onclick="verDetalleCitaPac('${c.id}')">Ver detalles</button>`);

    return `<div class="card" style="margin-bottom:14px;">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
        <div style="min-width:70px;text-align:center;">
          <div style="font-size:1.4rem;font-weight:800;color:var(--primary);">${c.hora}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${formatFechaCorta(c.fecha)}</div>
          ${esHoy ? '<span class="badge badge-primary" style="font-size:0.68rem;margin-top:4px;">HOY</span>' : ''}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
            <strong style="font-size:0.95rem;">${doc}</strong>
            <span style="color:var(--text-muted);font-size:0.82rem;">${esp?.icono || ''} ${esp?.nombre || ''}</span>
          </div>
          <div style="font-size:0.83rem;color:var(--text-secondary);margin-bottom:8px;">📝 ${c.motivo}</div>
          ${c.estado === 'reprogramada' && c.fechaNueva ? `
            <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);padding:8px;margin-bottom:8px;font-size:0.83rem;color:var(--warning);">
              📅 El doctor propone: ${formatFechaCorta(c.fechaNueva)} a las ${c.horaNueva || '?'}
              ${c.motivoReprogramacion ? ` — Motivo: ${c.motivoReprogramacion}` : ''}
            </div>
          ` : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            ${estadoBadge(c.estado)}
            ${c.estadoPago === 'pagado' ? '<span class="badge badge-success" style="font-size:0.72rem;">✅ Pagado</span>' : ''}
            ${c.calificacion ? `<span style="color:var(--warning);font-size:0.82rem;">${'⭐'.repeat(c.calificacion)}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          ${acciones.join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

function cancelarCitaConfirm(citaId) {
  showConfirm('¿Estás seguro de que quieres cancelar esta cita?', () => {
    actualizarCita(citaId, { estado: 'cancelada' });
    showToast('Cita cancelada.', 'warning');
    renderMisCitas();
  }, '¿Cancelar cita?');
}

function aceptarReprogramacion(citaId) {
  const cita = getCitas().find(c => c.id === citaId);
  if (cita?.fechaNueva) {
    actualizarCita(citaId, { estado: 'aceptada', fecha: cita.fechaNueva, hora: cita.horaNueva || cita.hora });
    showToast('Reprogramación aceptada.', 'success');
    renderMisCitas();
  }
}

function conectarVideoconsulta(citaId) {
  actualizarCita(citaId, { estado: 'en_curso' });
  sessionStorage.setItem('videoconsulta_cita', citaId);
  sessionStorage.setItem('videoconsulta_rol', 'paciente');
  window.location.href = 'videoconsulta.html';
}

// ── VER DETALLE CITA ──
function verDetalleCitaPac(citaId) {
  const cita = getCitas().find(c => c.id === citaId);
  if (!cita) return;
  const doc = getDoctorNombre(cita.doctorId);
  const docObj = getDoctorById(cita.doctorId);
  const u = getUserById(docObj?.usuarioId);
  const esp = getEspecialidadById(cita.especialidadId);

  document.getElementById('modal-cita-pac-body').innerHTML = `
    <div class="info-row"><span class="info-row-label">Doctor</span><span class="info-row-value"><strong>${doc}</strong></span></div>
    <div class="info-row"><span class="info-row-label">Teléfono doctor</span><span class="info-row-value">${u?.telefono || '—'}</span></div>
    <div class="info-row"><span class="info-row-label">Especialidad</span><span class="info-row-value">${esp?.icono || ''} ${esp?.nombre || '?'}</span></div>
    <div class="info-row"><span class="info-row-label">Fecha y hora</span><span class="info-row-value">${formatFecha(cita.fecha)} — ${cita.hora}</span></div>
    <div class="info-row"><span class="info-row-label">Motivo</span><span class="info-row-value">${cita.motivo}</span></div>
    <div class="info-row"><span class="info-row-label">Estado</span><span class="info-row-value">${estadoBadge(cita.estado)}</span></div>
    <div class="info-row"><span class="info-row-label">Pago</span><span class="info-row-value">$${cita.montoPago?.toFixed(2) || '0.00'} — ${cita.estadoPago === 'pagado' ? '<span class="badge badge-success">Pagado</span>' : '<span class="badge badge-warning">Pendiente</span>'}</span></div>
    ${cita.convenio ? `<div class="info-row"><span class="info-row-label">Convenio</span><span class="info-row-value"><span class="badge badge-info">${cita.convenio}</span></span></div>` : ''}
    ${cita.notas ? `<div class="info-row"><span class="info-row-label">Notas médicas</span><span class="info-row-value">${cita.notas}</span></div>` : ''}
  `;

  const footer = document.getElementById('modal-cita-pac-footer');
  footer.innerHTML = `<button class="btn btn-secondary" onclick="cerrarModal('modal-cita-pac')">Cerrar</button>`;
  document.getElementById('modal-cita-pac').classList.add('active');
}

// ── CALIFICACIÓN ──
function abrirCalificacion(citaId) {
  citaCalificandoId = citaId;
  calificacionSeleccionada = 5;
  document.getElementById('calif-comentario').value = '';
  renderStars(5);
  document.getElementById('modal-calificar').classList.add('active');
}

function selectStar(val) {
  calificacionSeleccionada = val;
  renderStars(val);
}

function renderStars(val) {
  document.querySelectorAll('#stars-calificacion .star').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

function guardarCalificacion() {
  actualizarCita(citaCalificandoId, { calificacion: calificacionSeleccionada });
  cerrarModal('modal-calificar');
  showToast('¡Gracias por tu calificación! ⭐'.repeat(calificacionSeleccionada), 'success');
  renderMisCitas();
}

// ── HISTORIAL MÉDICO ──
function renderHistorialPac() {
  const hist = getHistorial().find(h => h.pacienteId === pacienteData.id);
  const u = getUserById(sesionPaciente.userId);

  if (!hist) {
    document.getElementById('historial-pac-content').innerHTML = '<div class="empty-state"><p>Sin historial clínico.</p></div>';
    return;
  }

  document.getElementById('historial-pac-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Datos generales</span></div>
        <div class="info-row"><span class="info-row-label">Nombre</span><span class="info-row-value"><strong>${u?.nombre}</strong></span></div>
        <div class="info-row"><span class="info-row-label">Identificación</span><span class="info-row-value">${u?.identificacion || '—'}</span></div>
        <div class="info-row"><span class="info-row-label">Grupo sanguíneo</span><span class="info-row-value"><span class="badge badge-danger">${hist.grupoSanguineo || '—'}</span></span></div>
        <div class="info-row"><span class="info-row-label">Peso</span><span class="info-row-value">${hist.peso || '—'}</span></div>
        <div class="info-row"><span class="info-row-label">Altura</span><span class="info-row-value">${hist.altura || '—'}</span></div>
        <div class="info-row"><span class="info-row-label">Convenio</span><span class="info-row-value">${pacienteData.convenioSeguro ? `<span class="badge badge-info">${pacienteData.convenioSeguro}</span>` : '—'}</span></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Condiciones clínicas</span></div>
        <div class="hist-section">
          <div class="hist-label">Enfermedades crónicas</div>
          <div class="hist-tags">${hist.enfermedadesCronicas.length ? hist.enfermedadesCronicas.map(e => `<span class="hist-tag">${e}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguna</span>'}</div>
        </div>
        <div class="hist-section">
          <div class="hist-label">Alergias</div>
          <div class="hist-tags">${hist.alergias.length ? hist.alergias.map(a => `<span class="hist-tag danger">⚠️ ${a}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguna</span>'}</div>
        </div>
        <div class="hist-section">
          <div class="hist-label">Medicamentos actuales</div>
          <div class="hist-tags">${hist.medicamentosActuales.length ? hist.medicamentosActuales.map(m => `<span class="hist-tag success">💊 ${m}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem;">Ninguno</span>'}</div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Antecedentes personales</span></div>
        <p style="font-size:0.88rem;">${hist.antecedentesPersonales || 'Sin antecedentes registrados.'}</p>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Antecedentes familiares</span></div>
        <p style="font-size:0.88rem;">${hist.antecedentesFamiliares || 'Sin antecedentes familiares.'}</p>
      </div>
    </div>
    <div class="card" style="margin-top:20px;">
      <div class="card-header"><span class="card-title">Historial de consultas</span></div>
      ${buildConsultasHistorial()}
    </div>
  `;
}

function buildConsultasHistorial() {
  const citas = getCitasPaciente(pacienteData.id).filter(c => c.estado === 'finalizada');
  if (citas.length === 0) return '<p style="color:var(--text-muted);font-size:0.88rem;">Sin consultas finalizadas.</p>';
  return citas.map(c => `
    <div style="border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
        <strong>${getDoctorNombre(c.doctorId)}</strong>
        <span style="font-size:0.8rem;color:var(--text-muted);">${formatFechaCorta(c.fecha)}</span>
      </div>
      <div style="font-size:0.83rem;color:var(--text-secondary);">${c.notas || 'Sin notas.'}</div>
    </div>
  `).join('');
}

// ── DOCUMENTOS ──
function renderDocumentos() {
  switchDocTab('recetas', document.querySelector('#sec-documentos .tab-btn'));
}

function switchDocTab(tab, btn) {
  docTabActual = tab;
  document.querySelectorAll('#sec-documentos .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDocsContent(tab);
}

function renderDocsContent(tab) {
  let html = '';

  if (tab === 'recetas') {
    const recetas = getRecetas().filter(r => r.pacienteId === pacienteData.id);
    html = recetas.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">📄</div><h3>Sin recetas</h3></div>'
      : recetas.map(r => `
          <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:14px;">
            <div style="font-size:2rem;">💊</div>
            <div style="flex:1;">
              <strong>${r.diagnostico}</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);">${getDoctorNombre(r.doctorId)} — ${formatFechaCorta(r.fecha)}</div>
              <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px;">${r.medicamentos.length} medicamento(s)</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="verDocPDF('receta','${r.id}')">📄 Ver</button>
          </div>`).join('');
  }

  if (tab === 'certificados') {
    const certs = getCertificados().filter(c => c.pacienteId === pacienteData.id);
    html = certs.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">📃</div><h3>Sin certificados</h3></div>'
      : certs.map(c => `
          <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:14px;">
            <div style="font-size:2rem;">📃</div>
            <div style="flex:1;">
              <strong>${c.tipo}</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);">${getDoctorNombre(c.doctorId)} — ${formatFechaCorta(c.fecha)}</div>
              ${c.diasReposo ? `<div style="font-size:0.82rem;color:var(--warning);">${c.diasReposo} días de reposo</div>` : ''}
            </div>
            <button class="btn btn-primary btn-sm" onclick="verDocPDF('cert','${c.id}')">📄 Ver</button>
          </div>`).join('');
  }

  if (tab === 'ordenes') {
    const ordenes = getOrdenes().filter(o => o.pacienteId === pacienteData.id);
    html = ordenes.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">🔬</div><h3>Sin órdenes de laboratorio</h3></div>'
      : ordenes.map(o => `
          <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:14px;">
            <div style="font-size:2rem;">🔬</div>
            <div style="flex:1;">
              <strong>Orden de laboratorio</strong>
              <div style="font-size:0.82rem;color:var(--text-muted);">${getDoctorNombre(o.doctorId)} — ${formatFechaCorta(o.fecha)}</div>
              <div style="font-size:0.82rem;color:var(--text-secondary);">${o.examenes.length} examen(es) solicitado(s)</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="verDocPDF('orden','${o.id}')">📄 Ver</button>
          </div>`).join('');
  }

  document.getElementById('docs-pac-content').innerHTML = html;
}

function verDocPDF(tipo, id) {
  let titulo = '', cuerpo = '';

  if (tipo === 'receta') {
    const r = getRecetas().find(rec => rec.id === id);
    if (!r) return;
    titulo = 'Receta Médica';
    cuerpo = `<div class="pdf-preview">
      <h2>🏥 TeleMed — Receta Médica</h2>
      <p style="font-size:0.85rem;color:#555;">Fecha: ${r.fecha}</p>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${getDoctorNombre(r.doctorId)}</div>
      <div class="pdf-field"><span class="pdf-label">Diagnóstico:</span> ${r.diagnostico}</div>
      <hr style="margin:16px 0;">
      ${r.medicamentos.map(m => `<div style="background:#f5f5f5;border-radius:6px;padding:10px;margin-bottom:8px;">
        <strong>${m.nombre}</strong> — ${m.dosis}<br>
        <small>Cada ${m.frecuencia} por ${m.duracion}</small>
      </div>`).join('')}
      ${r.observaciones ? `<p><b>Obs:</b> ${r.observaciones}</p>` : ''}
      <div style="margin-top:20px;text-align:right;font-size:0.85rem;">${r.firmaDigital}</div>
    </div>`;
  } else if (tipo === 'cert') {
    const c = getCertificados().find(cer => cer.id === id);
    if (!c) return;
    titulo = 'Certificado Médico';
    cuerpo = `<div class="pdf-preview">
      <h2>🏥 TeleMed — Certificado Médico</h2>
      <div class="pdf-field"><span class="pdf-label">Tipo:</span> ${c.tipo}</div>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${getDoctorNombre(c.doctorId)}</div>
      <div class="pdf-field"><span class="pdf-label">Fecha:</span> ${c.fecha}</div>
      ${c.diasReposo ? `<div class="pdf-field"><span class="pdf-label">Días reposo:</span> ${c.diasReposo}</div>` : ''}
      <div style="margin-top:16px;padding:16px;border:1px solid #ccc;border-radius:8px;">${c.contenido}</div>
    </div>`;
  } else {
    const o = getOrdenes().find(or => or.id === id);
    if (!o) return;
    titulo = 'Orden de Laboratorio';
    cuerpo = `<div class="pdf-preview">
      <h2>🏥 TeleMed — Orden de Laboratorio</h2>
      <div class="pdf-field"><span class="pdf-label">Doctor:</span> ${getDoctorNombre(o.doctorId)}</div>
      <div class="pdf-field"><span class="pdf-label">Fecha:</span> ${o.fecha}</div>
      <ul style="margin:16px 0 0 20px;">${o.examenes.map(e => `<li>${e}</li>`).join('')}</ul>
      ${o.indicaciones ? `<p style="margin-top:12px;"><b>Indicaciones:</b> ${o.indicaciones}</p>` : ''}
    </div>`;
  }

  document.getElementById('modal-doc-title').textContent = titulo;
  document.getElementById('modal-doc-body').innerHTML = cuerpo;
  document.getElementById('modal-doc-viewer').classList.add('active');
}

function simularDescarga() {
  showToast('Descargando PDF... (simulado en demo)', 'info');
}

// ── NOTIFICACIONES ──
function renderNotifPac() {
  const notifs = getNotificaciones().filter(n => n.usuarioId === sesionPaciente.userId);
  document.getElementById('notif-list-pac').innerHTML = notifs.length === 0
    ? '<div class="empty-state"><div class="empty-state-icon">🔔</div><h3>Sin notificaciones</h3></div>'
    : notifs.map(n => `
        <div class="notif-item ${n.leida ? '' : 'unread'}" onclick="marcarNotificacionLeida('${n.id}');renderNotifPac();updateNotifBadgePac();">
          <div class="notif-content">
            <div class="notif-text">${n.mensaje}</div>
            <div class="notif-time">${new Date(n.timestamp).toLocaleString('es-ES')}</div>
          </div>
          ${n.leida ? '' : '<span class="badge badge-primary">Nueva</span>'}
        </div>
      `).join('');
}

function updateNotifBadgePac() {
  const count = getNotificacionesNoLeidas(sesionPaciente.userId).length;
  const badge = document.getElementById('nav-notif-count-pac');
  const dot = document.getElementById('notif-dot-pac');
  if (badge) badge.textContent = count > 0 ? count : '';
  if (dot) dot.style.display = count > 0 ? 'block' : 'none';
}

// ── PERFIL ──
function renderPerfilPac() {
  const u = getUserById(sesionPaciente.userId);
  document.getElementById('perfil-pac-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Datos personales</span></div>
        <div class="form-group"><label class="form-label">Nombre completo</label>
          <input type="text" class="form-control" id="pac-nombre" value="${u?.nombre || ''}"></div>
        <div class="form-group"><label class="form-label">Correo electrónico</label>
          <input type="email" class="form-control" id="pac-email" value="${u?.email || ''}"></div>
        <div class="form-group"><label class="form-label">Teléfono / WhatsApp</label>
          <input type="tel" class="form-control" id="pac-tel" value="${u?.telefono || ''}"></div>
        <button class="btn btn-primary" onclick="guardarPerfilPac()">💾 Guardar</button>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Seguridad</span></div>
        <div class="form-group"><label class="form-label">Nueva contraseña</label>
          <input type="password" class="form-control" id="pac-new-pass" placeholder="Nueva contraseña"></div>
        <div class="form-group"><label class="form-label">Confirmar contraseña</label>
          <input type="password" class="form-control" id="pac-new-pass2" placeholder="Repetir contraseña"></div>
        <button class="btn btn-secondary" onclick="cambiarPasswordPac()">🔒 Cambiar contraseña</button>
      </div>
    </div>
  `;
}

function guardarPerfilPac() {
  const nombre = document.getElementById('pac-nombre').value.trim();
  const email = document.getElementById('pac-email').value.trim();
  const telefono = document.getElementById('pac-tel').value.trim();
  if (!nombre || !email) { showToast('Nombre y correo son obligatorios.', 'error'); return; }
  actualizarUsuario(sesionPaciente.userId, { nombre, email, telefono });
  showToast('Perfil actualizado.', 'success');
}

function cambiarPasswordPac() {
  const p1 = document.getElementById('pac-new-pass').value;
  const p2 = document.getElementById('pac-new-pass2').value;
  if (p1.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres.', 'error'); return; }
  if (p1 !== p2) { showToast('Las contraseñas no coinciden.', 'error'); return; }
  actualizarUsuario(sesionPaciente.userId, { password: p1 });
  showToast('Contraseña actualizada.', 'success');
}

function cerrarModal(id) {
  document.getElementById(id)?.classList.remove('active');
}
