// App.js — SiempreSleep product shell
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import setupAxiosInterceptor from './utils/axiosInterceptor';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import FeatureGate from './components/FeatureGate';
import { isFeatureEnabled } from './config/featureFlags';

import SiempreSleepLanding from './pages/SiempreSleepLanding';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Contacto from './pages/Contacto';
import QuienesSomos from './pages/QuienesSomos';
import PreguntasFrecuentes from './pages/PreguntasFrecuentes';
import TerminosYCondiciones from './pages/TerminosYCondiciones';
import Privacidad from './pages/Privacidad';
import DatosBiometricos from './pages/DatosBiometricos.jsx';
import RecordatoriosPulsera from './pages/wellness/RecordatoriosPulsera';

import DashboardPage from './pages/sleep/TodayPage';
import SleepHistoryPage from './pages/sleep/SleepHistoryPage';
import ReportsPage from './pages/sleep/ReportsPage';
import ConnectPage from './pages/sleep/ConnectPage';
import OnboardingPage from './pages/sleep/OnboardingPage';
import ImprovePage from './pages/sleep/ImprovePage';
import InsightsPage from './pages/sleep/InsightsPage';
import CoachPage from './pages/sleep/CoachPage';

// Legacy surfaces — gated; code retained for data/admin compatibility
import Bitacora from './pages/Bitacora';
import AdminDashboard from './pages/AdminDashboard';
import DoctorRecords from './pages/DoctorRecords';
import ClinicalTimeline from './pages/ClinicalTimeline';
import Servicios from './pages/Servicios';
import Noticias from './pages/Noticias';
import PersonalizaTuOrden from './pages/PersonalizaTuOrden.jsx';
import OrdenHombre from './pages/OrdenHombre.jsx';
import OrdenMujer from './pages/OrdenMujer.jsx';
import SaludHombreProgram from './pages/SaludHombreProgram.jsx';
import SaludMujerProgram from './pages/SaludMujerProgram.jsx';
import OrdenPreventiva from './pages/OrdenPreventiva.jsx';
import OrdenPreventivaHombre from './pages/OrdenPreventivaHombre.jsx';
import OrdenPreventivaMujer from './pages/OrdenPreventivaMujer.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentResult from './pages/PaymentResult.jsx';
import Cart from './pages/Cart.jsx';
import ReviewOrder from './pages/ReviewOrder';
import TermsAndConditions from './pages/TermsAndConditions';
import Calendario from './pages/Calendario';
import SmartriskPageRoute from './pages/SmartriskPageRoute';
import MpdCoverageMockRoute from './pages/MpdCoverageMockRoute';
import SaludPersonalHub from './pages/wellness/SaludPersonalHub';
import CicloFertilidad from './pages/wellness/CicloFertilidad';
import Menopausia from './pages/wellness/Menopausia';
import Doctor911Landing from './pages/Doctor911Landing';

const ANDROID_ROUTE_MAP = {
  habitos: '/improve',
  wellness: '/dashboard',
  sleep: '/sleep',
  connect: '/connect',
  device: '/device',
  improve: '/improve',
  insights: '/insights',
  today: '/dashboard'
};

function AndroidRouteBridge() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routeKey = params.get('androidRoute');
    const targetRoute = ANDROID_ROUTE_MAP[routeKey];

    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

function RetiredRedirect({ to = '/dashboard' }) {
  return <Navigate to={to} replace />;
}

function App() {
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AndroidRouteBridge />
            <Routes>
            {/* —— SiempreSleep primary navigation —— */}
            <Route path="/" element={<SiempreSleepLanding />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/today" element={<Navigate to="/dashboard" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/sleep" element={<SleepHistoryPage />} />
            <Route path="/habits" element={<Navigate to="/improve" replace />} />
            <Route path="/improve" element={<ImprovePage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/device" element={<DatosBiometricos />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/experiments" element={<Navigate to="/improve?tab=experiments" replace />} />
            <Route path="/profile" element={<Navigate to="/account" replace />} />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
            <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />
            <Route path="/privacidad" element={<Privacidad />} />

            {/* Wellness aliases → Sleep IA */}
            <Route path="/wellness" element={<Navigate to="/dashboard" replace />} />
            <Route path="/wellness/habitos" element={<Navigate to="/habits" replace />} />
            <Route path="/wellness/recordatorios" element={<RecordatoriosPulsera />} />
            <Route
              path="/wellness/ciclo-fertilidad"
              element={
                <FeatureGate flag="CYCLE_MENOPAUSE">
                  <CicloFertilidad />
                </FeatureGate>
              }
            />
            <Route
              path="/wellness/menopausia"
              element={
                <FeatureGate flag="CYCLE_MENOPAUSE">
                  <Menopausia />
                </FeatureGate>
              }
            />

            {/* Device / biometrics — primary path is /device; legacy URLs redirect */}
            <Route path="/datos-biometricos" element={<Navigate to="/device" replace />} />
            <Route path="/seguimiento-eventos" element={<Navigate to="/connect" replace />} />

            {/* —— Legacy clinical / commerce (hidden unless flag on) —— */}
            <Route
              path="/legacy/salud"
              element={
                <FeatureGate flag="CLINICAL_ORDERS">
                  <Doctor911Landing />
                </FeatureGate>
              }
            />
            <Route
              path="/bitacora"
              element={
                <FeatureGate flag="CLINICAL_ORDERS">
                  <Bitacora />
                </FeatureGate>
              }
            />
            <Route
              path="/clinical/timeline"
              element={
                <FeatureGate flag="CLINICAL_ORDERS">
                  <ClinicalTimeline />
                </FeatureGate>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <FeatureGate flag="CLINICAL_ORDERS">
                  <AdminDashboard />
                </FeatureGate>
              }
            />
            <Route
              path="/doctor/records"
              element={
                <FeatureGate flag="DOCTOR_PORTAL">
                  <DoctorRecords />
                </FeatureGate>
              }
            />
            <Route
              path="/calendario"
              element={
                <FeatureGate flag="DOCTOR_PORTAL">
                  <Calendario />
                </FeatureGate>
              }
            />
            <Route
              path="/telemedicina"
              element={
                <FeatureGate flag="DOCTOR_PORTAL">
                  <Calendario />
                </FeatureGate>
              }
            />
            <Route
              path="/servicios"
              element={
                isFeatureEnabled('CLINICAL_ORDERS') ? <Servicios /> : <RetiredRedirect />
              }
            />
            <Route
              path="/personaliza-tu-orden"
              element={
                <FeatureGate flag="CLINICAL_ORDERS">
                  <PersonalizaTuOrden />
                </FeatureGate>
              }
            />
            <Route path="/orden-hombre" element={<FeatureGate flag="CLINICAL_ORDERS"><OrdenHombre /></FeatureGate>} />
            <Route path="/orden-mujer" element={<FeatureGate flag="CLINICAL_ORDERS"><OrdenMujer /></FeatureGate>} />
            <Route path="/salud-hombre" element={<FeatureGate flag="CLINICAL_ORDERS"><SaludHombreProgram /></FeatureGate>} />
            <Route path="/salud-mujer" element={<FeatureGate flag="CLINICAL_ORDERS"><SaludMujerProgram /></FeatureGate>} />
            <Route path="/orden-preventiva" element={<FeatureGate flag="CLINICAL_ORDERS"><OrdenPreventiva /></FeatureGate>} />
            <Route path="/orden-preventiva-hombre" element={<FeatureGate flag="CLINICAL_ORDERS"><OrdenPreventivaHombre /></FeatureGate>} />
            <Route path="/orden-preventiva-mujer" element={<FeatureGate flag="CLINICAL_ORDERS"><OrdenPreventivaMujer /></FeatureGate>} />
            <Route path="/cart" element={<FeatureGate flag="COMMERCE"><Cart /></FeatureGate>} />
            <Route path="/checkout/:orderId" element={<FeatureGate flag="COMMERCE"><Checkout /></FeatureGate>} />
            <Route path="/payment/result/:paymentId" element={<FeatureGate flag="COMMERCE"><PaymentResult /></FeatureGate>} />
            <Route path="/review-order" element={<FeatureGate flag="COMMERCE"><ReviewOrder /></FeatureGate>} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/noticias" element={isFeatureEnabled('CLINICAL_ORDERS') ? <Noticias /> : <RetiredRedirect />} />
            <Route path="/smartrisk" element={<FeatureGate flag="LEGACY_SPINOFFS"><SmartriskPageRoute /></FeatureGate>} />
            <Route path="/smartrisk/cobertura-mpd" element={<FeatureGate flag="LEGACY_SPINOFFS"><MpdCoverageMockRoute /></FeatureGate>} />

            {/* Hub wellness legacy file kept for deep links when cycle flag on */}
            <Route
              path="/wellness/hub"
              element={
                isFeatureEnabled('CYCLE_MENOPAUSE') ? <SaludPersonalHub /> : <Navigate to="/dashboard" replace />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
