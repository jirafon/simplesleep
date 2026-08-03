# SiempreSleep — Arquitectura de producto (Fase 1 MVP)

## Promesa

> Other wearables tell you how you slept. SiempreSleep helps you discover what to change tonight.

## Principios

1. Bienestar y hábitos — nunca diagnóstico médico.
2. Comparar al usuario consigo mismo (línea base personal).
3. Cada pantalla termina en una acción concreta.
4. Máximo 5 secciones principales en móvil.
5. Reutilizar auth, HealthData, sync BLE y Connect existentes.

## Navegación

| Móvil | Web |
|-------|-----|
| Today | Dashboard |
| Sleep | Sleep History |
| Improve | Habits + Experiments (F2) |
| Insights | Insights + Reports |
| Connect | Connect |
| Profile (settings) | Device + Account |

## Fase 1 (este entregable)

- Onboarding por etapas (skippable)
- Today + Sleep Score v1
- Sleep History
- Morning / Evening check-in
- Habit reminders (API + UI; sync vibración vía wellness existente)
- Weekly Report
- Connect básico (ya existe)
- Feature flags
- Demo seed

## Fase 2 / 3

Ver backlog en sección inferior. Experiments e Insights correlacionales completos en F2.

## Sleep Score v1 — fórmula

```
score = 100
  - durationPenalty      (0–25)   # vs meta personal
  - regularityPenalty    (0–20)   # vs bedtime promedio 14d
  - continuityPenalty    (0–20)   # despertares / awake minutes
  - bedtimePenalty       (0–15)   # distancia a hora objetivo
  - hrNightPenalty       (0–10)   # FC noche vs baseline (si hay datos)
  - subjectiveAdjust     (−10…+10) # morning check-in

clamp(0, 100)
algorithmVersion = "sleep-score-v1"
```

Pesos configurables en `Settings` key `sleepScoreWeights`.

## Modelo de datos (Mongo)

| Entidad | Colección / ubicación |
|---------|----------------------|
| Users | `healthusers` (existente) + `sleepProfile` |
| HealthData / SleepSessions | `healthdatas` (existente, sleepData) |
| DailyCheckIns | `dailycheckins` (nueva) |
| SleepScoreSnapshots | embebidos en check-in / o `sleepscores` |
| Reminders | `wellnessProfile.reminders` (existente) |
| WeeklyReports | `weeklyreports` (nueva) |
| AuthorizedContacts / Help | existente (`panicAlertContacts` / help) |
| FeatureFlags | env + Settings |

## APIs v1

Prefijo: `/api/sleep/v1`

- `GET/PUT /onboarding`
- `GET /today`
- `GET /history`
- `POST /checkins/morning`
- `POST /checkins/evening`
- `GET /checkins?from=&to=`
- `GET /score/:date`
- `GET /report/weekly`
- `GET/PUT /reminders` → proxy wellness
- `GET /experiments` → stub F2

## Feature flags

| Flag | Default |
|------|---------|
| SLEEP_MVP | true |
| SLEEP_EXPERIMENTS | true (Fase 2) |
| SLEEP_INSIGHTS_ENGINE | true (Fase 2) |
| EXPERIMENTAL_ECG/BP | false |
| HELP_BUTTON | true |

## APIs v1 (Fase 2 extras)

- `GET /insights`
- `GET /experiments`
- `POST /experiments/start` `{ experimentId }`
- `POST /experiments/:id/log` `{ completed, notes?, dateKey? }`
- `POST /experiments/:id/complete` `{ abandon? }`

## Backlog priorizado

### Fase 1 (hecho en código)
- [x] Onboarding por etapas
- [x] Today + Sleep Score v1
- [x] Sleep History
- [x] Morning / Evening check-in
- [x] Weekly report
- [x] Reminders link + Connect
- [x] Feature flags SLEEP_*
- [x] Tests fórmula + demo seed

### Fase 2 (hecho en código)
- [x] Sleep Experiments completos + cumplimiento
- [x] Insights correlacionales con mínimo de datos
- [x] Weekly report con associations + experimento activo
- [x] Android nav Today/Sleep/Improve/Insights/Connect + SleepApi
- [ ] Programas guiados 7/14/30 días
- [ ] Suscripción

### Fase 3
- [ ] Voz / foto comida experimental
- [ ] PDF export
- [ ] Portal familiar ampliado
- [ ] Integraciones

## Historias de usuario (F1) — criterios de aceptación

**US1 — Today**  
Como usuaria, veo Sleep Score, horas, interrupciones, explicación y una acción para esta noche.  
AC: score 0–100; factores visibles; sin lenguaje diagnóstico.

**US2 — Morning check-in**  
Completo feeling + eventos nocturnos en menos de 10s.  
AC: POST `/checkins/morning` actualiza score con factor subjetivo.

**US3 — Evening check-in**  
Registro café/alcohol/cena/estrés/pantallas sin calorías.  
AC: datos en DailyCheckIn; UI por botones.

**US4 — Onboarding**  
Elijo objetivo y horarios; puedo saltar.  
AC: `sleepProfile` persistido; Today muestra banner si incompleto.

## Despliegue

```bash
# API
cd server && npm run test:sleep-score && npm run seed:sleep-demo
npm start

# Web
cd client && npm test -- --watchAll=false && npm run build
```

Demo: `demo.sleep@siempresleep.local` / `demo1234` (tras seed).

## Wireframes descriptivos

1. **Today** — score grande centrado → 4 stats → card oscura explicación+acción → check-ins.
2. **Improve** — tabs Morning | Evening | Reminders | Experiments(stub).
3. **Sleep** — tabla noches + score.
4. **Insights** — 1–3 cards de asociación + resumen semanal.
5. **Connect** — secundario, sin protagonismo en Today.

## Riesgos y pendientes

- Sleep data depende de sync wearable; score degrada con gracia si faltan métricas.
- Matching HealthData por email puede fallar si el dispositivo solo envía `deviceId` — vincular cuenta↔pulsera en Device.
- Android Improve / Today nativo pendiente (F2).
- Insights F1 son reglas simples, no ML; motor correlacional en F2.
- ECG/BP detrás de flags; ocultos en lanzamiento US.
- Connect no reemplaza al 911 — copy obligatorio en Help.

## Migración desde SiempreSalud

1. Feature flags apagan clínico/commerce (ya).
2. Nuevas colecciones `dailycheckins`, `weeklyreports` (aditivas).
3. `User.sleepProfile` aditivo — sin borrar wellness legacy.
4. Alias `/api/mobile/panic` → help (compat APK).
5. Seed demo opcional; no tocar producción.
6. Soft script `migrateHelpButtonAliases.js` (dry-run).

