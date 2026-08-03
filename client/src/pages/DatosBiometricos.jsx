import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/sleep/SleepNavbar';
import { FaHeartbeat, FaMicrochip, FaBed, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaMoon, FaClock, FaSyncAlt, FaExclamationTriangle, FaShieldAlt, FaTrash, FaChartLine, FaWalking, FaTachometerAlt, FaLeaf, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import apiClient from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { isFeatureEnabled } from '../config/featureFlags';
import { useT } from '../i18n/useT';

const CHART_RANGE_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
};

const HISTORY_RANGES = [
  { id: '24h', label: '24 hours' },
  { id: '7d', label: 'Week' },
  { id: '30d', label: 'Month' }
];

const getSleepMetricValue = (record, metricNames) => {
  const names = Array.isArray(metricNames) ? metricNames : [metricNames];
  const sleepData = record.data?.sleepData;

  for (const metric of names) {
    const name = typeof metric === 'string' ? metric : metric.name;
    const transform = typeof metric === 'object' && typeof metric.transform === 'function'
      ? metric.transform
      : (value) => value;

    const sleepValue = sleepData?.[name];
    if (typeof sleepValue === 'number' && Number.isFinite(sleepValue)) {
      return transform(sleepValue);
    }

    const dataValue = record.data?.[name];
    if (typeof dataValue === 'number' && Number.isFinite(dataValue)) {
      return transform(dataValue);
    }
  }

  return null;
};

const SLEEP_STAGE_COLORS = {
  1: '#5E35B1',
  2: '#7986CB',
  3: '#FFB74D',
  4: '#26A69A',
  rem: '#26A69A'
};

const SLEEP_STAGE_LABELS = {
  1: 'Profundo',
  2: 'Ligero',
  3: 'Despierto',
  4: 'REM'
};

const SLEEP_STAGE_PARTS = [
  { key: 'deep', label: 'Profundo', field: 'deep', color: SLEEP_STAGE_COLORS[1] },
  { key: 'light', label: 'Ligero', field: 'light', color: SLEEP_STAGE_COLORS[2] },
  { key: 'rem', label: 'REM', field: 'rem', color: SLEEP_STAGE_COLORS.rem },
  { key: 'awake', label: 'Despierto', field: 'awake', color: SLEEP_STAGE_COLORS[3] }
];

const getSleepTimelineColor = (type) => {
  if (type === 1) return SLEEP_STAGE_COLORS[1];
  if (type === 2) return SLEEP_STAGE_COLORS[2];
  if (type === 3) return SLEEP_STAGE_COLORS[3];
  if (type === 4) return SLEEP_STAGE_COLORS.rem;
  return SLEEP_STAGE_COLORS.rem;
};

const getSleepStageLabel = (type) => SLEEP_STAGE_LABELS[type] || 'REM';

const formatSleepDurationFromSeconds = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
    return 'N/A';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')} min`;
  }
  return `${Math.max(minutes, 1)} min`;
};

const formatSleepClock = (epochSec) => {
  if (typeof epochSec !== 'number' || epochSec <= 0) return 'N/A';
  return new Date(epochSec * 1000).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatSleepDateLabel = (epochSec, fallbackTimestamp) => {
  const date = typeof epochSec === 'number' && epochSec > 0
    ? new Date(epochSec * 1000)
    : new Date(fallbackTimestamp);
  if (Number.isNaN(date.getTime())) return 'Date no disponible';
  return date.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const buildSleepAnalysis = (sleepData) => {
  if (!sleepData || typeof sleepData !== 'object') return null;

  const total = sleepData.totalSleepDuration || 0;
  if (total <= 0) return null;

  const deep = sleepData.deepSleepDuration || 0;
  const light = sleepData.shallowSleepDuration || 0;
  const rem = sleepData.rapidDuration || 0;
  const awake = sleepData.awakeDuration || 0;
  const sumParts = deep + light + rem + awake;
  const basis = sumParts > 0 ? sumParts : total;

  const timeline = Array.isArray(sleepData.list)
    ? sleepData.list
      .map((segment) => ({
        start: segment.sleepStart,
        end: segment.sleepEnd,
        type: segment.type,
        duration: Math.max(0, (segment.sleepEnd || 0) - (segment.sleepStart || 0))
      }))
      .filter((segment) => segment.duration > 0)
    : [];

  const deepContinuity = timeline
    .filter((segment) => segment.type === 1)
    .reduce((max, segment) => Math.max(max, segment.duration), 0) || deep;

  const pct = (part) => (part > 0 && basis > 0 ? Math.round((part * 100) / basis) : 0);

  return {
    total,
    deep,
    light,
    rem,
    awake,
    deepContinuity,
    deepPercent: sleepData.deepSleepPercent ?? pct(deep),
    lightPercent: sleepData.lightSleepPercent ?? pct(light),
    remPercent: sleepData.remSleepPercent ?? pct(rem),
    awakePercent: sleepData.awakeSleepPercent ?? pct(awake),
    sleepTime: sleepData.sleepTime,
    wakeTime: sleepData.wakeTime,
    wakingCount: sleepData.wakingCount ?? 0,
    timeline
  };
};

const buildSleepRecordEntries = (records) => records
  .map((record) => {
    const analysis = buildSleepAnalysis(record?.data?.sleepData);
    if (!analysis) return null;
    const sortTime = analysis.wakeTime || analysis.sleepTime || Math.floor(new Date(record.timestamp).getTime() / 1000);
    return { record, analysis, sortTime };
  })
  .filter(Boolean)
  .sort((a, b) => a.sortTime - b.sortTime);

const ECG_CHART_COLOR = '#DC2626';

const normalizeEcgSamples = (cg) => {
  if (!Array.isArray(cg?.samples)) return [];
  return cg.samples
    .map((value) => (typeof value === 'number' ? value : Number(value)))
    .filter((value) => Number.isFinite(value) && value > 0);
};

const assessEcgRegularity = (samples) => {
  if (samples.length < 3) return 'Datos insuficientes';
  const deltas = [];
  for (let index = 1; index < samples.length; index += 1) {
    deltas.push(Math.abs(samples[index] - samples[index - 1]));
  }
  const avgDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  const spread = Math.max(...samples) - Math.min(...samples);
  if (avgDelta <= 2 && spread <= 6) return 'Excelente';
  if (avgDelta <= 4 && spread <= 10) return 'Buena';
  if (avgDelta <= 7 && spread <= 16) return 'Regular';
  return 'Baja';
};

const buildEcgRecordSnapshot = (record) => {
  const cg = record?.data?.cgMobile;
  if (!cg || typeof cg !== 'object') return null;

  const samples = normalizeEcgSamples(cg);
  const sampleCount = typeof cg.sampleCount === 'number' ? cg.sampleCount : samples.length;
  if (sampleCount <= 0 && samples.length === 0) return null;

  const averageHeartRate = typeof cg.averageHeartRate === 'number'
    ? cg.averageHeartRate
    : (samples.length ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length) : null);
  const minHeartRate = typeof cg.minHeartRate === 'number'
    ? cg.minHeartRate
    : (samples.length ? Math.min(...samples) : null);
  const maxHeartRate = typeof cg.maxHeartRate === 'number'
    ? cg.maxHeartRate
    : (samples.length ? Math.max(...samples) : null);

  if ([averageHeartRate, minHeartRate, maxHeartRate].every((value) => value === null)) return null;

  const samplingIntervalSeconds = typeof cg.samplingIntervalSeconds === 'number' && cg.samplingIntervalSeconds > 0
    ? cg.samplingIntervalSeconds
    : 30;

  return {
    record,
    timestamp: record.timestamp,
    recordId: record._id,
    mode: cg.mode || 'cg_mobile',
    durationSeconds: cg.durationSeconds ?? Math.max(samples.length, sampleCount) * samplingIntervalSeconds,
    samplingIntervalSeconds,
    sampleCount: sampleCount || samples.length,
    averageHeartRate,
    minHeartRate,
    maxHeartRate,
    samples,
    regularity: assessEcgRegularity(samples)
  };
};

const buildEcgRecordEntries = (records) => [...records]
  .map(buildEcgRecordSnapshot)
  .filter(Boolean)
  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const formatEcgDuration = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatEcgDateTime = (timestamp) => new Date(timestamp).toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const EcgWaveformChart = ({ entry }) => {
  const width = 640;
  const height = 200;
  const padding = 32;
  const samples = entry?.samples || [];

  if (samples.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
        This measurement has no plot samples. Only summary values are available.
      </div>
    );
  }

  const minValue = Math.min(...samples);
  const maxValue = Math.max(...samples);
  const valueRange = Math.max(maxValue - minValue, 1);
  const intervalSeconds = entry.samplingIntervalSeconds || 30;
  const totalSeconds = Math.max(entry.durationSeconds || samples.length * intervalSeconds, intervalSeconds);

  const polylinePoints = samples.map((value, index) => {
    const x = padding + ((width - padding * 2) * index) / Math.max(samples.length - 1, 1);
    const normalizedY = (value - minValue) / valueRange;
    const y = height - padding - normalizedY * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${polylinePoints} ${padding + ((width - padding * 2) * (samples.length - 1)) / Math.max(samples.length - 1, 1)},${height - padding}`;
  const yTicks = [minValue, Math.round(minValue + valueRange / 2), maxValue];

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Heart-rate curve</h4>
          <p className="text-xs text-gray-500 mt-1">
            {samples.length} samples · interval ~{intervalSeconds} s · duration {formatEcgDuration(totalSeconds)}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Media: {entry.averageHeartRate} bpm</p>
          <p>Rango: {entry.minHeartRate}-{entry.maxHeartRate} bpm</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" role="img" aria-label="ECG heart-rate chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
        {yTicks.map((tick) => {
          const normalizedY = (tick - minValue) / valueRange;
          const y = height - padding - normalizedY * (height - padding * 2);
          return (
            <g key={`ecg-y-${tick}`}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F3F4F6" strokeWidth="1" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{tick}</text>
            </g>
          );
        })}
        <polygon points={areaPoints} fill={ECG_CHART_COLOR} fillOpacity="0.1" />
        <polyline
          fill="none"
          stroke={ECG_CHART_COLOR}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylinePoints}
        />
      </svg>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>0 s</span>
        <span>{formatEcgDuration(totalSeconds)}</span>
      </div>
    </div>
  );
};

const EcgHistoryPanel = ({ ecgRecords = [] }) => {
  const ecgEntries = useMemo(() => buildEcgRecordEntries(ecgRecords), [ecgRecords]);
  const [selectedEcgIndex, setSelectedEcgIndex] = useState(-1);

  useEffect(() => {
    if (ecgEntries.length === 0) {
      setSelectedEcgIndex(-1);
      return;
    }
    setSelectedEcgIndex((current) => {
      if (current >= 0 && current < ecgEntries.length) return current;
      return ecgEntries.length - 1;
    });
  }, [ecgEntries.length]);

  if (ecgEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-rose-400">
        <div className="flex items-start gap-3">
          <FaHeartbeat className="text-rose-500 text-xl mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">ECG records (mobile app)</h3>
            <p className="text-sm text-gray-500 mt-1">
              ECG measurements from the mobile app will appear here. No records for this device yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedEntry = ecgEntries[selectedEcgIndex] || ecgEntries[ecgEntries.length - 1];
  const canGoOlder = selectedEcgIndex > 0;
  const canGoNewer = selectedEcgIndex < ecgEntries.length - 1;
  const regularityTone = {
    Excelente: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Buena: 'bg-sky-50 text-sky-800 border-sky-200',
    Regular: 'bg-amber-50 text-amber-800 border-amber-200',
    Baja: 'bg-red-50 text-red-800 border-red-200',
    'Datos insuficientes': 'bg-gray-50 text-gray-700 border-gray-200'
  }[selectedEntry.regularity] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-rose-400">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <FaHeartbeat className="text-rose-500 text-xl mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">ECG records (mobile app)</h3>
            <p className="text-sm text-gray-500">
              Measurements sent from the app when saving an ECG. Includes summary and heart-rate curve.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedEcgIndex((index) => Math.max(0, index - 1))}
            disabled={!canGoOlder}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft /> Anterior
          </button>
          <div className="text-center min-w-[170px]">
            <p className="text-sm font-semibold text-gray-900">{formatEcgDateTime(selectedEntry.timestamp)}</p>
            <p className="text-xs text-gray-500">{selectedEcgIndex + 1} de {ecgEntries.length}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEcgIndex((index) => Math.min(ecgEntries.length - 1, index + 1))}
            disabled={!canGoNewer}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">FC media</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{selectedEntry.averageHeartRate} bpm</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Rango FC</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">
            {selectedEntry.minHeartRate}-{selectedEntry.maxHeartRate}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Duration</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatEcgDuration(selectedEntry.durationSeconds)}</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Muestras</p>
          <p className="text-2xl font-bold text-violet-700 mt-1">{selectedEntry.sampleCount}</p>
        </div>
      </div>

      <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold mb-5 ${regularityTone}`}>
        Estabilidad del ritmo: {selectedEntry.regularity}
      </div>

      <EcgWaveformChart entry={selectedEntry} />

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">ECG measurement history</p>
        <div className="overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Muestras</th>
                <th className="py-3 px-4 font-medium">FC media</th>
                <th className="py-3 px-4 font-medium">Rango</th>
                <th className="py-3 px-4 font-medium">Estabilidad</th>
              </tr>
            </thead>
            <tbody>
              {[...ecgEntries].reverse().map((entry) => {
                const entryIndex = ecgEntries.indexOf(entry);
                const isSelected = entryIndex === selectedEcgIndex;
                return (
                  <tr
                    key={entry.recordId || entry.timestamp}
                    onClick={() => setSelectedEcgIndex(entryIndex)}
                    className={`border-b border-gray-100 cursor-pointer transition ${
                      isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{formatEcgDateTime(entry.timestamp)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatEcgDuration(entry.durationSeconds)}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.sampleCount}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.averageHeartRate} bpm</td>
                    <td className="py-3 px-4 text-gray-700">{entry.minHeartRate}-{entry.maxHeartRate}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.regularity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EXERCISE_GPS_COLOR = '#2563EB';

const normalizeExerciseRoute = (route) => {
  if (!Array.isArray(route)) return [];
  return route
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const latitude = Number(point[0]);
      const longitude = Number(point[1]);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      return {
        latitude,
        longitude,
        timestampMs: Number(point[2]) || 0,
        altitudeMeters: Number.isFinite(Number(point[3])) ? Number(point[3]) : null
      };
    })
    .filter(Boolean);
};

const buildExerciseRecordSnapshot = (record) => {
  const exercise = record?.data?.exerciseSession;
  if (!exercise || typeof exercise !== 'object') return null;

  const durationSeconds = typeof exercise.durationSeconds === 'number'
    ? exercise.durationSeconds
    : (typeof exercise.durationSec === 'number' ? exercise.durationSec : null);
  const averageHeartRate = typeof exercise.averageHeartRate === 'number'
    ? exercise.averageHeartRate
    : (typeof exercise.avgBpm === 'number' ? exercise.avgBpm : null);
  const calories = typeof exercise.calories === 'number' ? exercise.calories : null;
  const distanceMeters = typeof exercise.distanceMeters === 'number' ? exercise.distanceMeters : null;
  const elevationGainMeters = typeof exercise.elevationGainMeters === 'number' ? exercise.elevationGainMeters : null;

  if (durationSeconds === null && averageHeartRate === null && calories === null && distanceMeters === null) {
    return null;
  }

  const route = normalizeExerciseRoute(exercise.route);
  const source = exercise.source || (route.length >= 2 || distanceMeters > 0 ? 'gps_phone' : 'watch');

  return {
    record,
    recordId: record._id,
    timestamp: record.timestamp,
    source,
    sportType: exercise.sportType ?? exercise.type ?? null,
    sportName: exercise.sportName || exercise.name || (source === 'gps_phone' ? 'GPS' : 'Ejercicio'),
    durationSeconds: durationSeconds ?? 0,
    averageHeartRate: averageHeartRate ?? null,
    calories: calories ?? null,
    distanceMeters: distanceMeters ?? 0,
    elevationGainMeters: elevationGainMeters ?? 0,
    hasRoute: Boolean(exercise.hasRoute) || route.length >= 2,
    route
  };
};

const buildExerciseRecordEntries = (records) => [...records]
  .map(buildExerciseRecordSnapshot)
  .filter(Boolean)
  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

const formatExerciseDuration = (seconds) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatExerciseDistance = (meters) => {
  if (typeof meters !== 'number' || !Number.isFinite(meters) || meters <= 0) return '—';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

const formatExerciseDateTime = (timestamp) => new Date(timestamp).toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const buildGoogleMapsDirectionsUrl = (route, travelMode = 'walking') => {
  if (!Array.isArray(route) || route.length < 2) return null;

  const points = route
    .map((point) => ({
      latitude: Number(point?.latitude),
      longitude: Number(point?.longitude)
    }))
    .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));

  if (points.length < 2) return null;

  const first = points[0];
  const last = points[points.length - 1];

  const maxWaypoints = 8;
  const middlePoints = points.slice(1, -1);
  const sampledWaypoints = [];
  if (middlePoints.length > 0) {
    const step = Math.max(1, Math.floor(middlePoints.length / maxWaypoints));
    for (let index = 0; index < middlePoints.length; index += step) {
      sampledWaypoints.push(middlePoints[index]);
      if (sampledWaypoints.length >= maxWaypoints) break;
    }
  }

  const params = new URLSearchParams({
    api: '1',
    origin: `${first.latitude},${first.longitude}`,
    destination: `${last.latitude},${last.longitude}`,
    travelmode: EVENT_ROUTE_TRAVEL_MODES.some((mode) => mode.id === travelMode) ? travelMode : 'walking'
  });

  if (sampledWaypoints.length > 0) {
    const waypointValue = sampledWaypoints
      .map((point) => `${point.latitude},${point.longitude}`)
      .join('|');
    params.set('waypoints', waypointValue);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const ExerciseRouteMap = ({ route }) => {
  const width = 640;
  const height = 220;
  const padding = 24;

  if (!route || route.length < 2) {
    return (
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
        Sin ruta GPS para mostrar en el mapa.
      </div>
    );
  }

  const lats = route.map((point) => point.latitude);
  const lngs = route.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const points = route.map((point) => {
    const x = padding + ((point.longitude - minLng) / lngSpan) * (width - padding * 2);
    const y = height - padding - ((point.latitude - minLat) / latSpan) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const start = route[0];
  const end = route[route.length - 1];

  const toXY = (point) => {
    const x = padding + ((point.longitude - minLng) / lngSpan) * (width - padding * 2);
    const y = height - padding - ((point.latitude - minLat) / latSpan) * (height - padding * 2);
    return { x, y };
  };

  const startPoint = toXY(start);
  const endPoint = toXY(end);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-800">Ruta GPS</h4>
        <p className="text-xs text-gray-500 mt-1">{route.length} puntos registrados</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 rounded-lg bg-sky-50" role="img" aria-label="Mapa de ruta GPS">
        <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="#EFF6FF" stroke="#DBEAFE" rx="8" />
        <polyline
          fill="none"
          stroke={EXERCISE_GPS_COLOR}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#16A34A" />
        <circle cx={endPoint.x} cy={endPoint.y} r="5" fill="#DC2626" />
      </svg>
      <div className="flex gap-4 mt-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Start</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> End</span>
      </div>
    </div>
  );
};

const ExerciseHistoryPanel = ({ exerciseRecords = [] }) => {
  const exerciseEntries = useMemo(() => buildExerciseRecordEntries(exerciseRecords), [exerciseRecords]);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(-1);

  useEffect(() => {
    if (exerciseEntries.length === 0) {
      setSelectedExerciseIndex(-1);
      return;
    }
    setSelectedExerciseIndex((current) => {
      if (current >= 0 && current < exerciseEntries.length) return current;
      return exerciseEntries.length - 1;
    });
  }, [exerciseEntries.length]);

  if (exerciseEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-400">
        <div className="flex items-start gap-3">
          <FaWalking className="text-blue-500 text-xl mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">History de ejercicios</h3>
            <p className="text-sm text-gray-500 mt-1">
              GPS and exercise sessions from the app will appear here. No records for this device yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedEntry = exerciseEntries[selectedExerciseIndex] || exerciseEntries[exerciseEntries.length - 1];
  const canGoOlder = selectedExerciseIndex > 0;
  const canGoNewer = selectedExerciseIndex < exerciseEntries.length - 1;
  const isGps = selectedEntry.source === 'gps_phone' || selectedEntry.hasRoute || selectedEntry.distanceMeters > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-400">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <FaWalking className="text-blue-500 text-xl mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">History de ejercicios</h3>
            <p className="text-sm text-gray-500">
              GPS and exercise sessions sent from the mobile app to the server.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedExerciseIndex((index) => Math.max(0, index - 1))}
            disabled={!canGoOlder}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft /> Anterior
          </button>
          <div className="text-center min-w-[170px]">
            <p className="text-sm font-semibold text-gray-900">{formatExerciseDateTime(selectedEntry.timestamp)}</p>
            <p className="text-xs text-gray-500">{selectedExerciseIndex + 1} de {exerciseEntries.length}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedExerciseIndex((index) => Math.min(exerciseEntries.length - 1, index + 1))}
            disabled={!canGoNewer}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
          {selectedEntry.sportName}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          isGps ? 'bg-sky-50 text-sky-800 border border-sky-100' : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {isGps ? 'Phone GPS' : 'Watch / manual'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Duration</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatExerciseDuration(selectedEntry.durationSeconds)}</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">FC media</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            {selectedEntry.averageHeartRate ?? '—'}{selectedEntry.averageHeartRate ? ' bpm' : ''}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Calories</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">
            {selectedEntry.calories != null ? Math.round(selectedEntry.calories) : '—'}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Distance</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatExerciseDistance(selectedEntry.distanceMeters)}</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600">Desnivel</p>
          <p className="text-2xl font-bold text-violet-700 mt-1">
            {selectedEntry.elevationGainMeters > 0 ? `+${Math.round(selectedEntry.elevationGainMeters)} m` : '—'}
          </p>
        </div>
      </div>

      {isGps && <ExerciseRouteMap route={selectedEntry.route} />}

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">All sessions</p>
        <div className="overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Deporte</th>
                <th className="py-3 px-4 font-medium">Source</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Distance</th>
                <th className="py-3 px-4 font-medium">FC media</th>
                <th className="py-3 px-4 font-medium">Kcal</th>
              </tr>
            </thead>
            <tbody>
              {[...exerciseEntries].reverse().map((entry) => {
                const entryIndex = exerciseEntries.indexOf(entry);
                const entryIsGps = entry.source === 'gps_phone' || entry.hasRoute || entry.distanceMeters > 0;
                const isSelected = entryIndex === selectedExerciseIndex;
                return (
                  <tr
                    key={entry.recordId || entry.timestamp}
                    onClick={() => setSelectedExerciseIndex(entryIndex)}
                    className={`border-b border-gray-100 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{formatExerciseDateTime(entry.timestamp)}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.sportName}</td>
                    <td className="py-3 px-4 text-gray-700">{entryIsGps ? 'GPS' : 'Watch'}</td>
                    <td className="py-3 px-4 text-gray-700">{formatExerciseDuration(entry.durationSeconds)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatExerciseDistance(entry.distanceMeters)}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.averageHeartRate ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.calories != null ? Math.round(entry.calories) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SleepCompositionBarChart = ({ analysis, layout = 'vertical' }) => {
  const parts = SLEEP_STAGE_PARTS
    .map((part) => ({ ...part, sec: analysis[part.field] || 0 }))
    .filter((part) => part.sec > 0);
  const total = parts.reduce((sum, part) => sum + part.sec, 0) || 1;

  if (layout === 'horizontal') {
    let offset = 0;
    const width = 640;
    const barHeight = 24;
    return (
      <svg viewBox={`0 0 ${width} ${barHeight + 8}`} className="w-full h-8" role="img" aria-label="Sleep distribution">
        <rect x={8} y={4} width={width - 16} height={barHeight} fill="#FFFFFF" stroke="#E5E7EB" rx="8" />
        {parts.map((part) => {
          const segmentWidth = ((width - 16) * part.sec) / total;
          const rect = (
            <rect
              key={`sleep-bar-${part.key}`}
              x={8 + offset}
              y={6}
              width={segmentWidth}
              height={barHeight - 4}
              fill={part.color}
            />
          );
          offset += segmentWidth;
          return rect;
        })}
      </svg>
    );
  }

  const chartWidth = 220;
  const chartHeight = 220;
  const barWidth = 72;
  const barX = (chartWidth - barWidth) / 2;
  let barTop = chartHeight - 16;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-56 h-56" role="img" aria-label="Sleep stage composition">
        <rect x={barX} y={12} width={barWidth} height={chartHeight - 28} fill="#FFFFFF" stroke="#E5E7EB" rx="10" />
        {parts.map((part) => {
          const segmentHeight = ((chartHeight - 28) * part.sec) / total;
          barTop -= segmentHeight;
          return (
            <rect
              key={`sleep-stack-${part.key}`}
              x={barX + 4}
              y={barTop}
              width={barWidth - 8}
              height={segmentHeight}
              fill={part.color}
              rx="2"
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-2 text-sm text-gray-700">
        {parts.map((part) => (
          <span key={`legend-${part.key}`} className="inline-flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: part.color }} />
            {part.label} · {formatSleepDurationFromSeconds(part.sec)}
            <span className="text-gray-500">({Math.round((part.sec * 100) / total)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const buildSleepStackedPoints = (records, rangeId) => {
  const bucketMs = getChartBucketMs(rangeId) || 24 * 60 * 60 * 1000;
  const buckets = new Map();

  records.forEach((record) => {
    const sleepData = record.data?.sleepData;
    if (!sleepData || !(sleepData.totalSleepDuration > 0)) return;

    const deep = sleepData.deepSleepDuration || 0;
    const light = sleepData.shallowSleepDuration || 0;
    const rem = sleepData.rapidDuration || 0;
    const awake = sleepData.awakeDuration || 0;
    if (deep + light + rem + awake <= 0) return;

    const bucketKey = Math.floor(new Date(record.timestamp).getTime() / bucketMs) * bucketMs;
    buckets.set(bucketKey, {
      timestamp: new Date(bucketKey).toISOString(),
      deep: Math.round(deep / 60),
      light: Math.round(light / 60),
      rem: Math.round(rem / 60),
      awake: Math.round(awake / 60)
    });
  });

  return Array.from(buckets.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const SleepHistoricalStackedChart = ({ records, rangeId }) => {
  const points = buildSleepStackedPoints(records, rangeId);
  if (points.length === 0) return null;

  const width = 640;
  const height = 220;
  const padding = 28;
  const maxTotal = Math.max(...points.map((point) => point.deep + point.light + point.rem + point.awake), 1);
  const barGap = 10;
  const barWidth = Math.max(18, (width - padding * 2 - barGap * (points.length - 1)) / points.length);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 xl:col-span-2">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-800">Total sleep time</h4>
        <p className="text-xs text-gray-500 mt-1">Barras apiladas por profundo, ligero, REM y despierto.</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52" role="img" aria-label="Stacked sleep chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
        {points.map((point, index) => {
          const left = padding + index * (barWidth + barGap);
          const total = point.deep + point.light + point.rem + point.awake;
          const totalHeight = ((height - padding * 2) * total) / maxTotal;
          let top = height - padding;
          const segments = SLEEP_STAGE_PARTS
            .map((part) => ({ ...part, value: point[part.field] || 0 }))
            .filter((part) => part.value > 0);

          return (
            <g key={`sleep-stack-${point.timestamp}-${index}`}>
              {segments.map((segment) => {
                const segmentHeight = (totalHeight * segment.value) / total;
                top -= segmentHeight;
                return (
                  <rect
                    key={`${point.timestamp}-${segment.key}`}
                    x={left}
                    y={top}
                    width={barWidth}
                    height={segmentHeight}
                    fill={segment.color}
                  />
                );
              })}
              <text x={left + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#6B7280">
                {new Date(point.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
        {SLEEP_STAGE_PARTS.map((part) => (
          <span key={`sleep-legend-${part.key}`} className="inline-flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: part.color }} />
            {part.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SleepAnalysisPanel = ({ sleepRecords = [] }) => {
  const sleepEntries = useMemo(() => buildSleepRecordEntries(sleepRecords), [sleepRecords]);
  const [selectedSleepIndex, setSelectedSleepIndex] = useState(-1);
  const [hoveredSleepSegment, setHoveredSleepSegment] = useState(null);
  const sleepTimelineSvgRef = useRef(null);

  useEffect(() => {
    if (sleepEntries.length === 0) {
      setSelectedSleepIndex(0);
      return;
    }
    setSelectedSleepIndex((current) => {
      if (current >= 0 && current < sleepEntries.length) return current;
      return sleepEntries.length - 1;
    });
  }, [sleepEntries.length]);

  useEffect(() => {
    setHoveredSleepSegment(null);
  }, [selectedSleepIndex]);

  if (sleepEntries.length === 0) return null;

  const selectedEntry = sleepEntries[selectedSleepIndex] || sleepEntries[sleepEntries.length - 1];
  const analysis = selectedEntry.analysis;
  const canGoOlder = selectedSleepIndex > 0;
  const canGoNewer = selectedSleepIndex < sleepEntries.length - 1;
  const chartWidth = 640;
  const chartHeight = 124;
  const padding = 8;
  const laneTop = 44;
  const laneHeight = 44;
  const timelineStart = analysis.timeline.length
    ? Math.min(...analysis.timeline.map((segment) => segment.start))
    : 0;
  const timelineEnd = analysis.timeline.length
    ? Math.max(...analysis.timeline.map((segment) => segment.end))
    : 1;
  const timelineSpan = Math.max(1, timelineEnd - timelineStart);
  const timelineTicks = analysis.timeline.length
    ? Array.from({ length: 5 }, (_, index) => Math.round(timelineStart + (timelineSpan * index) / 4))
    : [];
  const timelineSegments = analysis.timeline.map((segment, index) => {
    const x = padding + ((segment.start - timelineStart) / timelineSpan) * (chartWidth - padding * 2);
    const width = Math.max(2, ((segment.end - segment.start) / timelineSpan) * (chartWidth - padding * 2));
    const color = getSleepTimelineColor(segment.type);
    return { segment, index, x, width, color };
  });
  const handleTimelinePointerMove = (event) => {
    const svg = sleepTimelineSvgRef.current;
    if (!svg || timelineSegments.length === 0) return;

    const bounds = svg.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * chartHeight;

    if (
      pointerX < padding ||
      pointerX > chartWidth - padding ||
      pointerY < laneTop - 8 ||
      pointerY > laneTop + laneHeight + 8
    ) {
      setHoveredSleepSegment(null);
      return;
    }

    const match = timelineSegments.find(({ x, width }) => pointerX >= x && pointerX <= x + width);
    setHoveredSleepSegment(match || null);
  };

  const metricCards = [
    { label: 'Continuidad profundo', value: formatSleepDurationFromSeconds(analysis.deepContinuity) },
    { label: '% deep sleep', value: `${analysis.deepPercent}%` },
    { label: '% light sleep', value: `${analysis.lightPercent}%` },
    { label: '% REM sleep', value: `${analysis.remPercent}%` },
    { label: 'Deep sleep', value: formatSleepDurationFromSeconds(analysis.deep) },
    { label: 'Light sleep', value: formatSleepDurationFromSeconds(analysis.light) },
    { label: 'REM sleep', value: formatSleepDurationFromSeconds(analysis.rem) },
    { label: 'Tiempo despierto', value: formatSleepDurationFromSeconds(analysis.awake) }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
        <FaBed className="text-indigo-500 text-xl mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sleep analysis</h3>
          <p className="text-sm text-gray-500">
            Watch sleep data (total, stages, schedule, and timeline).
          </p>
        </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedSleepIndex((index) => Math.max(0, index - 1))}
            disabled={!canGoOlder}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FaChevronLeft /> Anterior
          </button>
          <div className="text-center min-w-[150px]">
            <p className="text-sm font-semibold text-gray-900">
              {formatSleepDateLabel(analysis.sleepTime || analysis.wakeTime, selectedEntry.record?.timestamp)}
            </p>
            <p className="text-xs text-gray-500">
              {selectedSleepIndex + 1} de {sleepEntries.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSleepIndex((index) => Math.min(sleepEntries.length - 1, index + 1))}
            disabled={!canGoNewer}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Total sleep time</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">
            {formatSleepDurationFromSeconds(analysis.total)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Time de dormir</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{formatSleepClock(analysis.sleepTime)}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Time de despertar</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{formatSleepClock(analysis.wakeTime)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Sleep stage composition</p>
        <SleepCompositionBarChart analysis={analysis} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Stage chart (deep, light, REM, awake)</p>

        {analysis.timeline.length > 0 ? (
          <svg
            ref={sleepTimelineSvgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-32 mb-3 cursor-crosshair select-none"
            role="img"
            aria-label="Interactive sleep timeline"
            onPointerMove={handleTimelinePointerMove}
            onPointerLeave={() => setHoveredSleepSegment(null)}
          >
            <rect x={padding} y={laneTop} width={chartWidth - padding * 2} height={laneHeight} fill="#FFFFFF" stroke="#E5E7EB" rx="8" />
            {timelineSegments.map(({ segment, index, x, width, color }) => {
              const isActive = hoveredSleepSegment?.index === index;
              return (
                <g key={`sleep-segment-${segment.start}-${index}`}>
                  <rect
                    x={x}
                    y={laneTop + 5}
                    width={width}
                    height={laneHeight - 10}
                    fill={color}
                    opacity={isActive ? 1 : 0.9}
                    rx="2"
                  >
                    <title>
                      {`${getSleepStageLabel(segment.type)} · ${formatSleepDurationFromSeconds(segment.duration)} · ${formatSleepClock(segment.start)} - ${formatSleepClock(segment.end)}`}
                    </title>
                  </rect>
                  {isActive && (
                    <rect
                      x={x}
                      y={laneTop + 5}
                      width={width}
                      height={laneHeight - 10}
                      fill="none"
                      stroke="#111827"
                      strokeWidth="2"
                      rx="2"
                    />
                  )}
                </g>
              );
            })}
            {hoveredSleepSegment && (() => {
              const tooltipWidth = 228;
              const tooltipHeight = 36;
              const centerX = hoveredSleepSegment.x + hoveredSleepSegment.width / 2;
              const tooltipX = Math.max(10, Math.min(chartWidth - tooltipWidth - 10, centerX - tooltipWidth / 2));
              const tooltipY = 4;
              const { segment, color } = hoveredSleepSegment;
              return (
                <g pointerEvents="none">
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="8"
                    fill="#111827"
                    opacity="0.94"
                  />
                  <circle cx={tooltipX + 12} cy={tooltipY + 13} r="4" fill={color} />
                  <text x={tooltipX + 22} y={tooltipY + 16} fontSize="12" fontWeight="700" fill="#FFFFFF">
                    {getSleepStageLabel(segment.type)} · {formatSleepDurationFromSeconds(segment.duration)}
                  </text>
                  <text x={tooltipX + 22} y={tooltipY + 30} fontSize="11" fill="#D1D5DB">
                    {formatSleepClock(segment.start)} - {formatSleepClock(segment.end)}
                  </text>
                </g>
              );
            })()}
            {timelineTicks.map((tick) => {
              const x = padding + ((tick - timelineStart) / timelineSpan) * (chartWidth - padding * 2);
              return (
                <g key={`sleep-tick-${tick}`}>
                  <line x1={x} y1={laneTop + laneHeight + 4} x2={x} y2={laneTop + laneHeight + 10} stroke="#9CA3AF" strokeWidth="1" />
                  <text x={x} y={laneTop + laneHeight + 27} textAnchor="middle" fontSize="12" fill="#6B7280">
                    {formatSleepClock(tick)}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <p className="text-sm text-gray-500 mb-3">No hourly segments; showing aggregated distribution.</p>
        )}

        {analysis.timeline.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-lg p-3 mb-3 max-h-44 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 mb-2">Times por fase</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {analysis.timeline.map((segment, index) => (
                <div key={`sleep-segment-time-${segment.start}-${index}`} className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSleepTimelineColor(segment.type) }} />
                  <span className="font-medium">{getSleepStageLabel(segment.type)}</span>
                  <span className="text-gray-500">
                    {formatSleepClock(segment.start)} - {formatSleepClock(segment.end)}
                  </span>
                  <span className="text-gray-400">· {formatSleepDurationFromSeconds(segment.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SleepCompositionBarChart analysis={analysis} layout="horizontal" />

        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
          {SLEEP_STAGE_PARTS.map((part) => {
            const sec = analysis[part.field] || 0;
            if (sec <= 0) return null;
            return (
              <span key={`legend-${part.key}`} className="inline-flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: part.color }} />
                {part.label} · {formatSleepDurationFromSeconds(sec)}
              </span>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Despertares durante la noche: {analysis.wakingCount}
        </p>
      </div>
    </div>
  );
};

const getHeartRateValue = (record) => (
  record?.data?.heartRate ??
  record?.data?.frecuencia_cardiaca ??
  record?.data?.heart_rate ??
  null
);

const getOxygenSaturationValue = (record) => (
  record?.data?.oxygenSaturation ??
  record?.data?.saturacion_oxigeno ??
  record?.data?.spo2 ??
  record?.data?.bloodOxygen ??
  null
);

const getStepsValue = (record) => (
  record?.data?.steps ??
  record?.data?.steps_today ??
  null
);

const getStressValue = (record) => (
  typeof record?.data?.stress === 'number'
    ? record.data.stress
    : null
);

const getHrvValue = (record) => (
  record?.data?.hrv ??
  null
);

const getSystolicValue = (record) => (
  record?.data?.bloodPressure?.systolic ??
  record?.data?.blood_pressure?.systolic ??
  record?.data?.presion_arterial_sistolica ??
  record?.data?.presion_sistolica ??
  null
);

const getDiastolicValue = (record) => (
  record?.data?.bloodPressure?.diastolic ??
  record?.data?.blood_pressure?.diastolic ??
  record?.data?.presion_arterial_diastolica ??
  record?.data?.presion_diastolica ??
  null
);

const METRIC_CONFIGS_BASE = [
  { key: 'heartRate', label: 'Heart rate', color: '#DC2626', unit: 'bpm', getValue: getHeartRateValue },
  { key: 'oxygenSaturation', label: 'Oxygen', color: '#2563EB', unit: '%', getValue: getOxygenSaturationValue },
  { key: 'steps', label: 'Steps', color: '#059669', unit: '', getValue: getStepsValue },
  { key: 'stress', label: 'Stress', color: '#7C3AED', unit: '', getValue: getStressValue },
  { key: 'hrv', label: 'HRV', color: '#0891B2', unit: 'ms', getValue: getHrvValue },
  { key: 'sleepTotal', label: 'Total sleep', color: '#4F46E5', unit: 'min', getValue: (record) => getSleepMetricValue(record, ['totalMinutes', 'total', 'sleep_duration_total', { name: 'totalSleepDuration', transform: (value) => Math.round(value / 60) }]) },
  { key: 'sleepDeep', label: 'Deep sleep', color: '#7C3AED', unit: 'min', getValue: (record) => getSleepMetricValue(record, ['deepMinutes', 'deep', 'sleep_duration_deep', { name: 'deepSleepDuration', transform: (value) => Math.round(value / 60) }]) },
  { key: 'sleepLight', label: 'Light sleep', color: '#A855F7', unit: 'min', getValue: (record) => getSleepMetricValue(record, ['lightMinutes', 'light', 'sleep_duration_light', { name: 'shallowSleepDuration', transform: (value) => Math.round(value / 60) }]) },
  { key: 'sleepRem', label: 'REM sleep', color: '#06B6D4', unit: 'min', getValue: (record) => getSleepMetricValue(record, ['remMinutes', 'rem', 'sleep_duration_rem', { name: 'rapidDuration', transform: (value) => Math.round(value / 60) }]) },
  { key: 'sleepAwake', label: 'Awake', color: '#F59E0B', unit: 'min', getValue: (record) => getSleepMetricValue(record, ['awakeMinutes', 'awake', 'sleep_duration_awake', { name: 'awakeDuration', transform: (value) => Math.round(value / 60) }]) },
  { key: 'systolic', label: 'Systolic pressure (experimental)', color: '#B91C1C', unit: 'mmHg', getValue: getSystolicValue, experimental: 'EXPERIMENTAL_BP' },
  { key: 'diastolic', label: 'Diastolic pressure (experimental)', color: '#F97316', unit: 'mmHg', getValue: getDiastolicValue, experimental: 'EXPERIMENTAL_BP' }
];

const METRIC_CONFIGS = METRIC_CONFIGS_BASE.filter(
  (metric) => !metric.experimental || isFeatureEnabled(metric.experimental)
);

const DAILY_SUMMARY_METRICS = [
  { key: 'heartRate', aggregate: 'average' },
  { key: 'stress', aggregate: 'average' },
  { key: 'hrv', aggregate: 'average' },
  { key: 'steps', aggregate: 'max' },
  { key: 'sleepTotal', aggregate: 'latest' },
  ...(isFeatureEnabled('EXPERIMENTAL_BP')
    ? [
        { key: 'systolic', aggregate: 'latest' },
        { key: 'diastolic', aggregate: 'latest' }
      ]
    : [])
];

const STEPS_DAILY_GOAL = 8000;
const SLEEP_OPTIMAL_MINUTES = 480;

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const getActivityLabel = (score) => {
  if (score === null) return 'No data';
  if (score >= 100) return 'Meta cumplida';
  if (score >= 75) return 'Very active';
  if (score >= 50) return 'Active';
  if (score >= 25) return 'Moderado';
  return 'Sedentario';
};

const getSleepScoreLabel = (score) => {
  if (score === null) return 'No data';
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bueno';
  if (score >= 50) return 'Regular';
  return 'Insuficiente';
};

const getRecoveryLabel = (score) => {
  if (score === null) return 'No data';
  if (score >= 80) return 'Recuperado';
  if (score >= 60) return 'Aceptable';
  if (score >= 40) return 'Parcial';
  return 'Fatigado';
};

const getHeartRateLabel = (avg) => {
  if (avg === null) return 'No data';
  if (avg < 60) return 'Baja';
  if (avg <= 100) return 'Normal';
  return 'Elevada';
};

const classifyReferentialBloodPressure = (systolic, diastolic) => {
  if (typeof systolic !== 'number' || typeof diastolic !== 'number' || systolic <= 0 || diastolic <= 0) {
    return { label: 'No data', tone: 'text-gray-500', bg: 'bg-gray-50' };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: 'Alta (referencial)', tone: 'text-red-700', bg: 'bg-red-50' };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { label: 'Elevada (referencial)', tone: 'text-amber-700', bg: 'bg-amber-50' };
  }
  if (systolic < 90 || diastolic < 60) {
    return { label: 'Baja (referencial)', tone: 'text-blue-700', bg: 'bg-blue-50' };
  }
  return { label: 'Normal (referencial)', tone: 'text-emerald-700', bg: 'bg-emerald-50' };
};

const computeSleepScore = (sleepTotalMinutes) => {
  if (typeof sleepTotalMinutes !== 'number' || sleepTotalMinutes <= 0) return null;
  const diff = Math.abs(sleepTotalMinutes - SLEEP_OPTIMAL_MINUTES);
  return clampScore(100 - (diff / SLEEP_OPTIMAL_MINUTES) * 55);
};

const computeActivityScore = (steps) => {
  if (typeof steps !== 'number' || steps <= 0) return null;
  return clampScore((steps / STEPS_DAILY_GOAL) * 100);
};

const computeRecoveryScore = ({ hrv, stress, sleepTotalMinutes }) => {
  const parts = [];

  if (typeof sleepTotalMinutes === 'number' && sleepTotalMinutes > 0) {
    parts.push({ weight: 0.4, value: computeSleepScore(sleepTotalMinutes) });
  }

  if (typeof hrv === 'number' && hrv > 0) {
    parts.push({ weight: 0.35, value: clampScore(((hrv - 15) / 65) * 100) });
  }

  if (typeof stress === 'number' && stress >= 0) {
    parts.push({ weight: 0.25, value: clampScore(100 - stress) });
  }

  if (parts.length === 0) return null;

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const weighted = parts.reduce((sum, part) => sum + part.value * part.weight, 0);
  return clampScore(weighted / totalWeight);
};

const formatDayLabel = (dayKey) => {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};

const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('es-CL', {
  hour: '2-digit',
  minute: '2-digit'
});

const formatMetricValue = (value, unit) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (unit === 'min') {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }

  return `${value}${unit ? ` ${unit}` : ''}`;
};

const buildDailyBiometricDashboard = (records) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const heartRateValues = sortedRecords
    .map(getHeartRateValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const hrvValues = sortedRecords
    .map(getHrvValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const stressValues = sortedRecords
    .map(getStressValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0);
  const stepsValues = sortedRecords
    .map(getStepsValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const systolicValues = sortedRecords
    .map(getSystolicValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const diastolicValues = sortedRecords
    .map(getDiastolicValue)
    .filter((value) => typeof value === 'number' && Number.isFinite(value) && value > 0);

  let sleepAnalysis = null;
  for (let index = sortedRecords.length - 1; index >= 0; index -= 1) {
    const candidate = buildSleepAnalysis(sortedRecords[index]?.data?.sleepData);
    if (candidate) {
      sleepAnalysis = candidate;
      break;
    }
  }

  const sleepTotalMinutes = sleepAnalysis
    ? Math.round(sleepAnalysis.total / 60)
    : sortedRecords
      .map((record) => getSleepMetricValue(record, [
        'totalMinutes',
        'total',
        { name: 'totalSleepDuration', transform: (value) => Math.round(value / 60) }
      ]))
      .filter((value) => typeof value === 'number' && value > 0)
      .pop() ?? null;

  const avgHeartRate = aggregateMetricValues(heartRateValues, 'average');
  const avgHrv = aggregateMetricValues(hrvValues, 'average');
  const avgStress = aggregateMetricValues(stressValues, 'average');
  const steps = stepsValues.length ? Math.max(...stepsValues) : null;
  const systolic = aggregateMetricValues(systolicValues, 'latest');
  const diastolic = aggregateMetricValues(diastolicValues, 'latest');
  const activityScore = computeActivityScore(steps);
  const sleepScore = computeSleepScore(sleepTotalMinutes);
  const recoveryScore = computeRecoveryScore({
    hrv: avgHrv,
    stress: avgStress,
    sleepTotalMinutes
  });

  return {
    recordCount: sortedRecords.length,
    firstReadingAt: sortedRecords[0]?.timestamp || null,
    lastReadingAt: sortedRecords[sortedRecords.length - 1]?.timestamp || null,
    sleep: {
      totalMinutes: sleepTotalMinutes,
      score: sleepScore,
      label: getSleepScoreLabel(sleepScore),
      analysis: sleepAnalysis,
      deepPercent: sleepAnalysis?.deepPercent ?? null,
      remPercent: sleepAnalysis?.remPercent ?? null,
      wakingCount: sleepAnalysis?.wakingCount ?? null
    },
    heartRate: {
      avg: avgHeartRate,
      min: heartRateValues.length ? Math.min(...heartRateValues) : null,
      max: heartRateValues.length ? Math.max(...heartRateValues) : null,
      resting: heartRateValues.length ? Math.min(...heartRateValues) : null,
      latest: heartRateValues.length ? heartRateValues[heartRateValues.length - 1] : null,
      readings: heartRateValues.length,
      label: getHeartRateLabel(avgHeartRate)
    },
    activity: {
      steps,
      goal: STEPS_DAILY_GOAL,
      score: activityScore,
      label: getActivityLabel(activityScore),
      progressPercent: activityScore
    },
    bloodPressure: {
      systolic,
      diastolic,
      classification: classifyReferentialBloodPressure(systolic, diastolic)
    },
    recovery: {
      score: recoveryScore,
      hrv: avgHrv,
      stress: avgStress,
      label: getRecoveryLabel(recoveryScore)
    }
  };
};

const DailyScoreRing = ({ score, color, size = 88 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = typeof score === 'number' ? clampScore(score) : null;
  const dashOffset = normalizedScore === null
    ? circumference
    : circumference - (normalizedScore / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="#111827"
      >
        {normalizedScore === null ? '--' : normalizedScore}
      </text>
    </svg>
  );
};

const DailyBiometricDashboard = ({
  dashboard,
  dayKey,
  availableDays,
  onDayChange
}) => {
  if (!dashboard) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
        Not enough data to build the daily dashboard.
      </div>
    );
  }

  const currentDayIndex = availableDays.findIndex((day) => day === dayKey);
  const canGoPrev = currentDayIndex < availableDays.length - 1;
  const canGoNext = currentDayIndex > 0;

  const pillars = [
    {
      key: 'sleep',
      title: 'Sleep',
      icon: FaBed,
      color: '#4F46E5',
      score: dashboard.sleep.score,
      label: dashboard.sleep.label,
      tone: 'border-indigo-100 bg-indigo-50/60',
      details: [
        { label: 'Duration', value: formatMetricValue(dashboard.sleep.totalMinutes, 'min') },
        { label: 'Profundo', value: dashboard.sleep.deepPercent !== null ? `${dashboard.sleep.deepPercent}%` : 'N/A' },
        { label: 'REM', value: dashboard.sleep.remPercent !== null ? `${dashboard.sleep.remPercent}%` : 'N/A' },
        { label: 'Despertares', value: dashboard.sleep.wakingCount ?? 'N/A' }
      ]
    },
    {
      key: 'heartRate',
      title: 'Heart rate',
      icon: FaHeartbeat,
      color: '#DC2626',
      score: dashboard.heartRate.avg ? clampScore(100 - Math.max(0, dashboard.heartRate.avg - 85) * 1.2) : null,
      label: dashboard.heartRate.label,
      tone: 'border-red-100 bg-red-50/60',
      details: [
        { label: 'Average', value: dashboard.heartRate.avg ? `${dashboard.heartRate.avg} bpm` : 'N/A' },
        { label: 'Resting (min)', value: dashboard.heartRate.resting ? `${dashboard.heartRate.resting} bpm` : 'N/A' },
        { label: 'Maximum', value: dashboard.heartRate.max ? `${dashboard.heartRate.max} bpm` : 'N/A' },
        { label: 'Lecturas', value: dashboard.heartRate.readings || 0 }
      ]
    },
    {
      key: 'activity',
      title: 'Actividad',
      icon: FaWalking,
      color: '#059669',
      score: dashboard.activity.score,
      label: dashboard.activity.label,
      tone: 'border-emerald-100 bg-emerald-50/60',
      details: [
        { label: 'Steps', value: dashboard.activity.steps ?? 'N/A' },
        { label: 'Meta diaria', value: dashboard.activity.goal.toLocaleString('en-US') },
        { label: 'Progreso', value: dashboard.activity.progressPercent !== null ? `${dashboard.activity.progressPercent}%` : 'N/A' },
        { label: 'Status', value: dashboard.activity.label }
      ]
    },
    ...(isFeatureEnabled('EXPERIMENTAL_BP')
      ? [{
          key: 'bloodPressure',
          title: 'Blood pressure (experimental)',
          icon: FaTachometerAlt,
          color: '#EA580C',
          score: dashboard.bloodPressure.systolic && dashboard.bloodPressure.diastolic
            ? (dashboard.bloodPressure.classification.label.includes('Normal') ? 85 : dashboard.bloodPressure.classification.label.includes('Elevada') ? 55 : 35)
            : null,
          label: `${dashboard.bloodPressure.classification.label} · no validado`,
          tone: 'border-orange-100 bg-orange-50/60',
          details: [
            {
              label: 'Lectura',
              value: (typeof dashboard.bloodPressure.systolic === 'number' || typeof dashboard.bloodPressure.diastolic === 'number')
                ? `${dashboard.bloodPressure.systolic ?? 'N/A'}/${dashboard.bloodPressure.diastolic ?? 'N/A'} mmHg`
                : 'N/A'
            },
            { label: 'Status', value: 'Experimental / non-clinical' },
            { label: 'Type', value: 'Wearable' },
            { label: 'Note', value: 'No diagnostic interpretation' }
          ]
        }]
      : []),
    {
      key: 'recovery',
      title: 'Recovery',
      icon: FaLeaf,
      color: '#0891B2',
      score: dashboard.recovery.score,
      label: dashboard.recovery.label,
      tone: 'border-cyan-100 bg-cyan-50/60',
      details: [
        { label: 'HRV prom.', value: dashboard.recovery.hrv ? `${dashboard.recovery.hrv} ms` : 'N/A' },
        { label: 'Avg. stress', value: typeof dashboard.recovery.stress === 'number' ? dashboard.recovery.stress : 'N/A' },
        { label: 'Sleep', value: formatMetricValue(dashboard.sleep.totalMinutes, 'min') },
        { label: 'Status', value: dashboard.recovery.label }
      ]
    }
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canGoPrev && onDayChange(availableDays[currentDayIndex + 1])}
            disabled={!canGoPrev}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Previous day"
          >
            <FaChevronLeft />
          </button>
          <div className="text-center min-w-[180px]">
            <p className="text-lg font-semibold text-gray-900">{formatDayLabel(dayKey)}</p>
            <p className="text-xs text-gray-500">
              {dashboard.recordCount} lecturas
              {dashboard.firstReadingAt && dashboard.lastReadingAt
                ? ` · ${formatTime(dashboard.firstReadingAt)} - ${formatTime(dashboard.lastReadingAt)}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => canGoNext && onDayChange(availableDays[currentDayIndex - 1])}
            disabled={!canGoNext}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Next day"
          >
            <FaChevronRight />
          </button>
        </div>

        {availableDays.length > 1 && (
          <select
            value={dayKey}
            onChange={(event) => onDayChange(event.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableDays.map((availableDay) => (
              <option key={availableDay} value={availableDay}>
                {formatDayLabel(availableDay)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div key={pillar.key} className={`rounded-xl border p-4 ${pillar.tone}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon style={{ color: pillar.color }} />
                    <h4 className="text-sm font-semibold text-gray-900">{pillar.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{pillar.label}</p>
                </div>
                <DailyScoreRing score={pillar.score} color={pillar.color} />
              </div>
              <div className="space-y-2">
                {pillar.details.map((detail) => (
                  <div key={`${pillar.key}-${detail.label}`} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-gray-500">{detail.label}</span>
                    <span className="text-gray-800 font-medium text-right">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {dashboard.sleep.analysis && (
        <div className="mt-5 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Day sleep composition</p>
          <SleepCompositionBarChart analysis={dashboard.sleep.analysis} layout="horizontal" />
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Recovery combines sleep, HRV, and stress for the selected day. No medical interpretations or clinical alerts.
      </p>
    </div>
  );
};

const formatDayKey = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMetricConfig = (key) => METRIC_CONFIGS.find((metric) => metric.key === key);

const aggregateMetricValues = (values, aggregate) => {
  if (!values.length) {
    return null;
  }

  if (aggregate === 'sum') {
    return values.reduce((sum, value) => sum + value, 0);
  }

  if (aggregate === 'max') {
    return Math.max(...values);
  }

  if (aggregate === 'average') {
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }

  return values[values.length - 1];
};

const getChartBucketMs = (rangeId) => {
  if (rangeId === '24h') {
    return 0;
  }

  if (rangeId === '7d') {
    return 60 * 60 * 1000;
  }

  return 24 * 60 * 60 * 1000;
};

const getMetricAggregateType = (metricKey) => {
  const config = DAILY_SUMMARY_METRICS.find((metric) => metric.key === metricKey);
  return config?.aggregate || 'average';
};

const buildStepIncrementPoints = (rawPoints = []) => {
  if (!Array.isArray(rawPoints) || rawPoints.length === 0) return [];

  const normalized = [];
  let previous = null;

  rawPoints.forEach((point) => {
    const current = typeof point?.value === 'number' ? point.value : null;
    if (!Number.isFinite(current) || current < 0) return;

    let increment = 0;
    if (previous === null) {
      increment = 0;
    } else if (current >= previous) {
      increment = current - previous;
    } else {
      // Cuando el watch reinicia el conteo diario, usamos el valor actual como nuevo inicio.
      increment = current;
    }

    normalized.push({
      timestamp: point.timestamp,
      value: Math.round(Math.max(0, increment))
    });

    previous = current;
  });

  return normalized;
};

const buildChartPoints = (records, getValue, rangeId, metricKey) => {
  let rawPoints = records
    .map((record) => ({
      timestamp: record.timestamp,
      value: getValue(record)
    }))
    .filter((point) => typeof point.value === 'number' && Number.isFinite(point.value))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (metricKey === 'steps') {
    rawPoints = buildStepIncrementPoints(rawPoints);
  }

  const bucketMs = getChartBucketMs(rangeId);
  if (!bucketMs || rawPoints.length <= 1) {
    return rawPoints;
  }

  const buckets = new Map();
  rawPoints.forEach((point) => {
    const bucketKey = Math.floor(new Date(point.timestamp).getTime() / bucketMs) * bucketMs;
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey).push(point.value);
  });

  const aggregateType = metricKey === 'steps' ? 'sum' : getMetricAggregateType(metricKey);

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([bucketKey, values]) => ({
      timestamp: new Date(bucketKey).toISOString(),
      value: aggregateMetricValues(values, aggregateType)
    }))
    .filter((point) => point.value !== null);
};

const getPatientNameFromRecord = (record) => (
  record?.name ||
  record?.fullName ||
  record?.data?.patientName ||
  record?.data?.namePatient ||
  record?.data?.fullName ||
  record?.data?.patient?.name ||
  record?.data?.user?.name ||
  record?.data?.ownerName ||
  record?.data?.name ||
  null
);

const getPatientIdFromRecord = (record) => (
  record?.idpersonal ||
  record?.idPersonal ||
  record?.data?.idpersonal ||
  record?.data?.idPersonal ||
  record?.data?.personalId ||
  record?.data?.patientId ||
  null
);

const getPatientEmailFromRecord = (record) => (
  record?.email ||
  record?.data?.email ||
  record?.data?.patient?.email ||
  record?.data?.user?.email ||
  null
);

const getPatientPhoneFromRecord = (record) => (
  record?.telefono ||
  record?.phone ||
  record?.data?.telefono ||
  record?.data?.phone ||
  record?.data?.patient?.phone ||
  record?.data?.user?.phone ||
  null
);

const toFiniteCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getGpsLocationFromRecord = (record) => {
  const sources = [
    record?.data?.gpsLocation,
    record?.data?.location,
    record?.data?.gps,
    record?.data?.coords,
    record?.location,
    record?.gps,
    record?.coords
  ].filter((item) => item && typeof item === 'object');

  for (const source of sources) {
    const latitude = toFiniteCoordinate(source?.latitude ?? source?.lat);
    const longitude = toFiniteCoordinate(source?.longitude ?? source?.lng ?? source?.lon);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const accuracy = toFiniteCoordinate(source?.accuracy);
      return {
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : null,
        capturedAt: source?.capturedAt || source?.timestamp || null
      };
    }
  }

  return null;
};

const DASHBOARD_ZERO_KEYS = ['heartRate', 'oxygenSaturation', 'stress', 'hrv', 'steps', 'systolic', 'diastolic', 'sleepTotalMinutes'];
const LIVE_LOCATION_REQUEST_TIMEOUT_SECONDS = 20;
const LIVE_LOCATION_REQUEST_POLL_INTERVAL_MS = 2000;
const EVENT_ROUTE_WINDOWS = [
  { id: '1h', label: 'Last hour' },
  { id: '6h', label: 'Last 6 hours' },
  { id: '24h', label: 'Last 24 hours' }
];
const EVENT_ROUTE_TRAVEL_MODES = [
  { id: 'walking', label: 'Caminar' },
  { id: 'driving', label: 'Conducir' },
  { id: 'bicycling', label: 'Bicicleta' },
  { id: 'transit', label: 'Public transit' }
];
const DEFAULT_GPS_CHECK_PAYLOAD = {
  email: '',
  action: 'cameraNotifyRsp@1',
  deviceId: 'WATCH-001',
  rawData: 'cameraNotifyRsp@1',
  location: {
    latitude: -33.4489,
    longitude: -70.6693
  }
};

const DEFAULT_PANIC_ALERT_CONTACTS = {
  emails: ['', '', ''],
  whatsapp: ''
};

const normalizePanicAlertContacts = (contacts = {}) => {
  const emails = Array.from({ length: 3 }, (_, index) => String(contacts?.emails?.[index] || '').trim());
  return {
    emails,
    whatsapp: String(contacts?.whatsapp || '').trim()
  };
};

const applyLoggedInUserContactDefaults = (contacts = {}, account = {}) => {
  const normalized = normalizePanicAlertContacts(contacts);
  const emails = [...normalized.emails];
  const accountEmail = String(account.email || '').trim().toLowerCase();
  const accountPhone = String(account.phone || '').trim();

  if (!emails.some(Boolean) && accountEmail) {
    emails[0] = accountEmail;
  }

  return {
    emails,
    whatsapp: normalized.whatsapp || accountPhone
  };
};

function DatosBiometricos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user, loading } = useAuth();
  const t = useT();
  // Event/panic tracking moved to /connect — keep legacy path detection for redirects
  const isEventTrackingOnlyView = location.pathname === '/seguimiento-events';
  const isBiometricOnlyView =
    location.pathname === '/datos-biometricos' || location.pathname === '/device';
  
  // State for biometric data
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [biometricData, setBiometricData] = useState([]);
  const [loadingBiometric, setLoadingBiometric] = useState(false);
  const [biometricError, setBiometricError] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deletingData, setDeletingData] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState('device'); // 'device' o 'all'
  const [deviceIdPendingDelete, setDeviceIdPendingDelete] = useState('');
  const [selectedRange, setSelectedRange] = useState('24h');
  const [selectedDayKey, setSelectedDayKey] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryGpsPreview, setSelectedHistoryGpsPreview] = useState(null);
  const [alertReport, setAlertReport] = useState(null);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loadingRiskAnalysis, setLoadingRiskAnalysis] = useState(false);
  const [riskAnalysisError, setRiskAnalysisError] = useState('');
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [watchEvents, setWatchEvents] = useState([]);
  const [loadingWatchEvents, setLoadingWatchEvents] = useState(false);
  const [watchEventsError, setWatchEventsError] = useState('');
  const [deletingWatchEvents, setDeletingWatchEvents] = useState(false);
  const [gpsCheckPayloadText, setGpsCheckPayloadText] = useState(() => JSON.stringify(DEFAULT_GPS_CHECK_PAYLOAD, null, 2));
  const [gpsCheckLoading, setGpsCheckLoading] = useState(false);
  const [gpsCheckError, setGpsCheckError] = useState('');
  const [gpsCheckResult, setGpsCheckResult] = useState(null);
  const [eventsSubmenu, setEventsSubmenu] = useState('configuracion');
  const [panicAlertContacts, setPanicAlertContacts] = useState(DEFAULT_PANIC_ALERT_CONTACTS);
  const [panicContactsSaving, setPanicContactsSaving] = useState(false);
  const [panicContactsContext, setPanicContactsContext] = useState({ reminders: [], eventAlerts: [] });
  const [panicContactsMessage, setPanicContactsMessage] = useState('');
  const [panicContactsError, setPanicContactsError] = useState('');
  const [eventRouteWindow, setEventRouteWindow] = useState('1h');
  const [eventRouteTravelMode, setEventRouteTravelMode] = useState('walking');
  const [eventRouteLoading, setEventRouteLoading] = useState(false);
  const [eventRouteError, setEventRouteError] = useState('');
  const [eventRouteResult, setEventRouteResult] = useState(null);

  const fetchDevices = async (preferredDeviceId = selectedDeviceId) => {
    setLoadingDevices(true);
    setBiometricError('');
    try {
      const response = await apiClient.get('/health/devices');
      if (response.data.success) {
        const nextDevices = response.data.data || [];
        setDevices(nextDevices);

        if (nextDevices.length === 0) {
          setSelectedDeviceId('');
          setBiometricData([]);
          return '';
        }

        const hasPreferredDevice = nextDevices.some((device) => device.deviceId === preferredDeviceId);
        const nextSelectedDeviceId = hasPreferredDevice ? preferredDeviceId : nextDevices[0].deviceId;
        setSelectedDeviceId(nextSelectedDeviceId);
        return nextSelectedDeviceId;
      } else {
        setBiometricError('Could not load the device list');
      }
    } catch (error) {
      console.error('Error fetching device list:', error);
      setBiometricError('Could not load devices: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingDevices(false);
    }

    return '';
  };

  const analyzeRiskWithAI = async () => {
    if (!selectedDeviceId) return;
    setLoadingRiskAnalysis(true);
    setRiskAnalysisError('');
    try {
      const response = await apiClient.post(`/health/devices/${selectedDeviceId}/risk-analysis`);
      if (response.data.success) {
        if (response.data.riskMetadata) {
          setRiskAnalysis(response.data.riskMetadata);
        } else {
          const latestRiskResponse = await apiClient.get(`/health/devices/${selectedDeviceId}/risk-analysis`);
          if (latestRiskResponse.data.success && latestRiskResponse.data.riskMetadata) {
            setRiskAnalysis(latestRiskResponse.data.riskMetadata);
          }
        }

        // Disparar refrescos secundarios sin bloquear el estado del botón de IA.
        fetchBiometricData(selectedDeviceId).catch((error) => {
          console.error('Error refreshing biometric history after risk analysis:', error);
        });
        fetchDevices(selectedDeviceId).catch((error) => {
          console.error('Error refreshing device list after risk analysis:', error);
        });
      } else {
        setRiskAnalysisError('Could not analyze risk.');
      }
    } catch (error) {
      console.error('Error analyzing risk:', error);
      setRiskAnalysisError('Could not analyze risk: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingRiskAnalysis(false);
    }
  };

  const fetchBiometricAlerts = async () => {
    setLoadingAlerts(true);
    setAlertsError('');

    try {
      const response = await apiClient.get('/health/alerts');
      if (response.data.success) {
        setAlertReport(response.data);
      } else {
        setAlertsError('Could not load biometric alerts');
      }
    } catch (error) {
      console.error('Error fetching biometric alerts:', error);
      setAlertsError('Could not load biometric alerts: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchWatchEvents = async () => {
    setLoadingWatchEvents(true);
    setWatchEventsError('');
    try {
      const response = await apiClient.get('/admin/watch-events', {
        params: { limit: 50 }
      });
      setWatchEvents(Array.isArray(response.data?.events) ? response.data.events : []);
    } catch (error) {
      console.error('Error fetching watch events:', error);
      setWatchEventsError('Could not load watch-button audit: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingWatchEvents(false);
    }
  };

  const clearWatchEventsHistory = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete ALL watch-button and help-event history? This cannot be undone.');
    if (!shouldDelete) return;

    setDeletingWatchEvents(true);
    setWatchEventsError('');
    try {
      const response = await apiClient.delete('/admin/watch-events');
      const deletedCount = response?.data?.deletedCount;
      setWatchEvents([]);
      await fetchWatchEvents();
      alert(`✅ History deleted successfully${Number.isFinite(deletedCount) ? ` (${deletedCount} events)` : ''}`);
    } catch (error) {
      console.error('Error deleting watch events history:', error);
      setWatchEventsError('Error deleting band button audit: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingWatchEvents(false);
    }
  };

  const fetchEventRouteHistory = useCallback(async (windowId = eventRouteWindow) => {
    const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId) || null;
    const selectedEmail = String(selectedDevice?.email || '').trim();

    if (!selectedEmail && !selectedDeviceId) {
      setEventRouteError('No device/email selected to query the route.');
      setEventRouteResult(null);
      return;
    }

    setEventRouteLoading(true);
    setEventRouteError('');

    try {
      const response = await apiClient.get('/mobile/routes/history', {
        params: {
          window: windowId,
          email: selectedEmail || undefined,
          deviceId: selectedDeviceId || undefined,
          limit: 1200
        }
      });

      const data = response?.data || {};
      const points = Array.isArray(data?.points)
        ? data.points
          .map((point) => {
            const latitude = Number(point?.latitude);
            const longitude = Number(point?.longitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
            return {
              latitude,
              longitude,
              timestamp: point?.timestamp || null,
              source: point?.source || null
            };
          })
          .filter(Boolean)
        : [];

      setEventRouteResult({
        ...data,
        points
      });
    } catch (error) {
      console.error('Error fetching event route history:', error);
      setEventRouteError(error.response?.data?.message || error.message || 'Could not load the tracking route.');
      setEventRouteResult(null);
    } finally {
      setEventRouteLoading(false);
    }
  }, [devices, selectedDeviceId, eventRouteWindow]);

  const fetchPanicAlertContacts = async () => {
    setPanicContactsError('');
    try {
      const { data } = await apiClient.get('/wellness/reminders');
      const account = {
        email: data?.accountEmail || user?.email,
        phone: data?.accountPhone || user?.phone
      };
      setPanicAlertContacts(
        applyLoggedInUserContactDefaults(data?.panicAlertContacts || {}, account)
      );
      setPanicContactsContext({
        reminders: Array.isArray(data?.reminders) ? data.reminders : [],
        eventAlerts: Array.isArray(data?.eventAlerts) ? data.eventAlerts : []
      });
    } catch (error) {
      console.error('Error fetching panic alert contacts:', error);
      setPanicContactsError('Could not load help alert contacts.');
    }
  };

  const updatePanicAlertEmail = (index, value) => {
    setPanicAlertContacts((current) => {
      const nextEmails = [...(current.emails || ['', '', ''])];
      nextEmails[index] = value;
      return { ...current, emails: nextEmails };
    });
  };

  const savePanicAlertContacts = async () => {
    setPanicContactsSaving(true);
    setPanicContactsError('');
    setPanicContactsMessage('');

    try {
      let reminders = panicContactsContext.reminders;
      let eventAlerts = panicContactsContext.eventAlerts;

      if (!Array.isArray(reminders) || reminders.length === 0 || !Array.isArray(eventAlerts) || eventAlerts.length === 0) {
        const { data } = await apiClient.get('/wellness/reminders');
        reminders = Array.isArray(data?.reminders) ? data.reminders : [];
        eventAlerts = Array.isArray(data?.eventAlerts) ? data.eventAlerts : [];
      }

      const payloadContacts = {
        emails: (panicAlertContacts.emails || []).map((email) => String(email || '').trim()).filter(Boolean),
        whatsapp: String(panicAlertContacts.whatsapp || '').trim()
      };

      const { data } = await apiClient.put('/wellness/reminders', {
        reminders,
        eventAlerts,
        panicAlertContacts: payloadContacts
      });

      setPanicAlertContacts(
        applyLoggedInUserContactDefaults(data?.panicAlertContacts || payloadContacts, {
          email: user?.email,
          phone: user?.phone
        })
      );
      setPanicContactsContext({
        reminders: Array.isArray(data?.reminders) ? data.reminders : reminders,
        eventAlerts: Array.isArray(data?.eventAlerts) ? data.eventAlerts : eventAlerts
      });
      setPanicContactsMessage('Help contacts saved successfully.');
    } catch (error) {
      console.error('Error saving panic alert contacts:', error);
      setPanicContactsError(error.response?.data?.message || 'Could not save help contacts.');
    } finally {
      setPanicContactsSaving(false);
    }
  };

  const fillGpsPayloadWithSelectedEmail = () => {
    try {
      const parsedPayload = JSON.parse(gpsCheckPayloadText || '{}');
      const selectedEmail = String(selectedDeviceMeta?.email || '').trim();
      if (!selectedEmail) {
        setGpsCheckError('The selected device has no email to autofill.');
        return;
      }

      const nextPayload = {
        ...parsedPayload,
        email: selectedEmail
      };
      setGpsCheckError('');
      setGpsCheckPayloadText(JSON.stringify(nextPayload, null, 2));
    } catch (error) {
      setGpsCheckError('Test JSON is invalid. Fix it before autofilling email.');
    }
  };

  const getCurrentBrowserPosition = () => new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error('Your browser does not support geolocation.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });

  const injectCurrentLocationIntoPayload = async (basePayload) => {
    const position = await getCurrentBrowserPosition();
    const latitude = Number(position?.coords?.latitude);
    const longitude = Number(position?.coords?.longitude);
    const accuracy = Number(position?.coords?.accuracy);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Could not get a valid GPS location from the browser.');
    }

    const nextLocation = (basePayload?.location && typeof basePayload.location === 'object')
      ? { ...basePayload.location }
      : {};
    const nextGps = (basePayload?.gps && typeof basePayload.gps === 'object')
      ? { ...basePayload.gps }
      : {};
    const nextCoords = (basePayload?.coords && typeof basePayload.coords === 'object')
      ? { ...basePayload.coords }
      : {};

    return {
      ...basePayload,
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
      location: {
        ...nextLocation,
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : nextLocation.accuracy
      },
      gps: {
        ...nextGps,
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : nextGps.accuracy
      },
      coords: {
        ...nextCoords,
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : nextCoords.accuracy
      },
      dashboardGpsCapturedAt: new Date(position.timestamp || Date.now()).toISOString()
    };
  };

  const runGpsCheck = async () => {
    setGpsCheckLoading(true);
    setGpsCheckError('');
    setGpsCheckResult(null);

    let payload;
    try {
      payload = JSON.parse(gpsCheckPayloadText || '{}');
    } catch (error) {
      setGpsCheckError('Invalid JSON. Check the format before sending.');
      setGpsCheckLoading(false);
      return;
    }

    try {
      const payloadWithCurrentLocation = await injectCurrentLocationIntoPayload(payload);
      setGpsCheckPayloadText(JSON.stringify(payloadWithCurrentLocation, null, 2));
      const response = await apiClient.post('/mobile/gps-check', payloadWithCurrentLocation);
      setGpsCheckResult(response.data || null);
    } catch (error) {
      setGpsCheckError(error.response?.data?.message || error.message || 'Could not validate GPS');
    } finally {
      setGpsCheckLoading(false);
    }
  };

  const runOnDemandCurrentLocationCheck = async () => {
    setGpsCheckError('');
    setGpsCheckResult(null);

    const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId) || null;
    const selectedEmail = String(selectedDevice?.email || '').trim();

    if (!selectedEmail) {
      setGpsCheckError('The selected device has no email to request current location.');
      return;
    }

    setGpsCheckLoading(true);

    try {
      const createResponse = await apiClient.post('/mobile/location-requests', {
        email: selectedEmail,
        deviceId: selectedDeviceId || undefined,
        timeoutSeconds: LIVE_LOCATION_REQUEST_TIMEOUT_SECONDS
      });

      const requestId = createResponse?.data?.requestId;
      if (!requestId) {
        throw new Error('Could not create the live location request.');
      }

      const requestPreviewPayload = {
        command: 'capture_current_location',
        requestId,
        email: selectedEmail,
        deviceId: selectedDeviceId || null,
        requestedAt: createResponse?.data?.requestedAt || new Date().toISOString(),
        expiresAt: createResponse?.data?.expiresAt || null
      };
      setGpsCheckPayloadText(JSON.stringify(requestPreviewPayload, null, 2));

      setGpsCheckResult({
        success: true,
        status: 'pending',
        requestId,
        dashboardNotice: 'Request sent to the mobile app. Waiting for live GPS…',
        message: 'Location request in progress.'
      });

      const startedAtMs = Date.now();
      while (Date.now() - startedAtMs <= (LIVE_LOCATION_REQUEST_TIMEOUT_SECONDS * 1000)) {
        await new Promise((resolve) => setTimeout(resolve, LIVE_LOCATION_REQUEST_POLL_INTERVAL_MS));

        const statusResponse = await apiClient.get(`/mobile/location-requests/${requestId}/status`, {
          params: { t: Date.now() }
        });
        const statusData = statusResponse?.data || {};
        const status = String(statusData?.status || '').toLowerCase();

        if (status === 'pending') {
          const pollCount = Number(statusData?.mobilePollCount) || 0;
          const lastMobilePollAt = statusData?.lastMobilePollAt || null;
          const pendingNotice = pollCount > 0
            ? `Mobile app already polled pending requests (${pollCount} ${pollCount === 1 ? 'time' : 'times'}). Last poll: ${lastMobilePollAt ? formatDate(lastMobilePollAt) : 'N/A'}.`
            : 'Waiting for the mobile app to poll pending requests.';

          setGpsCheckResult((current) => ({
            ...(current || {}),
            success: true,
            status: 'pending',
            requestId,
            message: statusData?.message || 'Location request in progress.',
            dashboardNotice: pendingNotice,
            lastMobilePollAt,
            mobilePollCount: pollCount,
            expiresAt: statusData?.expiresAt || null
          }));
          continue;
        }

        if (status === 'completed') {
          const receivedPayload = statusData?.receivedPayload || {};
          setGpsCheckPayloadText(JSON.stringify(receivedPayload, null, 2));
          setGpsCheckResult({
            success: true,
            message: statusData?.message || 'Location received from the mobile app.',
            gps: statusData?.gps || null,
            matchedUser: Boolean(statusData?.matchedUser),
            receivedAt: statusData?.respondedAt || new Date().toISOString(),
            dashboardNotice: 'Live location received from the mobile app.'
          });
          return;
        }

        if (status === 'failed' || status === 'expired') {
          const pollCount = Number(statusData?.mobilePollCount) || 0;
          const extra = pollCount > 0
            ? ` Mobile app did poll pending requests (${pollCount} times), but did not send valid GPS.`
            : ' The mobile app did not poll pending requests in time.';
          setGpsCheckError((statusData?.message || 'The mobile app could not return live location.') + extra);
          return;
        }
      }

      setGpsCheckError('Timed out. The mobile app did not respond with live location.');
    } catch (error) {
      setGpsCheckError(
        error.response?.data?.message || error.message || 'Could not get GPS position from the band/mobile app'
      );
    } finally {
      setGpsCheckLoading(false);
    }
  };

  // Fetch biometric data for device
  const fetchBiometricData = async (deviceId) => {
    if (!deviceId) {
      setBiometricData([]);
      return;
    }

    setLoadingBiometric(true);
    setBiometricError('');
    try {
      const response = await apiClient.get(`/health/devices/${deviceId}`);
      if (response.data.success) {
        setBiometricData(response.data.data);
      } else {
        setBiometricError('Could not load biometric data');
      }
    } catch (error) {
      console.error('Error fetching biometric data:', error);
      setBiometricError('Error fetching device data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingBiometric(false);
    }
  };

  // Delete biometric data for device
  const deleteDeviceData = async (deviceId) => {
    if (!deviceId) {
      return;
    }

    setDeletingData(true);
    try {
      const response = await apiClient.delete(`/health/devices/${deviceId}`);
      if (response.data.success) {
        setBiometricData([]);
        if (showHistoryModal && deviceId === selectedDeviceId) {
          setShowHistoryModal(false);
          setSelectedHistoryGpsPreview(null);
        }
        await fetchDevices();
        await fetchBiometricAlerts();
        alert(`✅ Deleted ${response.data.deletedCount} records for device ${deviceId}`);
      } else {
        alert('❌ Error deleting data');
      }
    } catch (error) {
      console.error('Error deleting device data:', error);
      alert('❌ Error deleting data: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingData(false);
      setShowDeleteConfirm(false);
    }
  };

  // Función para borrar todos los datos
  const deleteAllData = async () => {
    setDeletingData(true);
    try {
      const response = await apiClient.delete('/health/data');
      if (response.data.success) {
        setBiometricData([]);
        await fetchDevices();
        await fetchBiometricAlerts();
        alert(`✅ Deleted ${response.data.deletedCount} biometric records`);
      } else {
        alert('❌ Error deleting all data');
      }
    } catch (error) {
      console.error('Error deleting all data:', error);
      alert('❌ Error deleting all data: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingData(false);
      setShowDeleteConfirm(false);
    }
  };

  const deleteSingleRecord = async (recordId) => {
    if (!recordId) {
      return;
    }

    const shouldDelete = window.confirm('Are you sure you want to delete this biometric record?');
    if (!shouldDelete) {
      return;
    }

    setDeletingRecordId(recordId);
    try {
      const response = await apiClient.delete(`/health/records/${recordId}`);
      if (response.data.success) {
        await fetchBiometricData(selectedDeviceId);
        await fetchDevices();
        await fetchBiometricAlerts();
      } else {
        alert('❌ Error deleting the record');
      }
    } catch (error) {
      console.error('Error deleting biometric record:', error);
      alert('❌ Error deleting record: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingRecordId('');
    }
  };

  const openHistoryModal = async (deviceId) => {
    if (!deviceId) {
      return;
    }

    setSelectedRange('24h');
    setSelectedDayKey('');
    setSelectedHistoryGpsPreview(null);
    setShowHistoryModal(true);

    if (deviceId !== selectedDeviceId) {
      setBiometricData([]);
      setSelectedDeviceId(deviceId);
      return;
    }

    await fetchBiometricData(deviceId);
  };

  const handleRefreshClick = async () => {
    setIsManualRefresh(true);

    try {
      const refreshedDeviceId = await fetchDevices(selectedDeviceId);
      const shouldFetchHistoryDirectly = refreshedDeviceId && refreshedDeviceId === selectedDeviceId;

      if (shouldFetchHistoryDirectly) {
        await fetchBiometricData(refreshedDeviceId);
      }

      await fetchBiometricAlerts();
      setLastRefreshAt(new Date());
    } finally {
      setIsManualRefresh(false);
    }
  };

  const refreshButtonLabel = (() => {
    if (!isManualRefresh) {
      return 'Refresh';
    }

    if (loadingDevices) {
      return 'Updating list…';
    }

    if (loadingBiometric) {
      return 'Updating history…';
    }

    if (loadingAlerts) {
      return 'Updating alerts…';
    }

    return 'Updating…';
  })();

  const isRefreshBusy = isManualRefresh || loadingDevices || loadingBiometric || loadingAlerts;
  const lastRefreshLabel = lastRefreshAt
    ? `Last successful update: ${lastRefreshAt.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`
    : 'No manual update recorded yet.';

  // Función para manejar confirmación de borrado
  const handleDeleteClick = (type, deviceId = selectedDeviceId) => {
    if (type === 'device' && !deviceId) {
      return;
    }

    setDeleteType(type);
    setDeviceIdPendingDelete(deviceId || '');
    setShowDeleteConfirm(true);
  };

  // Función para confirmar borrado
  const confirmDelete = () => {
    if (deleteType === 'device') {
      deleteDeviceData(deviceIdPendingDelete || selectedDeviceId);
    } else {
      deleteAllData();
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    if (!user) return;

    if (isEventTrackingOnlyView) {
      fetchPanicAlertContacts();
      if (isAdmin) {
        fetchDevices();
        fetchBiometricAlerts();
        fetchWatchEvents();
      }
      return;
    }

    if (!isAdmin) return;

    fetchDevices();
    fetchBiometricAlerts();
    fetchWatchEvents();
    fetchPanicAlertContacts();
  }, [user, isAdmin, isEventTrackingOnlyView]);

  useEffect(() => {
    if (!loading && isEventTrackingOnlyView && !user) {
      navigate('/login', { replace: true, state: { from: '/seguimiento-events' } });
    }
  }, [loading, user, isEventTrackingOnlyView, navigate]);

  useEffect(() => {
    if (isEventTrackingOnlyView && !isAdmin && eventsSubmenu === 'trazabilidad') {
      setEventsSubmenu('configuracion');
    }
  }, [isEventTrackingOnlyView, isAdmin, eventsSubmenu]);

  useEffect(() => {
    if (!isAdmin) return;

    const intervalId = setInterval(() => {
      fetchWatchEvents();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isAdmin]);

  useEffect(() => {
    if (selectedDeviceId) {
      fetchBiometricData(selectedDeviceId);
    } else {
      setBiometricData([]);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    const isTrackingContext = isEventTrackingOnlyView || eventsSubmenu === 'trazabilidad';
    if (!isTrackingContext) return;
    if (!selectedDeviceId) {
      setEventRouteResult(null);
      return;
    }

    fetchEventRouteHistory(eventRouteWindow);
  }, [selectedDeviceId, eventRouteWindow, isEventTrackingOnlyView, eventsSubmenu, fetchEventRouteHistory]);

  // Función para formatear la fecha
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const historicalData = useMemo(() => {
    const sortedData = [...biometricData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const now = Date.now();
    const rangeMs = CHART_RANGE_MS[selectedRange] || CHART_RANGE_MS['24h'];

    return sortedData.filter((record) => now - new Date(record.timestamp).getTime() <= rangeMs);
  }, [biometricData, selectedRange]);

  const metricSeries = useMemo(() => {
    return METRIC_CONFIGS.map((metric) => {
      const points = buildChartPoints(historicalData, metric.getValue, selectedRange, metric.key);

      return {
        ...metric,
        points,
        latestValue: points.length > 0 ? points[points.length - 1].value : null,
        minValue: points.length > 0 ? Math.min(...points.map((point) => point.value)) : null,
        maxValue: points.length > 0 ? Math.max(...points.map((point) => point.value)) : null
      };
    }).filter((metric) => metric.points.length > 0);
  }, [historicalData, selectedRange]);

  const dailySummaries = useMemo(() => {
    const groupedByDay = historicalData.reduce((acc, record) => {
      const dayKey = formatDayKey(record.timestamp);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(record);
      return acc;
    }, {});

    return Object.entries(groupedByDay)
      .map(([dayKey, records]) => {
        const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const metrics = DAILY_SUMMARY_METRICS.map(({ key, aggregate }) => {
          const metricConfig = getMetricConfig(key);
          const values = sortedRecords
            .map((record) => metricConfig?.getValue(record))
            .filter((value) => typeof value === 'number' && Number.isFinite(value));

          return {
            key,
            label: metricConfig?.label || key,
            unit: metricConfig?.unit || '',
            color: metricConfig?.color || '#1F2937',
            value: aggregateMetricValues(values, aggregate)
          };
        }).filter((metric) => metric.value !== null);

        return {
          dayKey,
          records: sortedRecords,
          metrics,
          latestRecord: sortedRecords[sortedRecords.length - 1] || null
        };
      })
      .sort((a, b) => new Date(b.dayKey) - new Date(a.dayKey));
  }, [historicalData]);

  const dailyDashboardDays = useMemo(() => {
    const groupedByDay = biometricData.reduce((acc, record) => {
      const dayKey = formatDayKey(record.timestamp);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(record);
      return acc;
    }, {});

    return Object.keys(groupedByDay).sort((left, right) => new Date(right) - new Date(left));
  }, [biometricData]);

  const activeDailyDashboard = useMemo(() => {
    if (!selectedDayKey) {
      return null;
    }

    const dayRecords = biometricData.filter((record) => formatDayKey(record.timestamp) === selectedDayKey);
    if (dayRecords.length === 0) {
      return null;
    }

    return buildDailyBiometricDashboard(dayRecords);
  }, [biometricData, selectedDayKey]);

  useEffect(() => {
    if (dailyDashboardDays.length === 0) {
      setSelectedDayKey('');
      return;
    }

    setSelectedDayKey((currentDayKey) => {
      const hasCurrentDay = dailyDashboardDays.includes(currentDayKey);
      return hasCurrentDay ? currentDayKey : dailyDashboardDays[0];
    });
  }, [dailyDashboardDays]);

  const latestRecord = historicalData[historicalData.length - 1] || null;
  const latestRiskMetadata = riskAnalysis || latestRecord?.riskMetadata || latestRecord?.data?.riskMetadata || null;
  const sleepRecords = useMemo(
    () => [...biometricData]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .filter((record) => buildSleepAnalysis(record?.data?.sleepData)),
    [biometricData]
  );
  const selectedDeviceMeta = useMemo(
    () => devices.find((device) => device.deviceId === selectedDeviceId) || null,
    [devices, selectedDeviceId]
  );
  const patientName = selectedDeviceMeta?.patientName || getPatientNameFromRecord(latestRecord) || 'Patient not specified';
  const patientEmail = selectedDeviceMeta?.email || latestRecord?.email || 'Not specified';
  const patientPhone = selectedDeviceMeta?.telefono || latestRecord?.telefono || 'Not specified';
  const patientPersonalId = selectedDeviceMeta?.idpersonal || getPatientIdFromRecord(latestRecord) || 'Not specified';
  const latestPanicAlert = useMemo(() => {
    if (!Array.isArray(watchEvents) || watchEvents.length === 0) return null;
    return watchEvents.find((event) => event?.data?.type === 'panic_alert') || null;
  }, [watchEvents]);
  const latestPanicLocation = latestPanicAlert?.data?.location;
  const latestPanicHasLocation = Number.isFinite(latestPanicLocation?.latitude)
    && Number.isFinite(latestPanicLocation?.longitude);
  const latestPanicMapUrl = latestPanicAlert?.data?.mapUrl || (latestPanicHasLocation
    ? `https://www.google.com/maps?q=${latestPanicLocation.latitude},${latestPanicLocation.longitude}`
    : null);
  const latestPanicEmbedUrl = latestPanicHasLocation
    ? `https://maps.google.com/maps?q=${latestPanicLocation.latitude},${latestPanicLocation.longitude}&z=16&output=embed`
    : null;
  const latestPanicTargetEmails = Array.isArray(latestPanicAlert?.data?.notificationTargets?.emails)
    ? latestPanicAlert.data.notificationTargets.emails.filter(Boolean)
    : [];
  const latestPanicTargetWhatsapp = latestPanicAlert?.data?.notificationTargets?.whatsapp || '';
  const latestPanicWhatsappLink = latestPanicTargetWhatsapp
    ? `https://wa.me/${String(latestPanicTargetWhatsapp).replace(/[^0-9]/g, '')}`
    : null;
  const groupedWatchEvents = useMemo(() => {
    if (!Array.isArray(watchEvents) || watchEvents.length === 0) return [];

    const sortedEvents = [...watchEvents].sort((left, right) => new Date(right?.logDate || 0) - new Date(left?.logDate || 0));
    const usedPanicIndexes = new Set();
    const groups = [];

    const getEventTimeMs = (event) => {
      const date = new Date(event?.logDate || event?.data?.triggeredAt || 0);
      const time = date.getTime();
      return Number.isFinite(time) ? time : 0;
    };

    sortedEvents.forEach((event, index) => {
      const eventType = event?.data?.type;
      if (eventType !== 'watch_button_event') return;

      const eventTimeMs = getEventTimeMs(event);
      const eventUserId = String(event?.userId || '');
      const eventDeviceId = String(event?.data?.deviceId || '');
      const eventSource = String(event?.data?.source || '');

      let closestPanicIndex = -1;
      let closestDelta = Number.POSITIVE_INFINITY;

      sortedEvents.forEach((candidate, candidateIndex) => {
        if (candidate?.data?.type !== 'panic_alert') return;
        if (usedPanicIndexes.has(candidateIndex)) return;

        const sameUser = String(candidate?.userId || '') === eventUserId;
        const sameDevice = String(candidate?.data?.deviceId || '') === eventDeviceId;
        const sameSource = String(candidate?.data?.source || '') === eventSource;
        if (!sameUser || !sameDevice || !sameSource) return;

        const deltaMs = Math.abs(getEventTimeMs(candidate) - eventTimeMs);
        if (deltaMs <= 15000 && deltaMs < closestDelta) {
          closestDelta = deltaMs;
          closestPanicIndex = candidateIndex;
        }
      });

      if (closestPanicIndex >= 0) {
        usedPanicIndexes.add(closestPanicIndex);
        groups.push({ watchEvent: event, panicEvent: sortedEvents[closestPanicIndex] });
      } else {
        groups.push({ watchEvent: event, panicEvent: null });
      }
    });

    sortedEvents.forEach((event, index) => {
      if (event?.data?.type === 'panic_alert' && !usedPanicIndexes.has(index)) {
        groups.push({ watchEvent: null, panicEvent: event });
      }
    });

    return groups.sort((left, right) => {
      const leftEvent = left.watchEvent || left.panicEvent;
      const rightEvent = right.watchEvent || right.panicEvent;
      return new Date(rightEvent?.logDate || 0) - new Date(leftEvent?.logDate || 0);
    });
  }, [watchEvents]);
  const gpsCheckLatitude = Number.isFinite(Number(gpsCheckResult?.gps?.latitude))
    ? Number(gpsCheckResult.gps.latitude)
    : null;
  const gpsCheckLongitude = Number.isFinite(Number(gpsCheckResult?.gps?.longitude))
    ? Number(gpsCheckResult.gps.longitude)
    : null;
  const gpsCheckHasLocation = Number.isFinite(gpsCheckLatitude) && Number.isFinite(gpsCheckLongitude);
  const gpsCheckMapUrl = gpsCheckResult?.gps?.mapUrl || (gpsCheckHasLocation
    ? `https://www.google.com/maps?q=${gpsCheckLatitude},${gpsCheckLongitude}`
    : null);
  const gpsCheckEmbedUrl = gpsCheckHasLocation
    ? `https://maps.google.com/maps?q=${gpsCheckLatitude},${gpsCheckLongitude}&z=16&output=embed`
    : null;
  const gpsCheckReceivedAt = gpsCheckResult?.receivedAt || null;
  const gpsCheckReceivedAtDate = gpsCheckReceivedAt ? new Date(gpsCheckReceivedAt) : null;
  const gpsCheckReceivedAtLabel = gpsCheckReceivedAtDate && !Number.isNaN(gpsCheckReceivedAtDate.getTime())
    ? gpsCheckReceivedAtDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : 'Not available';
  const gpsCheckExactTimeLabel = gpsCheckReceivedAtDate && !Number.isNaN(gpsCheckReceivedAtDate.getTime())
    ? gpsCheckReceivedAtDate.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : 'Not available';
  const eventRouteStartLabel = eventRouteResult?.since ? formatDate(eventRouteResult.since) : 'N/A';
  const eventRouteEndLabel = eventRouteResult?.until ? formatDate(eventRouteResult.until) : 'N/A';
  const eventRouteDistanceLabel = formatExerciseDistance(Number(eventRouteResult?.totalDistanceMeters || 0));
  const eventRouteGoogleMapsUrl = buildGoogleMapsDirectionsUrl(eventRouteResult?.points || [], eventRouteTravelMode);

  const patientDashboardRows = useMemo(() => {
    return devices.map((device) => {
      const metrics = device.latestMetrics || {};
      const zeroMetricKeys = DASHBOARD_ZERO_KEYS.filter((key) => metrics[key] === 0);

      return {
        deviceId: device.deviceId,
        email: device.email || 'No email',
        patientName: device.patientName || 'Patient not specified',
        idpersonal: device.idpersonal || 'Not specified',
        latestUpdate: device.latestUpdate,
        totalRecords: device.totalRecords || 0,
        zeroMetricKeys,
        hasZeroMetrics: zeroMetricKeys.length > 0,
        metrics
      };
    }).sort((a, b) => {
      if (a.hasZeroMetrics !== b.hasZeroMetrics) {
        return a.hasZeroMetrics ? -1 : 1;
      }

      return new Date(b.latestUpdate || 0) - new Date(a.latestUpdate || 0);
    });
  }, [devices]);

  const historicalGridRows = useMemo(() => {
    return biometricData.map((record) => {
      const heartRate = getHeartRateValue(record);
      const oxygenSaturation = getOxygenSaturationValue(record);
      const stress = getStressValue(record);
      const hrv = getHrvValue(record);
      const steps = getStepsValue(record);
      const systolic = getSystolicValue(record);
      const diastolic = getDiastolicValue(record);
      const sleepTotalMinutes = getSleepMetricValue(record, ['totalMinutes', 'total', 'sleep_duration_total', { name: 'totalSleepDuration', transform: (value) => Math.round(value / 60) }]);
      const gpsLocation = getGpsLocationFromRecord(record);
      const gpsMapUrl = gpsLocation
        ? `https://www.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}`
        : null;
      const zeroMetricKeys = [
        ['heartRate', heartRate],
        ['oxygenSaturation', oxygenSaturation],
        ['stress', stress],
        ['hrv', hrv],
        ['steps', steps],
        ['systolic', systolic],
        ['diastolic', diastolic],
        ['sleepTotalMinutes', sleepTotalMinutes]
      ].filter(([, value]) => value === 0).map(([key]) => key);

      return {
        _id: record._id,
        timestamp: record.timestamp,
        patientName: getPatientNameFromRecord(record) || 'Patient not specified',
        patientEmail: getPatientEmailFromRecord(record) || 'Not specified',
        patientPhone: getPatientPhoneFromRecord(record) || 'Not specified',
        patientId: getPatientIdFromRecord(record) || 'Not specified',
        heartRate,
        oxygenSaturation,
        stress,
        hrv,
        steps,
        systolic,
        diastolic,
        sleepTotalMinutes,
        gpsLocation,
        gpsMapUrl,
        zeroMetricKeys,
        hasZeroMetrics: zeroMetricKeys.length > 0
      };
    });
  }, [biometricData]);

  useEffect(() => {
    if (!showHistoryModal) return;
    if (selectedHistoryGpsPreview) return;

    const firstWithGps = historicalGridRows.find((row) => row.gpsLocation && row.gpsMapUrl);
    if (firstWithGps) {
      setSelectedHistoryGpsPreview({
        rowId: firstWithGps._id || firstWithGps.timestamp,
        patientName: firstWithGps.patientName,
        timestamp: firstWithGps.timestamp,
        latitude: firstWithGps.gpsLocation.latitude,
        longitude: firstWithGps.gpsLocation.longitude,
        mapUrl: firstWithGps.gpsMapUrl
      });
    }
  }, [showHistoryModal, historicalGridRows, selectedHistoryGpsPreview]);

  const getAlertSeverityClasses = (severity) => {
    if (severity === 'critical') {
      return 'bg-red-100 text-red-800 border-red-200';
    }

    if (severity === 'warning') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }

    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const overviewCards = useMemo(() => {
    const heartRateMetric = metricSeries.find((metric) => metric.key === 'heartRate');
    const stressMetric = metricSeries.find((metric) => metric.key === 'stress');
    const hrvMetric = metricSeries.find((metric) => metric.key === 'hrv');
    const sleepMetric = metricSeries.find((metric) => metric.key === 'sleepTotal');

    return [
      {
        label: 'Heart rate actual',
        value: heartRateMetric ? formatMetricValue(heartRateMetric.latestValue, heartRateMetric.unit) : 'N/A',
        tone: 'bg-red-50 text-red-700'
      },
      {
        label: 'Stress reciente',
        value: stressMetric ? formatMetricValue(stressMetric.latestValue, stressMetric.unit) : 'N/A',
        tone: 'bg-violet-50 text-violet-700'
      },
      {
        label: 'HRV reciente',
        value: hrvMetric ? formatMetricValue(hrvMetric.latestValue, hrvMetric.unit) : 'N/A',
        tone: 'bg-cyan-50 text-cyan-700'
      },
      {
        label: 'Most recent total sleep',
        value: sleepMetric ? formatMetricValue(sleepMetric.latestValue, sleepMetric.unit) : 'N/A',
        tone: 'bg-indigo-50 text-indigo-700'
      }
    ];
  }, [metricSeries]);

  const formatMinutesOfDay = (minutes) => {
    if (typeof minutes !== 'number' || !Number.isFinite(minutes)) {
      return null;
    }

    const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
    const hours = Math.floor(normalizedMinutes / 60);
    const remainingMinutes = normalizedMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  };

  const formatChartTimestamp = (timestamp, rangeId) => {
    if (rangeId === '24h') {
      return formatTime(timestamp);
    }

    if (rangeId === '7d') {
      return new Date(timestamp).toLocaleString('en-US', {
        weekday: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return formatDayLabel(formatDayKey(timestamp));
  };

  const HistoricalMetricChart = ({ metric, rangeId }) => {
    const width = 640;
    const height = 180;
    const padding = 28;
    const points = metric.points;

    if (points.length === 0) {
      return null;
    }

    const values = points.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    const polylinePoints = points.map((point, index) => {
      const x = padding + ((width - padding * 2) * index) / Math.max(points.length - 1, 1);
      const normalizedY = (point.value - minValue) / valueRange;
      const y = height - padding - normalizedY * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${polylinePoints} ${padding + ((width - padding * 2) * (points.length - 1)) / Math.max(points.length - 1, 1)},${height - padding}`;

    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{metric.label}</h4>
            <p className="text-2xl font-bold" style={{ color: metric.color }}>
              {formatMetricValue(metric.latestValue, metric.unit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{points.length} puntos en el rango</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Min: {formatMetricValue(metric.minValue, metric.unit)}</p>
            <p>Max: {formatMetricValue(metric.maxValue, metric.unit)}</p>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" role="img" aria-label={`Chart de ${metric.label}`}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="1" />
          <polygon points={areaPoints} fill={metric.color} fillOpacity="0.12" />
          <polyline
            fill="none"
            stroke={metric.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polylinePoints}
          />
          {points.map((point, index) => {
            const x = padding + ((width - padding * 2) * index) / Math.max(points.length - 1, 1);
            const normalizedY = (point.value - minValue) / valueRange;
            const y = height - padding - normalizedY * (height - padding * 2);
            return <circle key={`${metric.key}-${point.timestamp}-${index}`} cx={x} cy={y} r="3.5" fill={metric.color} />;
          })}
        </svg>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatChartTimestamp(points[0].timestamp, rangeId)}</span>
          <span>{formatChartTimestamp(points[points.length - 1].timestamp, rangeId)}</span>
        </div>
      </div>
    );
  };

  const HistoricalGridTable = () => (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 pr-4 font-medium">Patient</th>
            <th className="py-3 pr-4 font-medium">Email</th>
            <th className="py-3 pr-4 font-medium">Telefono</th>
            <th className="py-3 pr-4 font-medium">FC</th>
            <th className="py-3 pr-4 font-medium">Oxygen</th>
            <th className="py-3 pr-4 font-medium">Stress</th>
            <th className="py-3 pr-4 font-medium">HRV</th>
            <th className="py-3 pr-4 font-medium">Steps</th>
            <th className="py-3 pr-4 font-medium">Blood pressure</th>
            <th className="py-3 pr-4 font-medium">Sleep</th>
            <th className="py-3 pr-4 font-medium">GPS</th>
            <th className="py-3 pr-0 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {historicalGridRows.map((row) => (
            <tr
              key={row._id || row.timestamp}
              className={row.hasZeroMetrics ? 'bg-red-50 border-b border-red-100' : 'border-b border-gray-100'}
              title={row.hasZeroMetrics ? `Zero values: ${row.zeroMetricKeys.join(', ')}` : ''}
            >
              <td className="py-3 pr-4 align-top whitespace-nowrap text-gray-700">{formatDate(row.timestamp)}</td>
              <td className="py-3 pr-4 align-top">
                <div className="font-medium text-gray-900">{row.patientName}</div>
                <div className="text-xs text-gray-500">{row.patientId}</div>
              </td>
              <td className="py-3 pr-4 align-top text-gray-700 break-all">{row.patientEmail}</td>
              <td className="py-3 pr-4 align-top text-gray-700 break-all">{row.patientPhone}</td>
              <td className={`py-3 pr-4 align-top ${row.heartRate === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>{row.heartRate ?? 'N/A'}</td>
              <td className={`py-3 pr-4 align-top ${row.oxygenSaturation === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                {row.oxygenSaturation ?? 'N/A'}{typeof row.oxygenSaturation === 'number' ? '%' : ''}
              </td>
              <td className={`py-3 pr-4 align-top ${row.stress === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>{row.stress ?? 'N/A'}</td>
              <td className={`py-3 pr-4 align-top ${row.hrv === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                {row.hrv ?? 'N/A'}{typeof row.hrv === 'number' ? ' ms' : ''}
              </td>
              <td className={`py-3 pr-4 align-top ${row.steps === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>{row.steps ?? 'N/A'}</td>
              <td className={`py-3 pr-4 align-top ${(row.systolic === 0 || row.diastolic === 0) ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                {(typeof row.systolic === 'number' || typeof row.diastolic === 'number')
                  ? `${row.systolic ?? 'N/A'}/${row.diastolic ?? 'N/A'}`
                  : 'N/A'}
              </td>
              <td className={`py-3 pr-4 align-top ${row.sleepTotalMinutes === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                {typeof row.sleepTotalMinutes === 'number' ? formatMetricValue(row.sleepTotalMinutes, 'min') : 'N/A'}
              </td>
              <td className="py-3 pr-4 align-top text-gray-700">
                {row.gpsLocation
                  ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">
                        {row.gpsLocation.latitude.toFixed(5)}, {row.gpsLocation.longitude.toFixed(5)}
                      </span>
                      {row.gpsLocation.accuracy !== null && (
                        <span className="text-xs text-gray-500">±{Math.round(row.gpsLocation.accuracy)} m</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryGpsPreview({
                          rowId: row._id || row.timestamp,
                          patientName: row.patientName,
                          timestamp: row.timestamp,
                          latitude: row.gpsLocation.latitude,
                          longitude: row.gpsLocation.longitude,
                          mapUrl: row.gpsMapUrl
                        })}
                        className="text-xs text-violet-700 hover:text-violet-800 underline text-left"
                      >
                        Previsualizar
                      </button>
                      {row.gpsMapUrl && (
                        <a
                          href={row.gpsMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Ver mapa
                        </a>
                      )}
                    </div>
                  )
                  : 'N/A'}
              </td>
              <td className="py-3 pr-0 align-top">
                <button
                  type="button"
                  onClick={() => deleteSingleRecord(row._id)}
                  disabled={deletingRecordId === row._id}
                  className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {deletingRecordId === row._id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Función para obtener el icono apropiado
  const getIcon = (key, value) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes('cardiaca') || normalizedKey.includes('heartrate')) return <FaHeartbeat className="text-red-500 mr-1" />;
    if (normalizedKey.includes('sleep') || normalizedKey.includes('sueño')) return <FaBed className="text-purple-500 mr-1" />;
    if (normalizedKey.includes('dream') || normalizedKey.includes('rem')) return <FaMoon className="text-indigo-500 mr-1" />;
    if (normalizedKey.includes('duration') || normalizedKey.includes('duracion') || normalizedKey.includes('minutes')) return <FaClock className="text-blue-500 mr-1" />;
    if (normalizedKey.includes('bateria') || normalizedKey.includes('battery')) {
      const batteryLevel = typeof value === 'number' ? value : parseInt(value) || 0;
      if (batteryLevel > 75) return <FaBatteryFull className="text-green-500 mr-1" />;
      if (batteryLevel > 25) return <FaBatteryHalf className="text-yellow-500 mr-1" />;
      return <FaBatteryQuarter className="text-red-500 mr-1" />;
    }
    return null;
  };

  // Función para formatear el valor
  const formatValue = (key, value) => {
    if (typeof value === 'object') return JSON.stringify(value);

    const normalizedKey = key.toLowerCase();

    if (normalizedKey.includes('bateria') || normalizedKey.includes('battery')) {
      const batteryLevel = typeof value === 'number' ? value : parseInt(value) || 0;
      return `${batteryLevel}%`;
    }

    if (normalizedKey.includes('sleeptime') || normalizedKey.includes('waketime')) {
      const timeLabel = formatMinutesOfDay(value);
      return timeLabel || value;
    }

    if (normalizedKey.includes('totalsleepduration') || normalizedKey.includes('deepsleepduration') || normalizedKey.includes('shallowsleepduration') || normalizedKey.includes('rapidduration') || normalizedKey.includes('awakeduration')) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
    }

    if (normalizedKey.includes('sleep') && normalizedKey.includes('minutes')) {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
    }

    if (normalizedKey.includes('duration') || normalizedKey.includes('duracion')) {
      if (typeof value === 'number') {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      }
    }

    if ((normalizedKey.includes('temperatura') || normalizedKey.includes('temperature')) && typeof value === 'number') {
      return `${value}°C`;
    }

    if (normalizedKey.includes('cardiaca') || normalizedKey.includes('heartrate')) {
      return `${value} bpm`;
    }

    if (normalizedKey.includes('oxigeno') || normalizedKey.includes('oxygen')) {
      return `${value}%`;
    }

    if ((normalizedKey.includes('presion') || normalizedKey.includes('bloodpressure')) && typeof value === 'number') {
      return `${value} mmHg`;
    }

    return value;
  };

  // Función para obtener el color de fondo basado en el tipo de dato
  const getBackgroundColor = (key) => {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes('sleep') || normalizedKey.includes('sueño') || normalizedKey.includes('rem')) return 'bg-purple-50';
    if (normalizedKey.includes('bateria') || normalizedKey.includes('battery') || normalizedKey.includes('steps')) return 'bg-green-50';
    if (normalizedKey.includes('temperatura') || normalizedKey.includes('temperature')) return 'bg-orange-50';
    if (normalizedKey.includes('cardiaca') || normalizedKey.includes('heartrate') || normalizedKey.includes('bloodpressure')) return 'bg-red-50';
    return 'bg-white';
  };

  const AccessDenied = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 mb-8">
            <FaExclamationTriangle className="text-amber-500 text-6xl mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{t('app.common.signInPrompt')}</h1>
            <p className="text-slate-700 text-lg mb-6">
              {t('app.device.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-md transition-colors"
              >
                {t('app.common.signInPrompt')}
              </button>
              <button
                onClick={() => navigate('/account')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors"
              >
                {t('app.nav.profile')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEventTrackingOnlyView) {
    return <Navigate to="/connect" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AccessDenied />;
  }

  // Dead branch retained for structure; event view redirects above
  if (false && isEventTrackingOnlyView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                <FaHeartbeat className="text-red-500 mr-3" />
                Seguimiento de Alertas
              </h1>
              <p className="text-xl text-gray-600">
                Configure alert contacts and, if you are an admin, review critical event tracing.
              </p>
              <div className="mt-4 bg-blue-100 border border-blue-400 rounded-lg p-3 inline-block">
                <div className="flex items-center text-blue-700">
                  <FaShieldAlt className="mr-2" />
                  <span className="text-sm font-medium">
                    Account: {user?.email || 'user'} · Contacts are saved to your profile
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-red-500">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEventsSubmenu('configuracion')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      eventsSubmenu === 'configuracion'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    Settings
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEventsSubmenu('trazabilidad')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        eventsSubmenu === 'trazabilidad'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Trazabilidad
                    </button>
                  )}
                </div>
              </div>

              {eventsSubmenu === 'configuracion' && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <h3 className="text-lg font-semibold text-gray-900">Alert contacts for your account</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Set up to 3 emails and 1 WhatsApp number to receive alerts when you activate the help button from the mobile app linked to <strong>{user?.email || 'your account'}</strong>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <label className="text-sm text-gray-700">
                      Alert email #1
                      <input
                        type="email"
                        value={panicAlertContacts.emails?.[0] || ''}
                        onChange={(event) => updatePanicAlertEmail(0, event.target.value)}
                        placeholder="familyr1@email.com"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </label>
                    <label className="text-sm text-gray-700">
                      Alert email #2
                      <input
                        type="email"
                        value={panicAlertContacts.emails?.[1] || ''}
                        onChange={(event) => updatePanicAlertEmail(1, event.target.value)}
                        placeholder="familyr2@email.com"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </label>
                    <label className="text-sm text-gray-700">
                      Alert email #3
                      <input
                        type="email"
                        value={panicAlertContacts.emails?.[2] || ''}
                        onChange={(event) => updatePanicAlertEmail(2, event.target.value)}
                        placeholder="familyr3@email.com"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </label>
                    <label className="text-sm text-gray-700">
                      Number WhatsApp
                      <input
                        type="text"
                        inputMode="tel"
                        value={panicAlertContacts.whatsapp || ''}
                        onChange={(event) => setPanicAlertContacts((current) => ({ ...current, whatsapp: event.target.value }))}
                        placeholder="+56912345678"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={savePanicAlertContacts}
                      disabled={panicContactsSaving}
                      className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-5 py-2 rounded-md font-medium"
                    >
                      <FaSyncAlt className={`mr-2 ${panicContactsSaving ? 'animate-spin' : ''}`} />
                      {panicContactsSaving ? 'Saving…' : 'Save help contacts'}
                    </button>
                    {panicContactsMessage && (
                      <span className="text-sm text-emerald-700">{panicContactsMessage}</span>
                    )}
                    {panicContactsError && (
                      <span className="text-sm text-red-700">{panicContactsError}</span>
                    )}
                  </div>
                </div>
              )}

              {eventsSubmenu === 'trazabilidad' && (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-600" />
                        Band button & help audit
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Log of band button events (photo/power-off/SOS) and activated help alerts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchWatchEvents}
                      disabled={loadingWatchEvents || deletingWatchEvents}
                      className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-3 rounded-md font-medium"
                    >
                      <FaSyncAlt className={`mr-2 ${loadingWatchEvents ? 'animate-spin' : ''}`} />
                      {loadingWatchEvents ? 'Refreshing audit…' : 'Refresh audit'}
                    </button>
                    <button
                      type="button"
                      onClick={clearWatchEventsHistory}
                      disabled={loadingWatchEvents || deletingWatchEvents}
                      className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-3 rounded-md font-medium"
                    >
                      <FaTrash className={`mr-2 ${deletingWatchEvents ? 'animate-pulse' : ''}`} />
                      {deletingWatchEvents ? 'Deleting history…' : 'Delete history'}
                    </button>
                  </div>

                  <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-blue-900">Location actual (a pedido)</h4>
                          <p className="text-sm text-blue-800 mt-1">
                            Send a live request to the mobile app to capture current GPS, without triggering a help alert.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={runOnDemandCurrentLocationCheck}
                          disabled={gpsCheckLoading || !selectedDeviceId || loadingDevices}
                          title={
                            !selectedDeviceId
                              ? 'Select a device con email vinculado'
                              : undefined
                          }
                          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-md font-medium"
                        >
                          <FaSyncAlt className={`mr-2 ${gpsCheckLoading ? 'animate-spin' : ''}`} />
                          {gpsCheckLoading ? 'Waiting for live GPS…' : 'Request current location (mobile app)'}
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Device to request location from
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={selectedDeviceId}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="w-full border border-blue-200 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingDevices || devices.length === 0}
                          >
                            {devices.length === 0 ? (
                              <option value="">
                                {loadingDevices ? 'Loading devices…' : 'No devices available'}
                              </option>
                            ) : (
                              devices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                  {device.patientName ? `${device.patientName} - ` : ''}
                                  {device.email || 'No email'} ({device.deviceId})
                                </option>
                              ))
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => fetchDevices(selectedDeviceId)}
                            disabled={loadingDevices}
                            className="inline-flex items-center justify-center bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 disabled:opacity-50 px-4 py-2 rounded-md text-sm font-medium"
                          >
                            <FaSyncAlt className={`mr-2 ${loadingDevices ? 'animate-spin' : ''}`} />
                            Refresh lista
                          </button>
                        </div>
                        {!selectedDeviceId && (
                          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            The button is disabled because no device is selected.
                            {devices.length === 0
                              ? ' No devices appear on the server (the mobile app must have sent at least one biometric record with email).'
                              : ' Elige uno en la lista de arriba.'}
                          </p>
                        )}
                        {selectedDeviceId && !(devices.find((d) => d.deviceId === selectedDeviceId)?.email) && (
                          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            This device has no linked email; the mobile app will not receive the request.
                          </p>
                        )}
                      </div>
                    </div>

                    {gpsCheckError && (
                      <div className="mt-3 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                        {gpsCheckError}
                      </div>
                    )}

                    {gpsCheckResult?.dashboardNotice && (
                      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
                        {gpsCheckResult.dashboardNotice}
                      </div>
                    )}

                    {gpsCheckResult && (
                      <div className="mt-3 rounded-lg bg-white border border-blue-100 text-blue-900 px-4 py-3 text-sm space-y-2">
                        <p className="font-semibold">Respuesta del servidor:</p>
                        <p>{gpsCheckResult?.message || 'GPS validado.'}</p>
                        <p className="text-blue-800">
                          Date y hora: <span className="font-semibold">{gpsCheckReceivedAtLabel}</span>
                        </p>
                        <p className="text-blue-800">
                          Time exacta (24h): <span className="font-semibold">{gpsCheckExactTimeLabel}</span>
                        </p>
                        {gpsCheckEmbedUrl ? (
                          <div className="rounded-lg border border-blue-200 bg-white p-2">
                            <iframe
                              title="Current GPS position map"
                              src={gpsCheckEmbedUrl}
                              className="w-full h-56 rounded-md border border-blue-100"
                              loading="lazy"
                            />
                            {gpsCheckMapUrl && (
                              <a
                                href={gpsCheckMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex mt-2 text-blue-700 hover:text-blue-800 underline"
                              >
                                Open mapa en Google Maps
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg bg-white border border-blue-100 text-blue-700 px-3 py-2">
                            No fue posible construir el mapa con las coordenadas receiveds.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-sky-900">Ruta de seguimiento por ventana</h4>
                        <p className="text-sm text-sky-800 mt-1">
                          View the GPS path reported in the last hour, 6 hours, or 24 hours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fetchEventRouteHistory(eventRouteWindow)}
                        disabled={eventRouteLoading || !selectedDeviceId}
                        className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-5 py-2 rounded-md font-medium"
                      >
                        <FaSyncAlt className={`mr-2 ${eventRouteLoading ? 'animate-spin' : ''}`} />
                        {eventRouteLoading ? 'Loading ruta...' : 'Refresh ruta'}
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {EVENT_ROUTE_WINDOWS.map((windowOption) => (
                        <button
                          key={windowOption.id}
                          type="button"
                          onClick={() => setEventRouteWindow(windowOption.id)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            eventRouteWindow === windowOption.id
                              ? 'bg-sky-700 text-white'
                              : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-100'
                          }`}
                        >
                          {windowOption.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {EVENT_ROUTE_TRAVEL_MODES.map((modeOption) => (
                        <button
                          key={modeOption.id}
                          type="button"
                          onClick={() => setEventRouteTravelMode(modeOption.id)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            eventRouteTravelMode === modeOption.id
                              ? 'bg-cyan-700 text-white'
                              : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
                          }`}
                        >
                          {modeOption.label}
                        </button>
                      ))}
                    </div>

                    {eventRouteError && (
                      <div className="mt-3 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                        {eventRouteError}
                      </div>
                    )}

                    {eventRouteResult && !eventRouteError && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg border border-sky-100 p-3">
                            <p className="text-xs text-gray-500">Puntos</p>
                            <p className="text-lg font-semibold text-sky-800">{eventRouteResult?.pointsCount || 0}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-sky-100 p-3">
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="text-lg font-semibold text-sky-800">{eventRouteDistanceLabel}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-sky-100 p-3">
                            <p className="text-xs text-gray-500">Start ventana</p>
                            <p className="text-sm font-semibold text-sky-800">{eventRouteStartLabel}</p>
                          </div>
                          <div className="bg-white rounded-lg border border-sky-100 p-3">
                            <p className="text-xs text-gray-500">Window end</p>
                            <p className="text-sm font-semibold text-sky-800">{eventRouteEndLabel}</p>
                          </div>
                        </div>

                        <ExerciseRouteMap route={eventRouteResult.points || []} />

                        {eventRouteGoogleMapsUrl && (
                          <div className="flex justify-end">
                            <a
                              href={eventRouteGoogleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium px-4 py-2 rounded-md"
                            >
                              Ver ruta completa en Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {latestPanicAlert && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-red-800">Help alert dashboard</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Latest alert recorded: {latestPanicAlert?.logDate ? formatDate(latestPanicAlert.logDate) : 'N/A'}
                          </p>
                          <p className="text-sm text-red-700 mt-1">User: {latestPanicAlert?.userName || 'Sin name'} ({latestPanicAlert?.userEmail || 'No email'})</p>
                          <p className="text-sm text-red-700 mt-1">Device: {latestPanicAlert?.data?.deviceId || 'N/A'}</p>
                          <p className="text-sm text-red-700 mt-1">Source: {latestPanicAlert?.data?.source || 'N/A'}</p>
                          <p className="text-sm text-red-700 mt-1">
                            Location: {latestPanicHasLocation
                              ? `${latestPanicLocation.latitude.toFixed(6)}, ${latestPanicLocation.longitude.toFixed(6)}`
                              : 'No reportada'}
                          </p>
                          <div className="mt-3 rounded-lg border border-red-200 bg-white/70 p-3">
                            <p className="text-sm font-semibold text-red-800">Notified recipients (latest alert)</p>
                            <p className="text-xs text-red-700 mt-1">Incluye email del user + emails opcionales y WhatsApp opcional configurado.</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {latestPanicTargetEmails.length > 0
                                ? latestPanicTargetEmails.map((email) => (
                                  <span
                                    key={email}
                                    className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1"
                                  >
                                    {email}
                                  </span>
                                ))
                                : (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">
                                    No emails de destino
                                  </span>
                                )}
                              {latestPanicTargetWhatsapp
                                ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1">
                                    WhatsApp: {latestPanicTargetWhatsapp}
                                  </span>
                                )
                                : (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">
                                    WhatsApp no configurado
                                  </span>
                                )}
                            </div>
                          </div>
                          {latestPanicWhatsappLink && (
                            <a
                              href={latestPanicWhatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-1 text-sm text-red-800 underline hover:text-red-900"
                            >
                              Open chat WhatsApp
                            </a>
                          )}
                          {latestPanicMapUrl && (
                            <a
                              href={latestPanicMapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-2 text-sm text-red-800 underline hover:text-red-900"
                            >
                              Open mapa de alerta
                            </a>
                          )}
                        </div>
                        <div className="w-full lg:w-[420px]">
                          {latestPanicEmbedUrl ? (
                            <iframe
                              title="Help-alert map"
                              src={latestPanicEmbedUrl}
                              className="w-full h-56 rounded-lg border border-red-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-56 rounded-lg border border-red-200 bg-white text-red-700 text-sm flex items-center justify-center px-4 text-center">
                              La alerta no incluye coordenadas para mostrar el mapa.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {watchEventsError && (
                    <div className="mt-2 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                      {watchEventsError}
                    </div>
                  )}

                  {!watchEventsError && groupedWatchEvents.length === 0 && !loadingWatchEvents && (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                      No band button or help events recorded.
                    </div>
                  )}

                  {groupedWatchEvents.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-gray-500">
                            <th className="py-3 pr-4 font-medium">Date</th>
                            <th className="py-3 pr-4 font-medium">Type</th>
                            <th className="py-3 pr-4 font-medium">Action</th>
                            <th className="py-3 pr-4 font-medium">User</th>
                            <th className="py-3 pr-4 font-medium">Device</th>
                            <th className="py-3 pr-4 font-medium">Source</th>
                            <th className="py-3 pr-0 font-medium">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedWatchEvents.map((group, index) => {
                            const watchEvent = group.watchEvent;
                            const panicEvent = group.panicEvent;
                            const baseEvent = watchEvent || panicEvent;
                            const action = watchEvent?.data?.action || panicEvent?.data?.action || (panicEvent ? 'panic' : 'N/A');
                            const locationData = panicEvent?.data?.location || watchEvent?.data?.location;
                            const hasLocation = Number.isFinite(locationData?.latitude) && Number.isFinite(locationData?.longitude);
                            const mapUrl = panicEvent?.data?.mapUrl || watchEvent?.data?.mapUrl || (hasLocation
                              ? `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`
                              : null);
                            const rowKey = `${baseEvent?.userId || 'user'}-${baseEvent?.logDate || index}-${index}`;

                            return (
                              <tr key={rowKey} className="border-b border-gray-100">
                                <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">
                                  {baseEvent?.logDate ? formatDate(baseEvent.logDate) : 'N/A'}
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="flex flex-wrap gap-1">
                                    {watchEvent && (
                                      <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                        watch_button_event
                                      </span>
                                    )}
                                    {panicEvent && (
                                      <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                        panic_alert
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 pr-4 text-gray-700">{action}</td>
                                <td className="py-3 pr-4">
                                  <div className="font-medium text-gray-900">{baseEvent?.userName || 'Sin name'}</div>
                                  <div className="text-xs text-gray-500 break-all">{baseEvent?.userEmail || 'No email'}</div>
                                </td>
                                <td className="py-3 pr-4 text-gray-700 break-all">{baseEvent?.data?.deviceId || 'N/A'}</td>
                                <td className="py-3 pr-4 text-gray-700">{baseEvent?.data?.source || 'N/A'}</td>
                                <td className="py-3 pr-0 text-gray-700">
                                  {hasLocation
                                    ? (
                                      <div className="flex flex-col gap-1">
                                        <span>{`${locationData.latitude.toFixed(5)}, ${locationData.longitude.toFixed(5)}`}</span>
                                        <a
                                          href={mapUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                                        >
                                          Ver mapa
                                        </a>
                                      </div>
                                    )
                                    : 'No reportada'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <FaHeartbeat className="text-red-500 mr-3" />
              {t('app.device.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('app.device.subtitle')}
            </p>
            <div className="mt-4 bg-blue-100 border border-blue-400 rounded-lg p-3 inline-block">
              <div className="flex items-center text-blue-700">
                <FaShieldAlt className="mr-2" />
                <span className="text-sm font-medium">
                  Admin panel — User: {user?.userprofile?.toUpperCase() || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>

          {/* Panel de control */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Device:
                </label>
                <select 
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingDevices || devices.length === 0}
                >
                  {devices.length === 0 ? (
                    <option value="">
                      {loadingDevices ? 'Loading devices…' : 'No devices available'}
                    </option>
                  ) : (
                    devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.patientName ? `${device.patientName} - ` : ''}{device.idpersonal ? `${device.idpersonal} - ` : ''}{device.email || 'No email'} ({device.totalRecords} registros)
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-col">
                  <button 
                    onClick={handleRefreshClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center"
                    disabled={isRefreshBusy || deletingData || !selectedDeviceId}
                  >
                    <FaSyncAlt className={`mr-2 ${isRefreshBusy ? 'animate-spin' : ''}`} />
                    {refreshButtonLabel}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">{lastRefreshLabel}</p>
                </div>
                <button 
                  onClick={() => handleDeleteClick('device', selectedDeviceId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center"
                  disabled={loadingDevices || deletingData || !selectedDeviceId}
                >
                  <FaTrash className="mr-2" />
                  {deletingData && deleteType === 'device' ? 'Deleting…' : 'Delete all device data'}
                </button>
              </div>
            </div>
          </div>

          {!isBiometricOnlyView && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-red-500">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEventsSubmenu('configuracion')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    eventsSubmenu === 'configuracion'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => setEventsSubmenu('trazabilidad')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    eventsSubmenu === 'trazabilidad'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Trazabilidad
                </button>
                <button
                  type="button"
                  onClick={() => setEventsSubmenu('pruebas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    eventsSubmenu === 'pruebas'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Pruebas de help
                </button>
              </div>
            </div>

            {eventsSubmenu === 'configuracion' && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert contacts for your account</h3>
              <p className="text-sm text-gray-700 mt-1">
                Set up to 3 emails and 1 WhatsApp number for help alerts linked to <strong>{user?.email || 'your account'}</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <label className="text-sm text-gray-700">
                  Alert email #1
                  <input
                    type="email"
                    value={panicAlertContacts.emails?.[0] || ''}
                    onChange={(event) => updatePanicAlertEmail(0, event.target.value)}
                    placeholder="familyr1@email.com"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Alert email #2
                  <input
                    type="email"
                    value={panicAlertContacts.emails?.[1] || ''}
                    onChange={(event) => updatePanicAlertEmail(1, event.target.value)}
                    placeholder="familyr2@email.com"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Alert email #3
                  <input
                    type="email"
                    value={panicAlertContacts.emails?.[2] || ''}
                    onChange={(event) => updatePanicAlertEmail(2, event.target.value)}
                    placeholder="familyr3@email.com"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  Number WhatsApp
                  <input
                    type="text"
                    inputMode="tel"
                    value={panicAlertContacts.whatsapp || ''}
                    onChange={(event) => setPanicAlertContacts((current) => ({ ...current, whatsapp: event.target.value }))}
                    placeholder="+56912345678"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={savePanicAlertContacts}
                  disabled={panicContactsSaving}
                  className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-5 py-2 rounded-md font-medium"
                >
                  <FaSyncAlt className={`mr-2 ${panicContactsSaving ? 'animate-spin' : ''}`} />
                  {panicContactsSaving ? 'Saving…' : 'Save help contacts'}
                </button>
                {panicContactsMessage && (
                  <span className="text-sm text-emerald-700">{panicContactsMessage}</span>
                )}
                {panicContactsError && (
                  <span className="text-sm text-red-700">{panicContactsError}</span>
                )}
              </div>
            </div>
            )}

            {eventsSubmenu === 'pruebas' && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaMicrochip className="text-blue-600" />
                    Tester Phone GPS
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Paste the JSON from the phone and validate location with /mobile/gps-check without activating help.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={fillGpsPayloadWithSelectedEmail}
                    className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
                  >
                    Use device email
                  </button>
                  <button
                    type="button"
                    onClick={runGpsCheck}
                    disabled={gpsCheckLoading}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-md font-medium"
                  >
                    <FaSyncAlt className={`mr-2 ${gpsCheckLoading ? 'animate-spin' : ''}`} />
                    {gpsCheckLoading ? 'Getting GPS position…' : 'Get GPS position'}
                  </button>
                </div>
              </div>

              <textarea
                value={gpsCheckPayloadText}
                onChange={(event) => setGpsCheckPayloadText(event.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full border border-gray-300 rounded-md px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {gpsCheckError && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                  {gpsCheckError}
                </div>
              )}

              {gpsCheckResult && (
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 px-4 py-3 text-sm space-y-2">
                  <p className="font-semibold">Respuesta del servidor:</p>
                  <p>{gpsCheckResult?.message || 'GPS validado.'}</p>
                  <p className="text-blue-800">
                    Date y hora: <span className="font-semibold">{gpsCheckReceivedAtLabel}</span>
                  </p>
                  <p className="text-blue-800">
                    Time exacta (24h): <span className="font-semibold">{gpsCheckExactTimeLabel}</span>
                  </p>
                  {gpsCheckEmbedUrl ? (
                    <div className="rounded-lg border border-blue-200 bg-white p-2">
                      <iframe
                        title="GPS position map"
                        src={gpsCheckEmbedUrl}
                        className="w-full h-56 rounded-md border border-blue-100"
                        loading="lazy"
                      />
                      {gpsCheckMapUrl && (
                        <a
                          href={gpsCheckMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex mt-2 text-blue-700 hover:text-blue-800 underline"
                        >
                          Open mapa en Google Maps
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-white border border-blue-100 text-blue-700 px-3 py-2">
                      No fue posible construir el mapa con las coordenadas receiveds.
                    </div>
                  )}
                  <pre className="bg-white border border-blue-100 rounded p-3 overflow-x-auto text-xs text-gray-700">
                    {JSON.stringify(gpsCheckResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            )}

            {eventsSubmenu === 'trazabilidad' && (
            <>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-600" />
                  Band button & help audit
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Log of band button events (photo/power-off/SOS) and activated help alerts.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchWatchEvents}
                disabled={loadingWatchEvents || deletingWatchEvents}
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-3 rounded-md font-medium"
              >
                <FaSyncAlt className={`mr-2 ${loadingWatchEvents ? 'animate-spin' : ''}`} />
                {loadingWatchEvents ? 'Refreshing audit…' : 'Refresh audit'}
              </button>
              <button
                type="button"
                onClick={clearWatchEventsHistory}
                disabled={loadingWatchEvents || deletingWatchEvents}
                className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-3 rounded-md font-medium"
              >
                <FaTrash className={`mr-2 ${deletingWatchEvents ? 'animate-pulse' : ''}`} />
                {deletingWatchEvents ? 'Deleting history…' : 'Delete history'}
              </button>
            </div>

            {latestPanicAlert && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h4 className="text-base font-semibold text-red-800">Help alert dashboard</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Latest alert recorded: {latestPanicAlert?.logDate ? formatDate(latestPanicAlert.logDate) : 'N/A'}
                    </p>
                    <p className="text-sm text-red-700 mt-1">User: {latestPanicAlert?.userName || 'Sin name'} ({latestPanicAlert?.userEmail || 'No email'})</p>
                    <p className="text-sm text-red-700 mt-1">Device: {latestPanicAlert?.data?.deviceId || 'N/A'}</p>
                    <p className="text-sm text-red-700 mt-1">Source: {latestPanicAlert?.data?.source || 'N/A'}</p>
                    <p className="text-sm text-red-700 mt-1">
                      Location: {latestPanicHasLocation
                        ? `${latestPanicLocation.latitude.toFixed(6)}, ${latestPanicLocation.longitude.toFixed(6)}`
                        : 'No reportada'}
                    </p>
                    <div className="mt-3 rounded-lg border border-red-200 bg-white/70 p-3">
                      <p className="text-sm font-semibold text-red-800">Notified recipients (latest alert)</p>
                      <p className="text-xs text-red-700 mt-1">Incluye email del user + emails opcionales y WhatsApp opcional configurado.</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {latestPanicTargetEmails.length > 0
                          ? latestPanicTargetEmails.map((email) => (
                            <span
                              key={email}
                              className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1"
                            >
                              {email}
                            </span>
                          ))
                          : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">
                              No emails de destino
                            </span>
                          )}
                        {latestPanicTargetWhatsapp
                          ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1">
                              WhatsApp: {latestPanicTargetWhatsapp}
                            </span>
                          )
                          : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">
                              WhatsApp no configurado
                            </span>
                          )}
                      </div>
                    </div>
                    {latestPanicWhatsappLink && (
                      <a
                        href={latestPanicWhatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-1 text-sm text-red-800 underline hover:text-red-900"
                      >
                        Open chat WhatsApp
                      </a>
                    )}
                    {latestPanicMapUrl && (
                      <a
                        href={latestPanicMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-2 text-sm text-red-800 underline hover:text-red-900"
                      >
                        Open mapa de alerta
                      </a>
                    )}
                  </div>
                  <div className="w-full lg:w-[420px]">
                    {latestPanicEmbedUrl ? (
                      <iframe
                        title="Help-alert map"
                        src={latestPanicEmbedUrl}
                        className="w-full h-56 rounded-lg border border-red-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-56 rounded-lg border border-red-200 bg-white text-red-700 text-sm flex items-center justify-center px-4 text-center">
                        La alerta no incluye coordenadas para mostrar el mapa.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {watchEventsError && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                {watchEventsError}
              </div>
            )}

            {!watchEventsError && groupedWatchEvents.length === 0 && !loadingWatchEvents && (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                No band button or help events recorded.
              </div>
            )}

            {groupedWatchEvents.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-4 font-medium">Action</th>
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Device</th>
                      <th className="py-3 pr-4 font-medium">Source</th>
                      <th className="py-3 pr-0 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedWatchEvents.map((group, index) => {
                      const watchEvent = group.watchEvent;
                      const panicEvent = group.panicEvent;
                      const baseEvent = watchEvent || panicEvent;
                      const action = watchEvent?.data?.action || panicEvent?.data?.action || (panicEvent ? 'panic' : 'N/A');
                      const location = panicEvent?.data?.location || watchEvent?.data?.location;
                      const hasLocation = Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);
                      const mapUrl = panicEvent?.data?.mapUrl || watchEvent?.data?.mapUrl || (hasLocation
                        ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                        : null);
                      const rowKey = `${baseEvent?.userId || 'user'}-${baseEvent?.logDate || index}-${index}`;

                      return (
                        <tr key={rowKey} className="border-b border-gray-100">
                          <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">
                            {baseEvent?.logDate ? formatDate(baseEvent.logDate) : 'N/A'}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {watchEvent && (
                                <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                  watch_button_event
                                </span>
                              )}
                              {panicEvent && (
                                <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                  panic_alert
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{action}</td>
                          <td className="py-3 pr-4">
                            <div className="font-medium text-gray-900">{baseEvent?.userName || 'Sin name'}</div>
                            <div className="text-xs text-gray-500 break-all">{baseEvent?.userEmail || 'No email'}</div>
                          </td>
                          <td className="py-3 pr-4 text-gray-700 break-all">{baseEvent?.data?.deviceId || 'N/A'}</td>
                          <td className="py-3 pr-4 text-gray-700">{baseEvent?.data?.source || 'N/A'}</td>
                          <td className="py-3 pr-0 text-gray-700">
                            {hasLocation
                              ? (
                                <div className="flex flex-col gap-1">
                                  <span>{`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}</span>
                                  <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                  >
                                    Ver mapa
                                  </a>
                                </div>
                              )
                              : 'No reportada'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
            )}
          </div>
          )}

          {isFeatureEnabled('RISK_ANALYSIS') && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-violet-500">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaMicrochip className="text-violet-600" />
                  Experimental evaluation (off by default in product)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Non-clinical analysis. Does not generate diagnosis or medical alerts in the main experience.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeRiskWithAI}
                disabled={!selectedDeviceId || loadingRiskAnalysis}
                className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-3 rounded-md font-medium"
              >
                <FaSyncAlt className={`mr-2 ${loadingRiskAnalysis ? 'animate-spin' : ''}`} />
                {loadingRiskAnalysis ? 'Analyzing…' : 'Run evaluation'}
              </button>
            </div>

            {riskAnalysisError && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                {riskAnalysisError}
              </div>
            )}

            {latestRiskMetadata && (
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`rounded-xl border p-4 ${
                  latestRiskMetadata.riskLevel === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : latestRiskMetadata.riskLevel === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Riesgo</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{latestRiskMetadata.riskLevel}</p>
                  <p className="text-xs text-gray-500 mt-1">Fuente: {latestRiskMetadata.generatedBy || 'rules'}</p>
                  <p className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    latestRiskMetadata.ecgConsidered
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {latestRiskMetadata.ecgConsidered ? 'ECG reciente considerado' : 'ECG reciente no disponible'}
                  </p>
                  {latestRiskMetadata.ecgSummary && (
                    <div className="mt-3 rounded-lg bg-white/70 border border-white/80 p-3 text-xs text-gray-700">
                      <p className="font-semibold text-gray-800 mb-1">ECG reciente</p>
                      <p>Muestras: {latestRiskMetadata.ecgSummary.sampleCount ?? '—'} · Duration: {latestRiskMetadata.ecgSummary.durationSeconds ?? '—'} s</p>
                      <p>FC media: {latestRiskMetadata.ecgSummary.averageHeartRate ?? '—'} bpm · Rango: {latestRiskMetadata.ecgSummary.minHeartRate ?? '—'}-{latestRiskMetadata.ecgSummary.maxHeartRate ?? '—'} bpm</p>
                    </div>
                  )}
                  <p className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    latestRiskMetadata.exerciseConsidered
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {latestRiskMetadata.exerciseConsidered ? 'Ejercicio reciente considerado' : 'Ejercicio reciente no disponible'}
                  </p>
                  {latestRiskMetadata.exerciseSummary && (
                    <div className="mt-3 rounded-lg bg-white/70 border border-white/80 p-3 text-xs text-gray-700">
                      <p className="font-semibold text-gray-800 mb-1">Ejercicio reciente</p>
                      <p>
                        {latestRiskMetadata.exerciseSummary.sportName || 'Session'}
                        {latestRiskMetadata.exerciseSummary.source === 'gps_phone' ? ' · GPS' : ''}
                      </p>
                      <p>
                        Duration: {latestRiskMetadata.exerciseSummary.durationSeconds ?? '—'} s
                        {latestRiskMetadata.exerciseSummary.distanceMeters > 0
                          ? ` · Distance: ${(latestRiskMetadata.exerciseSummary.distanceMeters / 1000).toFixed(2)} km`
                          : ''}
                      </p>
                      <p>
                        FC media: {latestRiskMetadata.exerciseSummary.averageHeartRate ?? '—'} bpm
                        {latestRiskMetadata.exerciseSummary.calories != null
                          ? ` · ${Math.round(latestRiskMetadata.exerciseSummary.calories)} kcal`
                          : ''}
                      </p>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Orientative assessment</p>
                  <p className="text-sm text-gray-700">{latestRiskMetadata.diagnosis}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-3 mb-1">Recomendaciones</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(latestRiskMetadata.recommendations || []).map((item, index) => (
                      <li key={`risk-rec-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Mediciones fuera de rango</p>
                  {latestRiskMetadata.outOfRange?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {latestRiskMetadata.outOfRange.map((item) => (
                        <div key={item.key} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <p className="font-semibold text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-700">{item.value} {item.unit} · {item.interpretation}</p>
                          <p className="text-xs text-gray-500">Rango esperado: {item.normalRange}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No out-of-range measurements in the latest analysis.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {isFeatureEnabled('MEDICAL_ALERTS') && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Dashboard de measurements (legacy clinical)</h3>
                <p className="text-sm text-gray-500">
                  Listing by email with the latest available measurement. Hidden in SiempreSleep unless MEDICAL_ALERTS=true.
                </p>
              </div>
              <div className="text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-700">
                {patientDashboardRows.length} dispositivos
              </div>
            </div>

            {patientDashboardRows.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                No patients with registered measurements yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-3 pr-4 font-medium">Email</th>
                      <th className="py-3 pr-4 font-medium">Patient</th>
                      <th className="py-3 pr-4 font-medium">Latest measurement</th>
                      <th className="py-3 pr-4 font-medium">FC</th>
                      <th className="py-3 pr-4 font-medium">Oxygen</th>
                      <th className="py-3 pr-4 font-medium">Stress</th>
                      <th className="py-3 pr-4 font-medium">HRV</th>
                      <th className="py-3 pr-4 font-medium">Blood pressure</th>
                      <th className="py-3 pr-4 font-medium">Sleep</th>
                      <th className="py-3 pr-0 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDashboardRows.map((row) => {
                      const rowClassName = row.hasZeroMetrics
                        ? 'bg-red-50 border-b border-red-100'
                        : 'border-b border-gray-100';

                      const zeroBadge = row.hasZeroMetrics
                        ? `Ceros en: ${row.zeroMetricKeys.join(', ')}`
                        : '';

                      return (
                        <tr key={row.deviceId} className={rowClassName} title={zeroBadge}>
                          <td className="py-3 pr-4 align-top">
                            <div className="font-medium text-gray-900 break-all">{row.email}</div>
                            <div className="text-xs text-gray-500 break-all">{row.idpersonal}</div>
                          </td>
                          <td className="py-3 pr-4 align-top">
                            <div className="font-medium text-gray-900">{row.patientName}</div>
                            {row.hasZeroMetrics && (
                              <span className="inline-flex mt-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                                Sensor con valor 0
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 align-top text-gray-700 whitespace-nowrap">
                            {row.latestUpdate ? formatDate(row.latestUpdate) : 'N/A'}
                          </td>
                          <td className={`py-3 pr-4 align-top ${row.metrics.heartRate === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {row.metrics.heartRate ?? 'N/A'}
                          </td>
                          <td className={`py-3 pr-4 align-top ${row.metrics.oxygenSaturation === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {row.metrics.oxygenSaturation ?? 'N/A'}{typeof row.metrics.oxygenSaturation === 'number' ? '%' : ''}
                          </td>
                          <td className={`py-3 pr-4 align-top ${row.metrics.stress === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {row.metrics.stress ?? 'N/A'}
                          </td>
                          <td className={`py-3 pr-4 align-top ${row.metrics.hrv === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {row.metrics.hrv ?? 'N/A'}{typeof row.metrics.hrv === 'number' ? ' ms' : ''}
                          </td>
                          <td className={`py-3 pr-4 align-top ${(row.metrics.systolic === 0 || row.metrics.diastolic === 0) ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {(typeof row.metrics.systolic === 'number' || typeof row.metrics.diastolic === 'number')
                              ? `${row.metrics.systolic ?? 'N/A'}/${row.metrics.diastolic ?? 'N/A'}`
                              : 'N/A'}
                          </td>
                          <td className={`py-3 pr-4 align-top ${row.metrics.sleepTotalMinutes === 0 ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                            {typeof row.metrics.sleepTotalMinutes === 'number'
                              ? formatMetricValue(row.metrics.sleepTotalMinutes, 'min')
                              : 'N/A'}
                          </td>
                          <td className="py-3 pr-0 align-top">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => openHistoryModal(row.deviceId)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-left"
                              >
                                Open
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick('device', row.deviceId)}
                                disabled={deletingData}
                                className="text-red-600 hover:text-red-700 font-medium text-left disabled:opacity-50"
                              >
                                Delete todos los datos
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {isFeatureEnabled('MEDICAL_ALERTS') && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-amber-500 mr-3 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-800">Alertas medicals (desactivadas)</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Solo visibles con MEDICAL_ALERTS=true. No forman parte de SiempreSleep.
                </p>
              </div>
              <div className={`text-sm px-3 py-2 rounded-lg ${alertReport?.aiUsed ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-700'}`}>
                {alertReport?.aiUsed ? 'Monitoring: AI + rules' : 'Monitoring: rules'}
              </div>
            </div>

            {alertsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {alertsError}
              </div>
            )}

            {loadingAlerts ? (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                Analyzing biometric alerts…
              </div>
            ) : alertReport?.patients?.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Alertas criticas</p>
                    <p className="text-2xl font-bold text-red-700">{alertReport.criticalCount || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Alertas prioritarias</p>
                    <p className="text-2xl font-bold text-yellow-700">{alertReport.warningCount || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Patients a revisar</p>
                    <p className="text-2xl font-bold text-blue-700">{alertReport.totalFlagged || 0}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {alertReport.patients.map((patient) => (
                    <div key={patient.deviceId} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{patient.patientName}</h4>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getAlertSeverityClasses(patient.severity)}`}>
                              {patient.priorityLabel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Device: {patient.deviceId}</p>
                          <p className="text-sm text-gray-500 mb-1">Latest reading: {formatDate(patient.timestamp)}</p>
                          <p className="text-sm text-gray-500 mb-1">Personal ID: {patient.idpersonal || 'Not specified'}</p>
                          <p className="text-sm text-gray-500 mb-1">Email: {patient.email || 'Not specified'}</p>
                          <p className="text-sm text-gray-500">Phone: {patient.telefono || 'Not specified'}</p>
                        </div>

                        <div className="xl:w-64">
                          <button
                            type="button"
                            onClick={() => openHistoryModal(patient.deviceId)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                          >
                            View device
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {patient.alerts.map((alert) => (
                          <span
                            key={`${patient.deviceId}-${alert.code}`}
                            className={`text-xs font-medium px-3 py-2 rounded-full border ${getAlertSeverityClasses(alert.severity)}`}
                            title={alert.detail}
                          >
                            {alert.title}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Detail observado</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {patient.alerts.map((alert) => (
                              <li key={`${alert.code}-detail`}>{alert.detail}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-violet-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-violet-900 mb-2">
                            {alertReport.aiUsed ? 'Recomendacion IA para el admin' : 'Recomendacion sugerida'}
                          </p>
                          <p className="text-sm text-violet-900">{patient.recommendation}</p>
                          {patient.doctorFocus && (
                            <p className="text-sm text-violet-800 mt-2">
                              <span className="font-semibold">Foco del doctor:</span> {patient.doctorFocus}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                No patients with alerts in the latest reading for each device.
              </div>
            )}
          </div>
          )}

          {showHistoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
              <div className="min-h-full flex items-start justify-center px-4 pt-4 pb-6">
                <div className="max-w-7xl w-full">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">History de measurements</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {patientName} · {patientEmail} · {patientPersonalId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {historicalGridRows.length} registros del user seleccionado.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick('device', selectedDeviceId)}
                        disabled={deletingData || !selectedDeviceId}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <FaTrash className="mr-2" />
                        {deletingData && deleteType === 'device' ? 'Deleting…' : 'Delete all device data'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowHistoryModal(false);
                          setSelectedHistoryGpsPreview(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md border border-gray-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {loadingBiometric ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-600">Loading user history…</p>
                      </div>
                    ) : historicalGridRows.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No historical measurements for this user.
                      </div>
                    ) : (
                      <div className="max-h-[72vh] overflow-auto">
                        <HistoricalGridTable />
                      </div>
                    )}

                    {selectedHistoryGpsPreview && (
                      <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                          <div>
                            <h4 className="text-base font-semibold text-violet-900">Mapa de lectura seleccionada</h4>
                            <p className="text-sm text-violet-800 mt-1">
                              {selectedHistoryGpsPreview.patientName} · {formatDate(selectedHistoryGpsPreview.timestamp)}
                            </p>
                            <p className="text-xs text-violet-700 mt-1">
                              {selectedHistoryGpsPreview.latitude.toFixed(6)}, {selectedHistoryGpsPreview.longitude.toFixed(6)}
                            </p>
                          </div>
                          {selectedHistoryGpsPreview.mapUrl && (
                            <a
                              href={selectedHistoryGpsPreview.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex text-sm text-violet-800 underline hover:text-violet-900"
                            >
                              Open en Google Maps
                            </a>
                          )}
                        </div>
                        <iframe
                          title="GPS history map"
                          src={`https://maps.google.com/maps?q=${selectedHistoryGpsPreview.latitude},${selectedHistoryGpsPreview.longitude}&z=16&output=embed`}
                          className="w-full h-56 rounded-lg border border-violet-200"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <div className="flex items-center mb-4">
                  <FaTrash className="text-red-500 mr-3 text-xl" />
                  <h3 className="text-lg font-bold">Confirm deletion</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  {deleteType === 'device' 
                    ? `Are you sure you want to delete all data for device ${deviceIdPendingDelete || selectedDeviceId}? This cannot be undone.`
                    : 'Are you sure you want to delete ALL biometric data? This will remove all devices and cannot be undone.'
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                    disabled={deletingData}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                    disabled={deletingData}
                  >
                    {deletingData ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting…
                      </>
                    ) : (
                      'Yes, delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading and error state */}
          {loadingBiometric && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg text-gray-600">Loading biometric data…</p>
            </div>
          )}

          {biometricError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">⚠️</div>
                <div>
                  <strong>Error:</strong> {biometricError}
                </div>
              </div>
            </div>
          )}

          {!loadingBiometric && !biometricError && biometricData.length === 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-8 text-center">
              <FaMicrochip className="inline text-2xl mb-2" />
              <p className="text-lg">
                {devices.length === 0
                  ? 'No biometric devices registered yet.'
                  : 'No biometric data available for this device.'}
              </p>
              <p className="text-sm mt-2">
                {devices.length === 0
                  ? 'When the Android app sends data, the device will appear here automatically.'
                  : 'Select a different device or check the connection.'}
              </p>
            </div>
          )}

          {/* Device data */}
          {!loadingBiometric && biometricData.length > 0 && (
            <div>
              {/* Resumen principal */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Device summary</h3>
                    <p className="text-sm text-gray-500">
                      Device overview with charts per variable for 24 hours, week, or month.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {HISTORY_RANGES.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setSelectedRange(range.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedRange === range.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Device</p>
                    <p className="text-xl font-bold text-blue-600 break-all">{selectedDeviceId}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="text-xl font-bold text-sky-600 break-words">{patientName}</p>
                    <p className="text-sm text-sky-700 mt-2 break-all">ID: {patientPersonalId}</p>
                    <p className="text-sm text-sky-700 mt-2 break-all">{patientEmail}</p>
                    <p className="text-sm text-sky-700 break-all">{patientPhone}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Records en rango</p>
                    <p className="text-xl font-bold text-green-600">{historicalData.length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Last update</p>
                    <p className="text-xl font-bold text-purple-600">
                      {latestRecord ? formatDate(latestRecord.timestamp) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {overviewCards.map((card) => (
                    <div key={card.label} className={`${card.tone} rounded-lg p-4`}>
                      <p className="text-sm opacity-80">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Daily biometric dashboard</h3>
                    <p className="text-sm text-gray-500">
                      Day summary with sleep, heart rate, activity, reference blood pressure, and recovery.
                    </p>
                  </div>
                  {activeDailyDashboard?.recovery?.score !== null && activeDailyDashboard?.recovery?.score !== undefined && (
                    <div className="rounded-xl bg-cyan-50 border border-cyan-100 px-4 py-3 text-center">
                      <p className="text-xs text-cyan-700">Recovery general</p>
                      <p className="text-2xl font-bold text-cyan-800">{activeDailyDashboard.recovery.score}</p>
                      <p className="text-xs text-cyan-700">{activeDailyDashboard.recovery.label}</p>
                    </div>
                  )}
                </div>

                <DailyBiometricDashboard
                  dashboard={activeDailyDashboard}
                  dayKey={selectedDayKey}
                  availableDays={dailyDashboardDays}
                  onDayChange={setSelectedDayKey}
                />
              </div>

              {/* Charts por variable */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div className="flex items-start">
                    <FaChartLine className="text-blue-500 mr-3 text-xl mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Charts por variable</h3>
                      <p className="text-sm text-gray-500">
                        Trend for each biometric metric in the selected range.
                        {selectedRange === '24h' && ' Muestra lecturas individuales.'}
                        {selectedRange === '7d' && ' Groups by hour for easier reading.'}
                        {selectedRange === '30d' && ' Groups by day for the last month.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-700">
                    {metricSeries.length} variables con datos
                  </div>
                </div>

                {metricSeries.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                    Not enough data to chart in the selected range.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <SleepHistoricalStackedChart records={historicalData} rangeId={selectedRange} />
                    {metricSeries
                      .filter((metric) => !metric.key.startsWith('sleep'))
                      .map((metric) => (
                        <HistoricalMetricChart key={metric.key} metric={metric} rangeId={selectedRange} />
                      ))}
                  </div>
                )}
              </div>

              <SleepAnalysisPanel sleepRecords={sleepRecords} />

              {isFeatureEnabled('EXPERIMENTAL_ECG') && (
                <div className="mb-4">
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                    Experimental ECG / not clinically validated. Do not use for diagnosis.
                  </p>
                  <EcgHistoryPanel ecgRecords={biometricData} />
                </div>
              )}

              {isFeatureEnabled('SPORTS_TRACKING') && (
                <ExerciseHistoryPanel exerciseRecords={biometricData} />
              )}

              {/* Tendencia diaria */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center mb-5">
                  <FaChartLine className="text-blue-500 mr-3 text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Tendencia diaria</h3>
                    <p className="text-sm text-gray-500">
                      Each card summarizes a day. Hourly detail appears when you select a date.
                    </p>
                  </div>
                </div>

                {dailySummaries.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                    Not enough data to summarize by day in the selected range.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {dailySummaries.map((daySummary) => (
                      <button
                        key={daySummary.dayKey}
                        type="button"
                        onClick={() => setSelectedDayKey(daySummary.dayKey)}
                        className={`text-left rounded-xl border p-5 transition ${
                          selectedDayKey === daySummary.dayKey
                            ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">{formatDayLabel(daySummary.dayKey)}</p>
                            <p className="text-sm text-gray-500">
                              {daySummary.records.length} lecturas, de {formatTime(daySummary.records[0]?.timestamp)} a {formatTime(daySummary.records[daySummary.records.length - 1]?.timestamp)}
                            </p>
                          </div>
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                            Ver detail horario
                          </span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {daySummary.metrics.slice(0, 6).map((metric) => (
                            <div key={`${daySummary.dayKey}-${metric.key}`} className="rounded-lg bg-white/80 border border-gray-100 p-3">
                              <p className="text-xs text-gray-500">{metric.label}</p>
                              <p className="text-lg font-semibold" style={{ color: metric.color }}>
                                {formatMetricValue(metric.value, metric.unit)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* History completo */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">History completo del user seleccionado</h3>
                    <p className="text-sm text-gray-500">
                      Table overview of all available records with per-row delete.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="text-sm text-gray-500">
                      Total de registros: {historicalGridRows.length}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick('device', selectedDeviceId)}
                      disabled={deletingData || !selectedDeviceId}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <FaTrash className="mr-2" />
                      {deletingData && deleteType === 'device' ? 'Deleting…' : 'Delete all device data'}
                    </button>
                  </div>
                </div>
                <HistoricalGridTable />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatosBiometricos;