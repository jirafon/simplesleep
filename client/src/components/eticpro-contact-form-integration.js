/**
 * Integración del formulario de contacto de Eticpro.com con el CRM
 * 
 * Instrucciones de uso:
 * 1. Incluir este script en tu página de contacto de Eticpro
 * 2. Modificar el selector del formulario según tu HTML
 * 3. Configurar la URL del endpoint del CRM
 */

class EticproContactFormIntegration {
  constructor(options = {}) {
    this.crmEndpoint = options.crmEndpoint || 'https://www.unbiax.com/api/crm/contact-form-eticpro';
    this.formSelector = options.formSelector || '#contact-form';
    this.successMessage = options.successMessage || '¡Gracias por tu interés en Eticpro! Te contactaremos pronto.';
    this.errorMessage = options.errorMessage || 'Hubo un error. Por favor intenta nuevamente.';
    this.loadingText = options.loadingText || 'Enviando...';
    
    this.init();
  }

  init() {
    const form = document.querySelector(this.formSelector);
    if (!form) {
      console.error('Formulario no encontrado:', this.formSelector);
      return;
    }

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ Integración de formulario de contacto Eticpro inicializada');
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
      // Mostrar estado de carga
      submitButton.disabled = true;
      submitButton.textContent = this.loadingText;
      
      // Recopilar datos del formulario
      const formData = this.collectFormData(form);
      
      // Validar datos requeridos
      if (!this.validateFormData(formData)) {
        throw new Error('Por favor completa todos los campos requeridos.');
      }
      
      // Enviar al CRM
      const response = await this.sendToCRM(formData);
      
      if (response.success) {
        this.showSuccess(this.successMessage);
        form.reset();
      } else {
        throw new Error(response.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error en envío del formulario Eticpro:', error);
      this.showError(error.message || this.errorMessage);
    } finally {
      // Restaurar botón
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Mapear tus campos específicos
    data.name = formData.get('tu_campo_nombre') || formData.get('nombre_contacto');
    data.email = formData.get('tu_campo_email') || formData.get('correo_electronico');
    data.company = formData.get('tu_campo_empresa') || formData.get('nombre_empresa');
    data.position = formData.get('tu_campo_cargo') || formData.get('posicion');
    // ... etc
    
    return data;
  }

  validateFormData(data) {
    const required = ['name', 'email', 'company'];
    return required.every(field => data[field] && data[field].trim() !== '');
  }

  async sendToCRM(data) {
    const response = await fetch(this.crmEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    messageDiv.textContent = message;
    
    // Estilos básicos
    messageDiv.style.cssText = `
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-weight: 500;
      ${type === 'success' 
        ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
        : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;
    
    // Insertar después del formulario
    const form = document.querySelector(this.formSelector);
    form.parentNode.insertBefore(messageDiv, form.nextSibling);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }
}

// Ejemplo de uso:
// document.addEventListener('DOMContentLoaded', function() {
//   new EticproContactFormIntegration({
//     crmEndpoint: 'https://www.unbiax.com/api/crm/contact-form-eticpro',
//     formSelector: '#contact-form',
//     successMessage: '¡Gracias por tu interés en Eticpro! Te contactaremos pronto.',
//     errorMessage: 'Hubo un error. Por favor intenta nuevamente.'
//   });
// });

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EticproContactFormIntegration;
}
