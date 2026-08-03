import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/doctor911/Navbar';
import SaludSimpleFooter from '../components/doctor911/SaludSimpleFooter';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaHeartbeat,
  FaCalendarAlt,
  FaUserMd,
  FaInfoCircle,
  FaSpinner,
  FaBrain,
  FaLightbulb
} from 'react-icons/fa';
import { format } from 'date-fns';
import { getApiUrl } from '../config/api';
import { getCookie } from '../utils/cookies';

function ClinicalTimeline() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [copilot, setCopilot] = useState(null);
  const [loadingCopilot, setLoadingCopilot] = useState(false);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchTimeline();
    fetchCopilot();
  }, [navigate]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      const response = await axios.get(getApiUrl('/api/user/clinical/timeline'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAnalysis(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Error al cargar el análisis clínico. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCopilot = async () => {
    try {
      setLoadingCopilot(true);
      const token = getCookie('token');
      const response = await axios.get(getApiUrl('/api/user/clinical/copilot'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCopilot(response.data);
    } catch (err) {
      console.error('Error fetching copilot:', err);
    } finally {
      setLoadingCopilot(false);
    }
  };

  const getAlertColor = (severity) => {
    const colors = {
      high: 'bg-red-100 border-red-300 text-red-800',
      medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      low: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return colors[severity] || colors.low;
  };

  const getAlertIcon = (severity) => {
    if (severity === 'high') return <FaExclamationTriangle className="text-red-600" />;
    if (severity === 'medium') return <FaInfoCircle className="text-yellow-600" />;
    return <FaInfoCircle className="text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analizando tu historial clínico...</p>
          </div>
        </div>
        <SaludSimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <FaChartLine className="mr-3 text-blue-600" />
            Línea de Tiempo Clínica Inteligente
          </h1>
          <p className="text-xl text-gray-600">
            Análisis longitudinal de tu salud con detección de patrones y alertas proactivas
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Card */}
        {analysis && analysis.summary && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total de Registros</div>
                <div className="text-3xl font-bold text-blue-600">{analysis.summary.totalRecords}</div>
              </div>
              {analysis.summary.patientAge && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Edad del Paciente</div>
                  <div className="text-3xl font-bold text-green-600">{analysis.summary.patientAge} años</div>
                </div>
              )}
              {analysis.summary.dateRange && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Período</div>
                  <div className="text-lg font-bold text-purple-600">
                    {format(new Date(analysis.summary.dateRange.start), 'MMM yyyy')} - {format(new Date(analysis.summary.dateRange.end), 'MMM yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {analysis && analysis.alerts && analysis.alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-orange-600" />
              Alertas Proactivas
            </h2>
            <div className="space-y-4">
              {analysis.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
                      <p className="mb-2">{alert.message}</p>
                      {alert.recommendation && (
                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <p className="text-sm font-medium">💡 Recomendación:</p>
                          <p className="text-sm">{alert.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns */}
        {analysis && analysis.patterns && analysis.patterns.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Patrones Detectados
            </h2>
            <div className="space-y-3">
              {analysis.patterns.map((pattern, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{pattern.examName}</h3>
                      <p className="text-sm text-gray-600">
                        Realizado {pattern.count} veces
                        {pattern.frequency && ` • Frecuencia: ${pattern.frequency} veces/año`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Desde {format(new Date(pattern.firstDate), 'dd/MM/yyyy')} hasta {format(new Date(pattern.lastDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pattern.significance === 'high' ? 'bg-red-100 text-red-800' :
                      pattern.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {pattern.significance === 'high' ? 'Alta' : pattern.significance === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {analysis && analysis.timeline && analysis.timeline.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" />
              Línea de Tiempo de Salud
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              <div className="space-y-6">
                {analysis.timeline.map((event, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                    <div className="ml-12 flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FaUserMd className="text-blue-600 mr-2" />
                          <span className="font-semibold text-gray-900">{event.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      {event.doctorName && (
                        <p className="text-sm text-gray-600 mb-1">Médico: {event.doctorName}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        event.status === 'completed' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        event.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'completed' ? 'Completado' :
                         event.status === 'pending' ? 'Pendiente' :
                         event.status === 'processing' ? 'En Proceso' :
                         'Cancelado'}
                      </span>
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {analysis && analysis.riskFactors && analysis.riskFactors.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaHeartbeat className="mr-2 text-red-600" />
              Factores de Riesgo
            </h2>
            <div className="space-y-3">
              {analysis.riskFactors.map((risk, index) => (
                <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-900">{risk.factor}</h3>
                      <p className="text-sm text-red-700">{risk.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      risk.level === 'high' ? 'bg-red-200 text-red-900' :
                      risk.level === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                      'bg-blue-200 text-blue-900'
                    }`}>
                      {risk.level === 'high' ? 'Alto' : risk.level === 'medium' ? 'Medio' : 'Bajo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Copilot */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FaBrain className="mr-2 text-purple-600" />
              Tu Copiloto de Salud
            </h2>
            <button
              onClick={fetchCopilot}
              disabled={loadingCopilot}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50"
            >
              {loadingCopilot ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {loadingCopilot ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-2xl text-purple-600 mr-3" />
              <span className="text-gray-600">Generando recomendaciones...</span>
            </div>
          ) : copilot ? (
            <div className="space-y-4">
              {/* Translation */}
              {copilot.translation && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FaInfoCircle className="mr-2 text-purple-600" />
                    Explicación Simple
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{copilot.translation}</p>
                </div>
              )}

              {/* Recommendations */}
              {copilot.recommendations && copilot.recommendations.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaLightbulb className="mr-2 text-yellow-600" />
                    Recomendaciones Personalizadas
                  </h3>
                  <ul className="space-y-2">
                    {copilot.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health Tips */}
              {copilot.healthTips && copilot.healthTips.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaHeartbeat className="mr-2 text-green-600" />
                    Consejos de Salud
                  </h3>
                  <ul className="space-y-2">
                    {copilot.healthTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No hay información disponible del copiloto.</p>
          )}
        </div>
      </div>
      <SaludSimpleFooter />
    </div>
  );
}

export default ClinicalTimeline;
