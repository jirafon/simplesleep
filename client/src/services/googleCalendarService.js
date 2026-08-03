// Google Calendar Service
// Este servicio maneja la integración con Google Calendar API

class GoogleCalendarService {
  constructor() {
    this.CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
    this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
    this.SCOPES = 'https://www.googleapis.com/auth/calendar.events';
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  async initialize() {
    try {
      // Cargar Google API
      await this.loadGoogleAPI();
      
      // Inicializar Google Identity Services
      await this.initializeGoogleIdentity();
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      return false;
    }
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.API_KEY,
              discoveryDocs: [this.DISCOVERY_DOC],
            });
            this.gapiInited = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initializeGoogleIdentity() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.error) {
              reject(new Error(tokenResponse.error));
            } else {
              this.gisInited = true;
              resolve();
            }
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async requestAccessToken() {
    if (!this.tokenClient) {
      throw new Error('Google Identity Services not initialized');
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
      
      // El callback se maneja en initializeGoogleIdentity
      setTimeout(() => {
        if (this.gisInited) {
          resolve();
        } else {
          reject(new Error('Failed to get access token'));
        }
      }, 1000);
    });
  }

  async createEvent(eventData) {
    try {
      if (!this.gapiInited || !this.gisInited) {
        await this.initialize();
      }

      // Solicitar token de acceso si es necesario
      await this.requestAccessToken();

      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: eventData.start.timeZone,
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: eventData.end.timeZone,
        },
        attendees: eventData.attendees,
        reminders: eventData.reminders,
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async getAvailableSlots(date, duration = 60) {
    try {
      if (!this.gapiInited || !this.gisInited) {
        await this.initialize();
      }

      await this.requestAccessToken();

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.result.items || [];
      const busySlots = events.map(event => ({
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date)
      }));

      return this.generateAvailableSlots(date, busySlots, duration);
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  generateAvailableSlots(date, busySlots, duration) {
    const slots = [];
    const businessHours = {
      start: 9, // 9 AM
      end: 18   // 6 PM
    };

    const slotDuration = 30; // 30 minutes slots
    const currentTime = new Date();

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        // Verificar si el slot está en el futuro
        if (slotStart <= currentTime) continue;

        // Verificar si el slot está disponible (no se superpone con eventos ocupados)
        const isAvailable = !busySlots.some(busySlot => 
          (slotStart < busySlot.end && slotEnd > busySlot.start)
        );

        if (isAvailable) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            time: slotStart.toLocaleTimeString('es-CL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          });
        }
      }
    }

    return slots;
  }
}

export default new GoogleCalendarService(); 