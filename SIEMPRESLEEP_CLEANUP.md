# SiempreSleep — limpieza de producto (SiempreSalud → base Sleep)

Fecha: 2026-08-01  
Estado: base limpia lista para construir SiempreSleep (sin reconstruir aún el producto completo).

## 1. Inventario de funcionalidades

| Área | Funcionalidad | Estado |
|------|---------------|--------|
| Auth | Registro, login, recuperación de contraseña | **Mantener** |
| Usuario | Perfil, preferencias, permisos | **Mantener** |
| Wearable | Ingest `/health/data`, dispositivos, sync | **Mantener** |
| Sueño | sleepData / history / summary | **Mantener** |
| Biometría básica | HR, movimiento/pasos, batería, conexión | **Mantener** |
| Vibraciones / recordatorios | Reminder config | **Mantener** |
| Notificaciones push | Mobile push register | **Mantener** |
| Connect | Contactos autorizados | **Modificar** (Help Button) |
| Ubicación | Solicitud GPS / share | **Modificar** (secundaria, opcional) |
| Botón pulsera | `/panic`, `/watch-button` | **Modificar** → Help / Assistance |
| ECG | Captura + UI | **Ocultar** (flag `EXPERIMENTAL_ECG`) |
| Presión arterial | Captura + UI / alertas | **Ocultar** (flag `EXPERIMENTAL_BP`) |
| Alertas médicas | `/health/alerts` | **Ocultar** (`MEDICAL_ALERTS=false`) |
| Risk analysis IA | `/risk-analysis` | **Ocultar** (`RISK_ANALYSIS=false`) |
| Órdenes / exámenes | Catálogo, carrito, Flow | **Eliminar de UX** (flag `CLINICAL_ORDERS`/`COMMERCE`) |
| Telemedicina / doctor | Calendario, records, copiloto | **Eliminar de UX** (`DOCTOR_PORTAL`) |
| Bitácora clínica | Timeline clínico | **Eliminar de UX** |
| Ciclo / menopausia | Wellness modules | **Ocultar** (`CYCLE_MENOPAUSE`) |
| Deportes / calorías / ranking | Sports tracking UI | **Eliminar / ocultar** (`SPORTS_TRACKING`) |
| Spinoffs Smartrisk | Rutas legacy | **Ocultar** (`LEGACY_SPINOFFS`) |
| Apnea / caídas / 911 | — | No existían o se retiraron de framing |

## 2. Matriz mantener / modificar / ocultar / eliminar

### Mantener
- Auth (`/api/auth`), User profile, JWT
- Health ingest + device history
- Wellness profile (metas sueño, recordatorios)
- Mobile biometrics / habits / push / location-requests (API)
- Logs técnicos (`wellnessLogs`, watch events)

### Modificar
- Navegación web → Dashboard, Sleep, Habits, Reports, Connect, Device, Account
- Panic → Help Button / Request Help / Family Assistance
- Emails de alerta → framing no médico / no 911
- Landing → SiempreSleep
- Hábitos mobile payload → sueño/recuperación

### Ocultar temporalmente (feature flags)
- ECG, BP, medical alerts, risk analysis, sports tracking, clinical orders, doctor portal, commerce, cycle/menopause

### Eliminar de experiencia principal (código retenido detrás de flags)
- Menús de exámenes, telemedicina, bitácora, carrito, “Verifica tu médico”, alertas de pacientes
- Textos “pánico”, “SOS médico”, “medical grade”, diagnóstico

**No se borraron colecciones Mongo ni datos históricos.**

## 3. Plan de cambios ejecutado

1. Feature flags client + server  
2. Nueva shell de navegación Sleep  
3. Rutas legacy gated / redirect  
4. Connect page (help + location)  
5. Device page (biometrics sin ECG/BP/alerts por defecto)  
6. Backend help endpoint + panic alias  
7. Desactivar alertas médicas y risk analysis por defecto  
8. Tests de contrato + script cleanup  
9. Documentación + migración soft alias  

## 4. Archivos afectados (principales)

### Frontend
- `client/src/App.js`
- `client/src/config/featureFlags.js`
- `client/src/components/FeatureGate.jsx`
- `client/src/components/sleep/*`
- `client/src/pages/SiempreSleepLanding.jsx`
- `client/src/pages/sleep/*`
- `client/src/pages/DatosBiometricos.jsx`
- `client/src/components/doctor911/Navbar.jsx` (shim → SleepNavbar)
- `client/src/components/wellness/WellnessModuleLayout.jsx`
- `client/src/utils/helpButton.js`
- `client/src/__tests__/siempresleepCleanup.test.js`
- `client/public/index.html`, `manifest.json`

### Backend
- `server/config/featureFlags.js`
- `server/middleware/featureGate.js`
- `server/routes/health.js`
- `server/routes/mobile.js`
- `server/services/biometricAlertService.js`
- `server/services/emailService.js`
- `server/controllers/wellnessController.js`
- `server/scripts/testSiempreSleepCleanup.js`
- `server/scripts/migrateHelpButtonAliases.js`
- `.env.example`

## 5. Migraciones

| Script | Efecto | Destructivo |
|--------|--------|-------------|
| `migrateHelpButtonAliases.js` | Copia `panicAlertContacts` → `helpContacts` | No (dry-run por defecto) |

Logs históricos `panic_alert` se conservan; nuevos eventos usan `help_request` (+ `legacyType`).

## 6. Feature flags

| Flag | Default | Uso |
|------|---------|-----|
| CLINICAL_ORDERS | false | Órdenes / bitácora / programas |
| DOCTOR_PORTAL | false | Doctor / telemedicina |
| COMMERCE | false | Cart / checkout |
| CYCLE_MENOPAUSE | false | Ciclo / menopausia |
| EXPERIMENTAL_ECG | false | UI ECG |
| EXPERIMENTAL_BP | false | UI / alertas PA |
| MEDICAL_ALERTS | false | `/health/alerts` |
| RISK_ANALYSIS | false | Risk IA |
| SPORTS_TRACKING | false | Sesiones ejercicio GPS |
| OPTIONAL_LOCATION | true | Connect location |
| HELP_BUTTON | true | Assistance Request |
| LEGACY_PANIC_ALIAS | true | `/mobile/panic` APK |

Client: `REACT_APP_FF_<NAME>`  
Server: `FF_<NAME>`

## 7. Riesgos técnicos

- **APK Android** no está en el repo: sigue pudiendo llamar `/panic` (alias activo).
- **Device UI** (`DatosBiometricos`) sigue siendo grande; se gated UI, no se reescribió por completo.
- **Health `/devices`** lista todos los dispositivos (comportamiento previo); filtrado por usuario queda pendiente.
- **Schema `helpContacts`**: alias en memoria/migración; campo flexible en wellnessProfile.
- Activar `CLINICAL_ORDERS` reactiva comercio médico legacy.

## 8. Dependencias eliminadas

Ninguna dependencia npm eliminada en esta etapa (evita romper builds). Código clínico permanece importable tras flags.

## 9. Pendientes antes de construir SiempreSleep

1. App móvil nativa: renombrar SOS → Help en UI (sources fuera de repo).
2. Insights reales (Reports hoy es placeholder).
3. Today dashboard con series de sueño propias.
4. Filtrado de dispositivos por usuario autenticado.
5. Rebrand assets (logo SiempreSleep).
6. Retirar o archivar docs de exámenes médicos cuando el producto Sleep esté vivo.
7. E2E browser tests de redirects.
8. Decidir destino de datos Order/Payment (retención legal).

## 10. Navegación objetivo

**Web:** Dashboard · Sleep History · Habits · Reports · Connect · Device · Account  

**Mobile:** código en `/Users/mnacbook/dev/siempresleep-android` — ver `SIEMPRESLEEP_ANDROID_CLEANUP.md`  
Tabs: Today · Sleep · Habits · Connect · Device · Profile  
(bridge web `androidRoute`: `habitos`→`/habits`, `wellness`→`/dashboard`)
