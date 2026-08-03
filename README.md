# Siempresalud - Plataforma de Servicios Médicos

Una aplicación full-stack MERN que proporciona acceso rápido y accesible a órdenes médicas y telemedicina con cobertura nacional 24/7.

## 🎯 Características Principales

### Core Features
- **Gestión de Usuarios**: Registro rápido de 2 minutos con perfil personal
- **Bitácora Personal**: Historial completo de órdenes médicas y citas de telemedicina
- **Órdenes Médicas**: Sistema rápido y accesible para exámenes preventivos (PAP, tiroides, hipertensión, mamografía)
- **Telemedicina**: Sistema de agendamiento para consultas médicas remotas
- **Órdenes Personalizadas**: Capacidad de solicitar órdenes médicas personalizadas
- **Seguridad**: Integración con pasarelas de pago seguras y protocolos de protección de datos

### Frontend (React)
- **Landing Page** con secciones:
  - Hero Section destacando a Roberto Merino (Fundador & CEO, Universidad Católica)
  - "Cómo Funciona" (3 pasos)
  - Slider de Testimonios
  - Footer completo con enlaces legales
- **UI Profesional**: Diseño médico con paleta de colores limpia (azules/blancos médicos)
- **Responsive**: Diseño optimizado para móviles y áreas rurales con baja conectividad

### Backend (Node.js, Express, MongoDB)
- **Schemas**:
  - User: nombre, email, contraseña, bitácora
  - Order: tipo de examen, fecha, estado, enlaces PDF
  - Appointment: fecha, hora, estado, tipo de consulta
- **API Routes**:
  - `POST /api/auth/register` - Registro de usuario
  - `POST /api/auth/login` - Inicio de sesión
  - `GET /api/user/bitacora` - Obtener historial personal
  - `POST /api/orders/create` - Crear orden médica
  - `POST /api/appointments/create` - Agendar cita de telemedicina

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd doctor911
   ```

2. **Instalar dependencias**
   ```bash
   # Instalar dependencias de todos los proyectos
   npm run install:all
   
   # O instalar por separado:
   npm install                    # Dependencias de la raíz
   cd server && npm install       # Dependencias del backend
   cd ../client && npm install    # Dependencias del frontend
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   MONGO_URL=mongodb://localhost:27017/siempresalud
   JWT_SECRET=tu_secret_key_segura_aqui
   PORT=5000
   NODE_ENV=development
   REACT_APP_BASE_URL=http://localhost:5000
   ```

4. **Iniciar el servidor de desarrollo**
   
   Para ejecutar tanto el backend como el frontend simultáneamente:
   ```bash
   npm run dev
   ```
   
   O ejecutar por separado:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

5. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Estructura del Proyecto

```
doctor911/
├── server/                   # Backend (Node.js/Express)
│   ├── server.js            # Servidor Express principal
│   ├── start-server.js      # Script de inicio del servidor
│   ├── models/              # Modelos de MongoDB
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Appointment.js
│   ├── routes/              # Rutas de API
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── orders.js
│   │   └── appointments.js
│   ├── middleware/          # Middleware personalizado
│   │   └── auth.js
│   └── package.json         # Dependencias del backend
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   └── doctor911/    # Componentes específicos de Doctor911
│   │   │       ├── Navbar.jsx
│   │   │       ├── HeroSection.jsx
│   │   │       ├── HowItWorks.jsx
│   │   │       ├── TestimonialsSlider.jsx
│   │   │       └── SaludSimpleFooter.jsx
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── Doctor911Landing.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Bitacora.jsx
│   │   │   └── ...
│   │   └── App.js           # Componente principal de React
│   ├── public/              # Archivos estáticos
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json         # Dependencias del frontend
├── .env                     # Variables de entorno
└── package.json             # Scripts para manejar ambos proyectos
```

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens se almacenan en `localStorage` del navegador.

### Flujo de Autenticación
1. Usuario se registra o inicia sesión
2. El servidor genera un JWT token
3. El token se almacena en `localStorage`
4. Las solicitudes autenticadas incluyen el token en el header: `Authorization: Bearer <token>`

## 📊 Base de Datos

### Esquemas MongoDB

**User**
- name: String
- email: String (único)
- password: String (hasheado con bcrypt)
- bitacora: Array de referencias a órdenes y citas
- createdAt: Date

**Order**
- userId: ObjectId (referencia a User)
- type: String (PAP, thyroid, hypertension, mammography, custom)
- examName: String
- status: String (pending, processing, completed, cancelled)
- orderDate: Date
- pdfLink: String
- digitalDownloadLink: String
- notes: String

**Appointment**
- userId: ObjectId (referencia a User)
- doctorName: String
- appointmentDate: Date
- appointmentTime: String
- status: String (scheduled, completed, cancelled, no-show)
- consultationType: String (general, specialist, follow-up)
- meetingLink: String
- notes: String

## 🛠️ Scripts Disponibles

### Desde la raíz del proyecto:
- `npm run install:all` - Instala dependencias de todos los proyectos
- `npm run server` - Inicia el servidor backend (puerto 5000)
- `npm run client` - Inicia el servidor frontend (puerto 3000)
- `npm run dev` - Inicia ambos servidores simultáneamente
- `npm run build` - Construye la aplicación frontend para producción
- `npm test` - Ejecuta las pruebas del frontend

### Desde server/:
- `npm start` - Inicia el servidor Express

### Desde client/:
- `npm start` - Inicia el servidor de desarrollo de React
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas

## 🌐 Páginas y Rutas

- `/` - Landing page principal
- `/register` - Registro de usuario (2 minutos)
- `/login` - Inicio de sesión
- `/bitacora` - Bitácora personal (requiere autenticación)
- `/servicios` - Servicios (órdenes médicas y telemedicina)
- `/contacto` - Formulario de contacto
- `/noticias` - Noticias y actualizaciones
- `/preguntas-frecuentes` - FAQ
- `/terminos-y-condiciones` - Términos y condiciones
- `/privacidad` - Política de privacidad

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT tokens para autenticación
- Validación de datos en backend
- Protección de rutas con middleware de autenticación
- Variables de entorno para información sensible

## 📝 Notas de Desarrollo

### Próximas Mejoras
- Integración completa de pasarelas de pago (Webpay, Stripe)
- Sistema de notificaciones por email
- Generación automática de PDFs para órdenes médicas
- Integración con sistemas de videollamada para telemedicina
- Panel de administración
- Sistema de calificaciones y reseñas

### Cumplimiento Legal
- La aplicación incluye placeholders para páginas legales
- Se recomienda consultar con un abogado para el contenido legal final

## 👥 Contribución

Este es un proyecto de Siempresalud. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es Siempresalud. Verificar términos de uso y licencias antes de uso comercial.

## 👨‍⚕️ Créditos

- **Fundador**: Roberto Merino (Universidad Católica)
- **Plataforma**: Siempresalud
- **Desarrollo**: MERN Stack Application

## 📞 Contacto

Para preguntas o soporte:
- Email: contacto@unbiax.com
- Website: [Siempresalud](https://siempresalud.cl)

---

**Nota**: Esta es una aplicación de demostración. Para uso en producción, asegúrese de:
- Configurar variables de entorno seguras
- Implementar pasarelas de pago reales
- Verificar cumplimiento legal completo
- Configurar backups de base de datos
- Implementar monitoreo y logging

# simplesleep
