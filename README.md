# 🏥 TeleMed — Plataforma Web de Telemedicina

Sistema web completo para gestión de citas médicas y teleconsultas, desarrollado con HTML5, CSS y JavaScript vanilla.

---

## 🌐 Demo en vivo (Producción)

Puedes probar el proyecto desplegado en Vercel aquí:
👉 **[https://veris-five.vercel.app](https://veris-five.vercel.app)**

---

## 🚀 Cómo abrir el proyecto localmente

1. **Navega** a la carpeta `Proyecto veris`
2. **Abre** el archivo `index.html` en tu navegador (Chrome, Firefox o Edge actualizados)
3. **¡Listo!** No necesitas instalar nada ni usar un servidor

> 💡 **Recomendado:** Usa la extensión **"Live Server"** en VS Code para mejor experiencia, o simplemente doble-clic en `index.html`

---

## 🔑 Cuentas de demostración

| Rol | Correo | Contraseña |
|-----|--------|------------|
| 👨‍💼 Administrador | admin@clinica.com | admin123 |
| 👨‍⚕️ Doctor (Cardiólogo) | dr.garcia@clinica.com | doctor123 |
| 👩‍⚕️ Doctora (Dermatologa) | dra.lopez@clinica.com | doctor123 |
| 🧑 Paciente | paciente@email.com | paciente123 |

> También puedes registrarte como **nuevo paciente** desde la pantalla de inicio.

---

## 📁 Estructura del proyecto

```
Proyecto veris/
├── index.html              ← Landing + Login + Registro
├── dashboard-admin.html    ← Panel Administrador
├── dashboard-doctor.html   ← Panel Doctor
├── dashboard-paciente.html ← Panel Paciente
├── agendar-cita.html       ← Flujo de agendamiento (5 pasos)
├── videoconsulta.html      ← Sala de videoconsulta integrada
├── css/
│   ├── main.css            ← Sistema de diseño global (dark mode)
│   └── auth.css            ← Estilos página de login
├── js/
│   ├── data.js             ← Base de datos en LocalStorage + helpers
│   ├── auth.js             ← Autenticación, sesión, modales, toasts
│   ├── chatbot.js          ← Chatbot flotante MediBot
│   ├── admin.js            ← Lógica panel administrador
│   ├── doctor.js           ← Lógica panel doctor
│   └── paciente.js         ← Lógica panel paciente
└── SRS_Plataforma_Telemedicina.md
```

---

## ✅ Funcionalidades implementadas

### 🔐 Autenticación
- Login con 3 roles (Admin, Doctor, Paciente)
- Registro de nuevos pacientes
- Recuperación de contraseña (OTP por WhatsApp - simulado)
- Cierre de sesión automático por inactividad (30 min)

### 👨‍💼 Administrador
- Dashboard con KPIs (pacientes, doctores, citas, ingresos)
- CRUD completo de doctores
- CRUD de especialidades médicas
- Gestión de pacientes (activar/desactivar)
- Vista de todas las citas con filtros
- Gestión de pagos con totales
- Centro de notificaciones

### 👨‍⚕️ Doctor
- Agenda de citas (activas, hoy, todas)
- Gestión de solicitudes (aceptar, rechazar, reprogramar)
- Ver historial clínico del paciente
- Emitir receta médica con medicamentos
- Emitir certificado médico
- Generar orden de laboratorio
- Configurar horarios disponibles
- Editar perfil profesional
- Iniciar videoconsulta

### 🧑 Paciente
- Ver citas con estados y acciones
- Agendar cita (5 pasos: especialidad → doctor → fecha → motivo → pago)
- Aceptar/rechazar reprogramaciones
- Conectarse a la videoconsulta
- Calificar la atención
- Historial médico completo
- Descargar recetas, certificados y órdenes (PDF preview)
- Gestión de perfil personal

### 📹 Videoconsulta
- Sala integrada (WebRTC simulado)
- Controles: micrófono, cámara, compartir pantalla
- Timer de duración en tiempo real
- Chat de texto integrado
- Panel de info del paciente/doctor
- Indicador de calidad de conexión

### 🤖 Chatbot MediBot
- Disponible en todas las páginas
- Responde preguntas frecuentes
- Muestra especialidades y horarios
- Derivación a WhatsApp Business
- **No realiza diagnósticos médicos** (cumple SRS RF-56)

---

## 🎨 Diseño

- **Modo oscuro** profesional con paleta médica azul
- **Responsive** para desktop, tablet y móvil
- Fuentes: Inter + Outfit (Google Fonts)
- Animaciones y transiciones suaves
- Glassmorphism en elementos clave

---

## 📋 Basado en SRS
Este proyecto fue desarrollado siguiendo el documento `SRS_Plataforma_Telemedicina.md` (versión 1.0 — julio 2026).
