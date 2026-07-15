// ============================================================
// auth.js — Autenticación, sesión y control de acceso por rol
// ============================================================

const SESSION_KEY = 'telemed_session';

// ── Login ──
function login(email, password) {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.password === password);

  if (!usuario) return { ok: false, error: 'Credenciales incorrectas.' };
  if (usuario.estado !== 'activo') return { ok: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' };

  const sesion = {
    userId: usuario.id,
    rol: usuario.rol,
    nombre: usuario.nombre,
    email: usuario.email,
    loginAt: Date.now()
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  return { ok: true, sesion };
}

// ── Logout ──
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

// ── Obtener sesión activa ──
function getSesion() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const sesion = JSON.parse(raw);

  // Auto-logout por inactividad (30 minutos)
  const INACTIVIDAD_MS = 30 * 60 * 1000;
  if (Date.now() - sesion.loginAt > INACTIVIDAD_MS) {
    logout();
    return null;
  }
  // Refrescar tiempo
  sesion.loginAt = Date.now();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  return sesion;
}

// ── Verificar sesión y redirigir si no hay ──
function requireAuth(rolRequerido) {
  const sesion = getSesion();
  if (!sesion) {
    window.location.href = 'index.html';
    return null;
  }
  if (rolRequerido && sesion.rol !== rolRequerido) {
    // Redirigir al dashboard correcto
    redirigirPorRol(sesion.rol);
    return null;
  }
  return sesion;
}

// ── Redirigir según rol ──
function redirigirPorRol(rol) {
  const rutas = {
    admin: 'dashboard-admin.html',
    doctor: 'dashboard-doctor.html',
    paciente: 'dashboard-paciente.html'
  };
  window.location.href = rutas[rol] || 'index.html';
}

// ── Registro de nuevo paciente ──
function registrarPaciente(datos) {
  const usuarios = getUsuarios();

  if (usuarios.find(u => u.email === datos.email)) {
    return { ok: false, error: 'El correo ya está registrado.' };
  }

  const nuevoId = generateId('u');
  const pacId = generateId('p');

  const nuevoUsuario = {
    id: nuevoId,
    rol: 'paciente',
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password,
    telefono: datos.telefono,
    identificacion: datos.identificacion,
    estado: 'activo',
    avatar: null,
    fechaRegistro: new Date().toISOString().split('T')[0]
  };

  const nuevoPaciente = {
    id: pacId,
    usuarioId: nuevoId,
    convenioSeguro: datos.convenio || null,
    grupoFamiliar: []
  };

  const nuevoHistorial = {
    id: generateId('h'),
    pacienteId: pacId,
    enfermedadesCronicas: [],
    alergias: [],
    medicamentosActuales: [],
    grupoSanguineo: '',
    peso: '',
    altura: '',
    antecedentesQuirurgicos: [],
    antecedentesPersonales: '',
    antecedentesFamiliares: ''
  };

  agregarUsuario(nuevoUsuario);
  agregarPaciente(nuevoPaciente);

  const db = getDB();
  db.historialClinico.push(nuevoHistorial);
  saveDB(db);

  return { ok: true };
}

// ── Actualizar actividad para anti-timeout ──
function refrescarSesion() {
  const sesion = getSesion();
  if (sesion) {
    sesion.loginAt = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  }
}

// ── Toast de notificación ──
function showToast(mensaje, tipo = 'info') {
  const existing = document.querySelector('.toast-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.className = 'toast-container';

  const iconos = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  container.innerHTML = `
    <div class="toast toast-${tipo}">
      <span class="toast-icon">${iconos[tipo] || 'ℹ️'}</span>
      <span class="toast-msg">${mensaje}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 4000);
}

// ── Modal de confirmación ──
function showConfirm(mensaje, onConfirm, titulo = '¿Estás seguro?') {
  const existing = document.getElementById('confirm-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-modal-overlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${titulo}</h3>
      </div>
      <div class="modal-body">
        <p>${mensaje}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn-danger" id="confirm-ok">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('confirm-cancel').onclick = () => overlay.remove();
  document.getElementById('confirm-ok').onclick = () => {
    overlay.remove();
    onConfirm();
  };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ── Modal genérico ──
function showModal(titulo, contenidoHTML, footerHTML = '') {
  const existing = document.getElementById('generic-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'generic-modal-overlay';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-box modal-lg">
      <div class="modal-header">
        <h3>${titulo}</h3>
        <button class="modal-close-btn" onclick="document.getElementById('generic-modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">${contenidoHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// Escuchar actividad del usuario para refrescar sesión
document.addEventListener('click', refrescarSesion);
document.addEventListener('keydown', refrescarSesion);
