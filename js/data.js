// ============================================================
// data.js — Datos de demostración para la Plataforma Telemedicina
// ============================================================

const DB_KEY = 'telemed_db';

const INITIAL_DATA = {
  usuarios: [
    {
      id: 'u001',
      rol: 'admin',
      nombre: 'Carlos Administrador',
      email: 'admin@clinica.com',
      password: 'admin123',
      telefono: '+593 99 000 0001',
      identificacion: '0900000001',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-01-15'
    },
    {
      id: 'u002',
      rol: 'doctor',
      nombre: 'Dr. Andrés García',
      email: 'dr.garcia@clinica.com',
      password: 'doctor123',
      telefono: '+593 99 111 2233',
      identificacion: '0912345678',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-01-20'
    },
    {
      id: 'u003',
      rol: 'doctor',
      nombre: 'Dra. María López',
      email: 'dra.lopez@clinica.com',
      password: 'doctor123',
      telefono: '+593 99 222 3344',
      identificacion: '0923456789',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-02-01'
    },
    {
      id: 'u004',
      rol: 'doctor',
      nombre: 'Dr. Roberto Pérez',
      email: 'dr.perez@clinica.com',
      password: 'doctor123',
      telefono: '+593 99 333 4455',
      identificacion: '0934567890',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-02-10'
    },
    {
      id: 'u005',
      rol: 'paciente',
      nombre: 'Laura Gómez',
      email: 'paciente@email.com',
      password: 'paciente123',
      telefono: '+593 99 444 5566',
      identificacion: '0945678901',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-03-05'
    },
    {
      id: 'u006',
      rol: 'paciente',
      nombre: 'Juan Martínez',
      email: 'juan@email.com',
      password: 'paciente123',
      telefono: '+593 99 555 6677',
      identificacion: '0956789012',
      estado: 'activo',
      avatar: null,
      fechaRegistro: '2025-03-10'
    }
  ],

  doctores: [
    {
      id: 'd001',
      usuarioId: 'u002',
      especialidadId: 'e001',
      descripcion: 'Cardiólogo con más de 10 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares.',
      credenciales: 'MD, PhD — Universidad Central del Ecuador',
      tarifa: 45.00,
      calificacion: 4.8,
      totalConsultas: 312,
      horarios: {
        lunes: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        martes: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
        miercoles: ['08:00', '09:00', '10:00', '11:00'],
        jueves: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        viernes: ['08:00', '09:00', '10:00', '11:00'],
        sabado: [],
        domingo: []
      },
      estadoAprobacion: 'aprobado'
    },
    {
      id: 'd002',
      usuarioId: 'u003',
      especialidadId: 'e002',
      descripcion: 'Dermatóloga especialista en el diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.',
      credenciales: 'MD — Universidad de Guayaquil',
      tarifa: 40.00,
      calificacion: 4.9,
      totalConsultas: 248,
      horarios: {
        lunes: ['09:00', '10:00', '11:00', '15:00', '16:00'],
        martes: ['09:00', '10:00', '11:00', '15:00', '16:00'],
        miercoles: ['09:00', '10:00', '11:00', '15:00', '16:00'],
        jueves: ['09:00', '10:00', '11:00'],
        viernes: ['09:00', '10:00', '11:00', '15:00', '16:00'],
        sabado: ['09:00', '10:00', '11:00'],
        domingo: []
      },
      estadoAprobacion: 'aprobado'
    },
    {
      id: 'd003',
      usuarioId: 'u004',
      especialidadId: 'e003',
      descripcion: 'Médico general con amplia experiencia en atención primaria y medicina preventiva.',
      credenciales: 'MD — PUCE',
      tarifa: 30.00,
      calificacion: 4.7,
      totalConsultas: 425,
      horarios: {
        lunes: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        martes: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        miercoles: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
        jueves: ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
        viernes: ['07:00', '08:00', '09:00', '10:00', '11:00'],
        sabado: ['08:00', '09:00', '10:00', '11:00'],
        domingo: []
      },
      estadoAprobacion: 'aprobado'
    }
  ],

  pacientes: [
    {
      id: 'p001',
      usuarioId: 'u005',
      convenioSeguro: 'IESS',
      grupoFamiliar: []
    },
    {
      id: 'p002',
      usuarioId: 'u006',
      convenioSeguro: null,
      grupoFamiliar: []
    }
  ],

  especialidades: [
    { id: 'e001', nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento del corazón y sistema cardiovascular', icono: '❤️', activo: true },
    { id: 'e002', nombre: 'Dermatología', descripcion: 'Enfermedades de la piel, cabello y uñas', icono: '🩺', activo: true },
    { id: 'e003', nombre: 'Medicina General', descripcion: 'Atención primaria y medicina preventiva', icono: '🏥', activo: true },
    { id: 'e004', nombre: 'Pediatría', descripcion: 'Atención médica de niños y adolescentes', icono: '👶', activo: true },
    { id: 'e005', nombre: 'Ginecología', descripcion: 'Salud del sistema reproductor femenino', icono: '🌸', activo: true },
    { id: 'e006', nombre: 'Neurología', descripcion: 'Enfermedades del sistema nervioso', icono: '🧠', activo: true },
    { id: 'e007', nombre: 'Oftalmología', descripcion: 'Enfermedades y cirugía de los ojos', icono: '👁️', activo: true },
    { id: 'e008', nombre: 'Ortopedia', descripcion: 'Sistema musculoesquelético: huesos, articulaciones y músculos', icono: '🦴', activo: true }
  ],

  citas: [
    {
      id: 'c001',
      pacienteId: 'p001',
      doctorId: 'd001',
      especialidadId: 'e001',
      fecha: '2026-07-14',
      hora: '09:00',
      motivo: 'Control de presión arterial y revisión de medicación',
      estado: 'aceptada',
      adjuntos: [],
      convenio: 'IESS',
      montoPago: 45.00,
      estadoPago: 'pagado',
      calificacion: null,
      notas: '',
      fechaCreacion: '2026-07-10'
    },
    {
      id: 'c002',
      pacienteId: 'p001',
      doctorId: 'd002',
      especialidadId: 'e002',
      fecha: '2026-07-12',
      hora: '10:00',
      motivo: 'Revisión de manchas en la piel del antebrazo',
      estado: 'pendiente',
      adjuntos: [],
      convenio: 'IESS',
      montoPago: 40.00,
      estadoPago: 'pagado',
      calificacion: null,
      notas: '',
      fechaCreacion: '2026-07-11'
    },
    {
      id: 'c003',
      pacienteId: 'p002',
      doctorId: 'd003',
      especialidadId: 'e003',
      fecha: '2026-07-08',
      hora: '08:00',
      motivo: 'Chequeo general anual',
      estado: 'finalizada',
      adjuntos: [],
      convenio: null,
      montoPago: 30.00,
      estadoPago: 'pagado',
      calificacion: 5,
      notas: 'Paciente en buen estado general. Se recomienda aumentar actividad física.',
      fechaCreacion: '2026-07-05'
    },
    {
      id: 'c004',
      pacienteId: 'p001',
      doctorId: 'd003',
      especialidadId: 'e003',
      fecha: '2026-06-20',
      hora: '11:00',
      motivo: 'Fiebre y malestar general',
      estado: 'finalizada',
      adjuntos: [],
      convenio: 'IESS',
      montoPago: 30.00,
      estadoPago: 'pagado',
      calificacion: 4,
      notas: 'Cuadro gripal. Se recetó tratamiento sintomático.',
      fechaCreacion: '2026-06-18'
    }
  ],

  historialClinico: [
    {
      id: 'h001',
      pacienteId: 'p001',
      enfermedadesCronicas: ['Hipertensión arterial'],
      alergias: ['Penicilina'],
      medicamentosActuales: ['Losartán 50mg — 1 vez al día'],
      grupoSanguineo: 'O+',
      peso: '72 kg',
      altura: '1.68 m',
      antecedentesQuirurgicos: ['Apendicectomía (2018)'],
      antecedentesPersonales: 'Paciente con hipertensión controlada desde 2022.',
      antecedentesFamiliares: 'Padre con diabetes tipo 2. Madre con hipertensión.'
    },
    {
      id: 'h002',
      pacienteId: 'p002',
      enfermedadesCronicas: [],
      alergias: [],
      medicamentosActuales: [],
      grupoSanguineo: 'A+',
      peso: '80 kg',
      altura: '1.75 m',
      antecedentesQuirurgicos: [],
      antecedentesPersonales: 'Sin antecedentes de importancia.',
      antecedentesFamiliares: 'Sin antecedentes familiares relevantes.'
    }
  ],

  recetas: [
    {
      id: 'r001',
      citaId: 'c004',
      pacienteId: 'p001',
      doctorId: 'd003',
      fecha: '2026-06-20',
      diagnostico: 'Síndrome gripal',
      medicamentos: [
        { nombre: 'Paracetamol 500mg', dosis: '1 tableta', frecuencia: 'Cada 8 horas', duracion: '5 días' },
        { nombre: 'Loratadina 10mg', dosis: '1 tableta', frecuencia: 'Cada 24 horas', duracion: '5 días' }
      ],
      observaciones: 'Reposo relativo. Hidratación abundante. Consultar si persisten síntomas.',
      firmaDigital: 'Dr. Roberto Pérez — Reg. 0934567890'
    }
  ],

  certificados: [
    {
      id: 'cert001',
      citaId: 'c004',
      pacienteId: 'p001',
      doctorId: 'd003',
      fecha: '2026-06-20',
      tipo: 'Reposo médico',
      contenido: 'Se certifica que el paciente requiere reposo por 3 días debido a cuadro gripal.',
      diasReposo: 3
    }
  ],

  ordenesLaboratorio: [],

  notificaciones: [
    {
      id: 'n001',
      usuarioId: 'u005',
      tipo: 'cita_confirmada',
      mensaje: 'Tu cita con Dr. Andrés García el 14 de julio a las 09:00 ha sido confirmada.',
      leida: false,
      timestamp: '2026-07-10T14:30:00'
    },
    {
      id: 'n002',
      usuarioId: 'u005',
      tipo: 'cita_pendiente',
      mensaje: 'Tu cita con Dra. María López está pendiente de aprobación.',
      leida: false,
      timestamp: '2026-07-11T09:15:00'
    },
    {
      id: 'n003',
      usuarioId: 'u002',
      tipo: 'nueva_cita',
      mensaje: 'Nueva solicitud de cita de Laura Gómez para el 14 de julio a las 09:00.',
      leida: true,
      timestamp: '2026-07-10T14:25:00'
    }
  ],

  pagos: [
    { id: 'pg001', citaId: 'c001', monto: 45.00, estado: 'completado', metodo: 'tarjeta', timestamp: '2026-07-10T14:31:00' },
    { id: 'pg002', citaId: 'c002', monto: 40.00, estado: 'completado', metodo: 'tarjeta', timestamp: '2026-07-11T09:16:00' },
    { id: 'pg003', citaId: 'c003', monto: 30.00, estado: 'completado', metodo: 'efectivo', timestamp: '2026-07-05T11:00:00' },
    { id: 'pg004', citaId: 'c004', monto: 30.00, estado: 'completado', metodo: 'tarjeta', timestamp: '2026-06-18T16:20:00' }
  ]
};

// ── Inicializar base de datos ──
function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
  }
}

function getDB() {
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function resetDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
}

// ── Helpers de datos ──
function getUsuarios() { return getDB().usuarios; }
function getDoctores() { return getDB().doctores; }
function getPacientes() { return getDB().pacientes; }
function getEspecialidades() { return getDB().especialidades; }
function getCitas() { return getDB().citas; }
function getRecetas() { return getDB().recetas; }
function getCertificados() { return getDB().certificados; }
function getOrdenes() { return getDB().ordenesLaboratorio; }
function getNotificaciones() { return getDB().notificaciones; }
function getPagos() { return getDB().pagos; }
function getHistorial() { return getDB().historialClinico; }

function getUserById(id) { return getUsuarios().find(u => u.id === id); }
function getDoctorByUserId(uid) { return getDoctores().find(d => d.usuarioId === uid); }
function getPacienteByUserId(uid) { return getPacientes().find(p => p.usuarioId === uid); }
function getEspecialidadById(id) { return getEspecialidades().find(e => e.id === id); }
function getDoctorById(id) { return getDoctores().find(d => d.id === id); }
function getPacienteById(id) { return getPacientes().find(p => p.id === id); }

function getDoctorNombre(doctorId) {
  const doc = getDoctorById(doctorId);
  if (!doc) return 'Desconocido';
  const user = getUserById(doc.usuarioId);
  return user ? user.nombre : 'Desconocido';
}

function getPacienteNombre(pacienteId) {
  const pac = getPacienteById(pacienteId);
  if (!pac) return 'Desconocido';
  const user = getUserById(pac.usuarioId);
  return user ? user.nombre : 'Desconocido';
}

function generateId(prefix) {
  return prefix + Date.now() + Math.random().toString(36).substr(2, 5);
}

function formatFecha(fechaStr) {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-ES', opciones);
}

function formatFechaCorta(fechaStr) {
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-ES', opciones);
}

function estadoBadge(estado) {
  const clases = {
    pendiente: 'badge-warning',
    aceptada: 'badge-success',
    rechazada: 'badge-danger',
    reprogramada: 'badge-info',
    cancelada: 'badge-secondary',
    'en_curso': 'badge-primary',
    finalizada: 'badge-dark'
  };
  const etiquetas = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    reprogramada: 'Reprogramada',
    cancelada: 'Cancelada',
    'en_curso': 'En curso',
    finalizada: 'Finalizada'
  };
  return `<span class="badge ${clases[estado] || 'badge-secondary'}">${etiquetas[estado] || estado}</span>`;
}

// Actualizar cita
function actualizarCita(citaId, cambios) {
  const db = getDB();
  const idx = db.citas.findIndex(c => c.id === citaId);
  if (idx !== -1) {
    db.citas[idx] = { ...db.citas[idx], ...cambios };
    saveDB(db);
    return true;
  }
  return false;
}

// Agregar notificación
function agregarNotificacion(usuarioId, tipo, mensaje) {
  const db = getDB();
  db.notificaciones.unshift({
    id: generateId('n'),
    usuarioId,
    tipo,
    mensaje,
    leida: false,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
}

// Marcar notificación como leída
function marcarNotificacionLeida(notifId) {
  const db = getDB();
  const idx = db.notificaciones.findIndex(n => n.id === notifId);
  if (idx !== -1) {
    db.notificaciones[idx].leida = true;
    saveDB(db);
  }
}

// Obtener notificaciones no leídas de un usuario
function getNotificacionesNoLeidas(usuarioId) {
  return getNotificaciones().filter(n => n.usuarioId === usuarioId && !n.leida);
}

// Obtener citas de un doctor
function getCitasDoctor(doctorId) {
  return getCitas().filter(c => c.doctorId === doctorId);
}

// Obtener citas de un paciente
function getCitasPaciente(pacienteId) {
  return getCitas().filter(c => c.pacienteId === pacienteId);
}

// Agregar nuevo usuario
function agregarUsuario(usuario) {
  const db = getDB();
  db.usuarios.push(usuario);
  saveDB(db);
}

// Agregar nueva cita
function agregarCita(cita) {
  const db = getDB();
  db.citas.push(cita);
  saveDB(db);
}

// Agregar nuevo paciente
function agregarPaciente(paciente) {
  const db = getDB();
  db.pacientes.push(paciente);
  saveDB(db);
}

// Agregar doctor
function agregarDoctor(doctor) {
  const db = getDB();
  db.doctores.push(doctor);
  saveDB(db);
}

// Actualizar usuario
function actualizarUsuario(userId, cambios) {
  const db = getDB();
  const idx = db.usuarios.findIndex(u => u.id === userId);
  if (idx !== -1) {
    db.usuarios[idx] = { ...db.usuarios[idx], ...cambios };
    saveDB(db);
    return true;
  }
  return false;
}

// Actualizar doctor
function actualizarDoctor(doctorId, cambios) {
  const db = getDB();
  const idx = db.doctores.findIndex(d => d.id === doctorId);
  if (idx !== -1) {
    db.doctores[idx] = { ...db.doctores[idx], ...cambios };
    saveDB(db);
    return true;
  }
  return false;
}

// Agregar receta
function agregarReceta(receta) {
  const db = getDB();
  db.recetas.push(receta);
  saveDB(db);
}

// Agregar certificado
function agregarCertificado(cert) {
  const db = getDB();
  db.certificados.push(cert);
  saveDB(db);
}

// Agregar orden de laboratorio
function agregarOrden(orden) {
  const db = getDB();
  db.ordenesLaboratorio.push(orden);
  saveDB(db);
}

// Agregar pago
function agregarPago(pago) {
  const db = getDB();
  db.pagos.push(pago);
  saveDB(db);
}

// Eliminar usuario (y sus entidades relacionadas)
function eliminarDoctor(doctorId) {
  const db = getDB();
  const doc = db.doctores.find(d => d.id === doctorId);
  if (doc) {
    db.usuarios = db.usuarios.filter(u => u.id !== doc.usuarioId);
    db.doctores = db.doctores.filter(d => d.id !== doctorId);
    saveDB(db);
    return true;
  }
  return false;
}

// Estadísticas para admin
function getEstadisticas() {
  const citas = getCitas();
  const doctores = getDoctores();
  const pacientes = getPacientes();
  const pagos = getPagos();
  return {
    totalPacientes: pacientes.length,
    doctoresActivos: doctores.filter(d => d.estadoAprobacion === 'aprobado').length,
    citasRealizadas: citas.filter(c => c.estado === 'finalizada').length,
    citasPendientes: citas.filter(c => c.estado === 'pendiente').length,
    citasCanceladas: citas.filter(c => c.estado === 'cancelada').length,
    citasHoy: citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length,
    ingresoTotal: pagos.filter(p => p.estado === 'completado').reduce((s, p) => s + p.monto, 0)
  };
}

// Inicializar al cargar
initDB();
