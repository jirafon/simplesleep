import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

/**
 * Componente de diagnóstico de conexión
 * Muestra visualmente si el frontend está conectado al backend correcto
 * 
 * Para usarlo: Agrégalo temporalmente a cualquier página
 * import DiagnosticPanel from '../components/DiagnosticPanel';
 * <DiagnosticPanel />
 */
const DiagnosticPanel = () => {
  const [healthStatus, setHealthStatus] = useState('checking...');
  const [healthData, setHealthData] = useState(null);
  const [apiConfig, setApiConfig] = useState({});

  useEffect(() => {
    // Detectar configuración
    const baseUrl = process.env.REACT_APP_BASE_URL;
    setApiConfig({
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      reactAppBaseUrl: baseUrl || 'NOT SET (using relative URLs)',
      mode: baseUrl ? 'SEPARATE SERVICES' : 'SAME DOMAIN',
      exampleCall: baseUrl ? `${baseUrl}/api/auth/login` : '/api/auth/login',
      nodeEnv: process.env.NODE_ENV
    });

    // Probar conectividad
    const testHealth = async () => {
      try {
        const healthUrl = getApiUrl('/health');
        console.log('🧪 Testing health endpoint:', healthUrl);
        
        const response = await fetch(healthUrl);
        const data = await response.json();
        
        setHealthStatus('connected ✅');
        setHealthData(data);
        console.log('✅ Health check successful:', data);
      } catch (error) {
        setHealthStatus('error ❌');
        console.error('❌ Health check failed:', error);
      }
    };

    testHealth();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #4F46E5',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '10px', 
        fontSize: '14px',
        color: '#4F46E5'
      }}>
        🔍 API Diagnostic Panel
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Current URL:</strong>
        <div style={{ color: '#666' }}>{apiConfig.currentUrl}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Mode:</strong>
        <div style={{ 
          color: apiConfig.mode === 'SAME DOMAIN' ? '#16A34A' : '#2563EB',
          fontWeight: 'bold'
        }}>
          {apiConfig.mode}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>REACT_APP_BASE_URL:</strong>
        <div style={{ color: '#666' }}>{apiConfig.reactAppBaseUrl}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Example API Call:</strong>
        <div style={{ color: '#666', wordBreak: 'break-all' }}>
          {apiConfig.exampleCall}
        </div>
      </div>

      <div style={{ 
        borderTop: '1px solid #E5E7EB', 
        paddingTop: '10px',
        marginTop: '10px'
      }}>
        <strong>Health Check:</strong>
        <div style={{ 
          color: healthStatus.includes('✅') ? '#16A34A' : 
                 healthStatus.includes('❌') ? '#DC2626' : '#666',
          fontWeight: 'bold'
        }}>
          {healthStatus}
        </div>
        {healthData && (
          <pre style={{ 
            background: '#F3F4F6', 
            padding: '8px', 
            borderRadius: '4px',
            marginTop: '8px',
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ 
        marginTop: '10px',
        fontSize: '11px',
        color: '#666'
      }}>
        ℹ️ Remove this component in production
      </div>
    </div>
  );
};

export default DiagnosticPanel;
