# 📚 Documentación Técnica y de Usuario - VERIS (TeleMed)

Esta documentación describe en detalle la estructura, arquitectura y flujos de la plataforma de telemedicina VERIS.

---

## 1. 🎯 Introducción y Objetivos del Sistema
VERIS (TeleMed) es una plataforma web orientada a gestionar citas médicas, administrar perfiles de doctores y pacientes, y realizar videoconsultas en tiempo real. 
El objetivo principal es digitalizar y centralizar el flujo de atención médica remota en una clínica u hospital, brindando interfaces personalizadas para cada rol involucrado.

---

## 2. 🏛 Arquitectura y Tecnologías
El sistema está construido como una aplicación "Serverless" o de **Cliente Robusto (Frontend-only)** para fines de demostración, utilizando las siguientes tecnologías:

- **HTML5:** Estructura semántica de las páginas.
- **CSS3 (Vanilla):** Sistema de diseño propio, paleta de colores médicos (azules), modo oscuro por defecto (Dark Mode) y variables CSS (Custom Properties) para fácil escalabilidad. Uso intensivo de Flexbox y CSS Grid.
- **JavaScript (ES6+):** Toda la lógica de negocio, enrutamiento, validación de formularios y simulación de base de datos.
- **Almacenamiento Local (LocalStorage):** Se utiliza como base de datos local no relacional para persistir: usuarios, citas, doctores, especialidades, notificaciones y configuraciones.

---

## 3. 👥 Roles y Manual de Usuario

El sistema divide el acceso y las responsabilidades en tres roles principales:

### 3.1 👨‍💼 Administrador
Es el encargado de gestionar la plataforma.
- **Dashboard Principal:** Visualiza KPIs globales (Pacientes totales, Citas del mes, Doctores activos, Ingresos).
- **Gestión Médica:** Puede agregar, editar o eliminar Especialidades y Doctores.
- **Gestión de Pacientes:** Visualiza los pacientes registrados y puede bloquearlos o activarlos.
- **Monitor de Citas y Finanzas:** Revisa todas las transacciones y citas agendadas de forma global.

### 3.2 👨‍⚕️ Doctor
El profesional de la salud que atiende a los pacientes.
- **Agenda:** Ve sus citas programadas para el día y las próximas.
- **Gestión de Solicitudes:** Puede aceptar o rechazar solicitudes de citas nuevas, o reprogramarlas.
- **Atención (Videoconsulta):** Accede a una sala virtual con el paciente.
- **Historial Clínico:** Durante y después de la cita, puede emitir Recetas Médicas, Certificados y Órdenes de Laboratorio, los cuales quedan guardados en el perfil del paciente.
- **Configuración:** Puede ajustar sus días y horas de disponibilidad.

### 3.3 🧑 Paciente
El usuario final que busca atención médica.
- **Portal de Agendamiento (Flujo de 5 pasos):** 
  1. Elige especialidad.
  2. Selecciona al doctor disponible.
  3. Escoge fecha y hora.
  4. Ingresa el motivo de consulta.
  5. Realiza el pago simulado.
- **Mis Citas:** Revisa el estado de sus citas (Pendiente, Confirmada, Completada, Cancelada). Puede aceptar reprogramaciones hechas por el doctor.
- **Historial Médico:** Puede descargar en formato PDF (simulado) las recetas, órdenes y certificados que el doctor le haya emitido.
- **Sala de Espera y Consulta:** Accede al módulo de videoconsulta a la hora acordada.

---

## 4. 🔄 Flujos Principales

### 4.1 Flujo de Agendamiento de Cita
1. El paciente inicia sesión.
2. Hace clic en "Agendar Cita".
3. Navega por el Wizard (asistente) eligiendo opciones.
4. El sistema guarda la cita en LocalStorage con estado `pendiente`.
5. El doctor respectivo recibe una notificación y la cita aparece en sus "Solicitudes".
6. El doctor hace clic en "Aceptar". El estado cambia a `confirmada`.
7. El paciente es notificado y se habilita el botón para unirse a la videoconsulta cuando llegue la fecha.

### 4.2 Flujo de Videoconsulta
1. Tanto doctor como paciente hacen clic en "Unirse" desde sus respectivos paneles.
2. Son dirigidos a `videoconsulta.html`.
3. El sistema carga la interfaz con simulación de WebRTC (Cámara, Micrófono, Pantalla Compartida).
4. El panel derecho muestra los datos médicos para el doctor (y el chat para ambos).
5. Al finalizar, el doctor puede calificar y emitir recetas.

---

## 5. 🗄 Estructura de Datos (LocalStorage)
Al iniciar la aplicación, si el LocalStorage está vacío, `data.js` lo puebla con los siguientes objetos clave:

- `veris_users`: Array de objetos de usuarios (credenciales, rol, datos personales).
- `veris_doctors`: Array con información detallada de los doctores (especialidad, horario, tarifa).
- `veris_specialties`: Array con las especialidades disponibles y sus descripciones.
- `veris_appointments`: Array central donde se guardan todas las citas, vinculando el ID del paciente, ID del doctor, fecha, hora, estado, documentos médicos y retroalimentación.
- `veris_notifications`: Notificaciones de sistema para cada usuario.

---

## 6. 🚀 Despliegue e Instalación
Al ser un proyecto estático:
1. Clonar el repositorio.
2. Abrir la carpeta raíz.
3. Ejecutar un servidor local (Ej: `npx http-server`, `python -m http.server`, o "Live Server" de VS Code).
4. Navegar a `http://localhost:<puerto>`.
5. Usar las cuentas de demostración indicadas en el `README.md` para probar los roles.
