// ============================================================
// chatbot.js — Chatbot flotante para la plataforma Telemedicina
// ============================================================

const CHATBOT_RESPONSES = {
  inicio: {
    texto: '¡Hola! Soy MediBot 🤖, el asistente virtual de TeleMed.\n¿En qué puedo ayudarte hoy?',
    opciones: ['📅 Agendar una cita', '👨‍⚕️ Ver especialidades', '🕐 Horarios de atención', '💳 Información de pagos', '❓ Preguntas frecuentes', '🧑‍💼 Hablar con un asesor']
  },
  especialidades: {
    texto: 'Contamos con las siguientes especialidades médicas:',
    opciones: ['← Volver al inicio']
  },
  horarios: {
    texto: 'Nuestros horarios de atención son:\n\n🗓️ Lunes a Viernes: 7:00 am – 7:00 pm\n🗓️ Sábados: 8:00 am – 12:00 pm\n🗓️ Domingos: No disponible\n\nLas videoconsultas están disponibles dentro de esos horarios, según la disponibilidad de cada médico.',
    opciones: ['📅 Agendar cita ahora', '← Volver al inicio']
  },
  pagos: {
    texto: 'Aceptamos los siguientes métodos de pago:\n\n💳 Tarjeta de crédito/débito (Visa, Mastercard)\n🏦 Transferencia bancaria\n💵 Depósito en efectivo\n\nEl pago se realiza al confirmar la cita. Tienes 30 minutos para completarlo.',
    opciones: ['📅 Agendar cita', '← Volver al inicio']
  },
  faq: {
    texto: 'Preguntas frecuentes:',
    opciones: ['¿Cómo agendo una cita?', '¿Qué necesito para la videoconsulta?', '¿Puedo cancelar mi cita?', '← Volver al inicio']
  },
  faq_agendar: {
    texto: '📋 Para agendar una cita:\n\n1. Regístrate o inicia sesión como Paciente\n2. Haz clic en "Agendar cita"\n3. Selecciona la especialidad y médico\n4. Elige fecha y horario disponible\n5. Ingresa el motivo de tu consulta\n6. Confirma con el pago en línea\n\n¡Así de fácil!',
    opciones: ['📅 Ir a agendar', '← Volver a FAQ']
  },
  faq_video: {
    texto: '💻 Para la videoconsulta necesitas:\n\n✅ Cámara web funcional\n✅ Micrófono\n✅ Conexión a internet estable\n✅ Navegador actualizado (Chrome, Firefox, Edge)\n\n⚠️ No necesitas instalar ninguna aplicación. La videollamada corre dentro de nuestra plataforma.',
    opciones: ['📅 Agendar cita', '← Volver a FAQ']
  },
  faq_cancelar: {
    texto: '❌ Política de cancelación:\n\nPuedes cancelar tu cita hasta 2 horas antes del horario agendado sin costo.\n\nSi cancelas con menos de 2 horas de anticipación, puede aplicar una penalización según el médico seleccionado.\n\nContacta a nuestro equipo para más información.',
    opciones: ['🧑‍💼 Hablar con un asesor', '← Volver a FAQ']
  },
  asesor: {
    texto: '¡Con gusto te conectamos con un asesor humano!\n\n📱 WhatsApp: +593 99 000 0000\n\nHaz clic en el enlace para abrir WhatsApp Business y un asesor te atenderá en breve.\n\n⚠️ Recordatorio: Este chatbot no realiza diagnósticos médicos. Siempre consulta con un profesional.',
    opciones: ['← Volver al inicio']
  },
  agendar: {
    texto: '¡Perfecto! Para agendar tu cita, inicia sesión en tu cuenta de paciente y usa el botón "Agendar cita" en tu dashboard.',
    opciones: ['← Volver al inicio']
  }
};

function initChatbot() {
  // Verificar si ya existe
  if (document.getElementById('chatbot-fab')) return;

  // Crear FAB
  const fab = document.createElement('button');
  fab.id = 'chatbot-fab';
  fab.className = 'chatbot-fab';
  fab.innerHTML = '🤖';
  fab.title = 'Asistente MediBot';
  fab.onclick = toggleChatbot;

  // Crear ventana
  const win = document.createElement('div');
  win.id = 'chatbot-window';
  win.className = 'chatbot-window';
  win.innerHTML = `
    <div class="chatbot-header">
      <div class="avatar" style="background:rgba(255,255,255,0.2); font-size:1.2rem;">🤖</div>
      <div class="chatbot-header-info">
        <h4>MediBot</h4>
        <p>● En línea</p>
      </div>
      <button onclick="toggleChatbot()" style="margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.2rem;cursor:pointer;">✕</button>
    </div>
    <div class="chatbot-body" id="chatbot-body"></div>
    <div class="chatbot-input-area">
      <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Escribe tu pregunta..." onkeypress="chatbotKeyPress(event)">
      <button class="chatbot-send" onclick="sendChatMessage()">➤</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(win);

  // Mensaje inicial
  setTimeout(() => {
    addBotMessage(CHATBOT_RESPONSES.inicio.texto, CHATBOT_RESPONSES.inicio.opciones);
  }, 500);
}

function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  win.classList.toggle('open');
  if (win.classList.contains('open')) {
    document.getElementById('chatbot-input').focus();
  }
}

function addBotMessage(texto, opciones = []) {
  const body = document.getElementById('chatbot-body');

  const msg = document.createElement('div');
  msg.className = 'chat-msg bot';
  msg.style.whiteSpace = 'pre-line';

  // Si hay texto de especialidades, agregarlo dinámicamente
  if (texto.includes('especialidades médicas')) {
    const esp = getEspecialidades ? getEspecialidades() : [];
    const lista = esp.map(e => `${e.icono} ${e.nombre}`).join('\n');
    texto += '\n\n' + lista;
  }

  msg.textContent = texto;
  body.appendChild(msg);

  if (opciones.length > 0) {
    const optContainer = document.createElement('div');
    optContainer.className = 'chat-options';
    opciones.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option';
      btn.textContent = opt;
      btn.onclick = () => handleChatOption(opt);
      optContainer.appendChild(btn);
    });
    body.appendChild(optContainer);
  }

  body.scrollTop = body.scrollHeight;
}

function addUserMessage(texto) {
  const body = document.getElementById('chatbot-body');
  const msg = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.textContent = texto;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

function handleChatOption(opcion) {
  addUserMessage(opcion);

  setTimeout(() => {
    const opt = opcion.toLowerCase();

    if (opt.includes('agendar') || opt.includes('ir a agendar')) {
      addBotMessage(CHATBOT_RESPONSES.agendar.texto, CHATBOT_RESPONSES.agendar.opciones);
    } else if (opt.includes('especialidades')) {
      addBotMessage(CHATBOT_RESPONSES.especialidades.texto, CHATBOT_RESPONSES.especialidades.opciones);
    } else if (opt.includes('horarios')) {
      addBotMessage(CHATBOT_RESPONSES.horarios.texto, CHATBOT_RESPONSES.horarios.opciones);
    } else if (opt.includes('pagos') || opt.includes('información de pago')) {
      addBotMessage(CHATBOT_RESPONSES.pagos.texto, CHATBOT_RESPONSES.pagos.opciones);
    } else if (opt.includes('preguntas frecuentes') || opt.includes('faq')) {
      addBotMessage(CHATBOT_RESPONSES.faq.texto, CHATBOT_RESPONSES.faq.opciones);
    } else if (opt.includes('cómo agendo')) {
      addBotMessage(CHATBOT_RESPONSES.faq_agendar.texto, CHATBOT_RESPONSES.faq_agendar.opciones);
    } else if (opt.includes('videoconsulta') || opt.includes('qué necesito')) {
      addBotMessage(CHATBOT_RESPONSES.faq_video.texto, CHATBOT_RESPONSES.faq_video.opciones);
    } else if (opt.includes('cancelar')) {
      addBotMessage(CHATBOT_RESPONSES.faq_cancelar.texto, CHATBOT_RESPONSES.faq_cancelar.opciones);
    } else if (opt.includes('asesor') || opt.includes('hablar')) {
      addBotMessage(CHATBOT_RESPONSES.asesor.texto, CHATBOT_RESPONSES.asesor.opciones);
      // Abrir WhatsApp
      setTimeout(() => {
        window.open('https://wa.me/593990000000?text=Hola,%20necesito%20ayuda%20con%20TeleMed', '_blank');
      }, 1500);
    } else if (opt.includes('inicio') || opt.includes('volver')) {
      addBotMessage(CHATBOT_RESPONSES.inicio.texto, CHATBOT_RESPONSES.inicio.opciones);
    } else if (opt.includes('volver a faq')) {
      addBotMessage(CHATBOT_RESPONSES.faq.texto, CHATBOT_RESPONSES.faq.opciones);
    } else {
      addBotMessage('Entiendo tu consulta. Por favor selecciona una de las opciones disponibles o contáctanos por WhatsApp para asistencia personalizada.', ['← Volver al inicio', '🧑‍💼 Hablar con un asesor']);
    }
  }, 400);
}

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const texto = input.value.trim();
  if (!texto) return;

  addUserMessage(texto);
  input.value = '';

  // Análisis simple de palabras clave
  setTimeout(() => {
    const t = texto.toLowerCase();
    if (t.includes('cita') || t.includes('agendar') || t.includes('turno')) {
      addBotMessage(CHATBOT_RESPONSES.agendar.texto, CHATBOT_RESPONSES.agendar.opciones);
    } else if (t.includes('especialidad') || t.includes('doctor') || t.includes('médico')) {
      addBotMessage(CHATBOT_RESPONSES.especialidades.texto, CHATBOT_RESPONSES.especialidades.opciones);
    } else if (t.includes('horario') || t.includes('cuando') || t.includes('cuándo')) {
      addBotMessage(CHATBOT_RESPONSES.horarios.texto, CHATBOT_RESPONSES.horarios.opciones);
    } else if (t.includes('pago') || t.includes('precio') || t.includes('costo') || t.includes('cobro')) {
      addBotMessage(CHATBOT_RESPONSES.pagos.texto, CHATBOT_RESPONSES.pagos.opciones);
    } else if (t.includes('cancelar') || t.includes('anular')) {
      addBotMessage(CHATBOT_RESPONSES.faq_cancelar.texto, CHATBOT_RESPONSES.faq_cancelar.opciones);
    } else if (t.includes('whatsapp') || t.includes('asesor') || t.includes('humano') || t.includes('persona')) {
      addBotMessage(CHATBOT_RESPONSES.asesor.texto, CHATBOT_RESPONSES.asesor.opciones);
    } else if (t.includes('video') || t.includes('consulta') || t.includes('llamada')) {
      addBotMessage(CHATBOT_RESPONSES.faq_video.texto, CHATBOT_RESPONSES.faq_video.opciones);
    } else if (t.includes('hola') || t.includes('buenas') || t.includes('buenos') || t.includes('inicio')) {
      addBotMessage(CHATBOT_RESPONSES.inicio.texto, CHATBOT_RESPONSES.inicio.opciones);
    } else {
      addBotMessage(
        'No encontré información específica sobre eso. Recuerda que soy un asistente automatizado y no puedo realizar diagnósticos médicos. ¿Te ayudo con algo más?',
        ['📅 Agendar una cita', '🧑‍💼 Hablar con un asesor', '← Volver al inicio']
      );
    }
  }, 500);
}

function chatbotKeyPress(event) {
  if (event.key === 'Enter') sendChatMessage();
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initChatbot, 300);
});
