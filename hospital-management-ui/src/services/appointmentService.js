import API from './api';

const appointmentService = {
  // GET /slots
  getSlots: async () => {
    try {
      const response = await API.get('/slots');
      return response.data;
    } catch (error) {
      console.error('Error fetching slots:', error);
      throw error;
    }
  },

  // POST /slots
  createSlot: async (slotData) => {
    try {
      const response = await API.post('/slots', slotData);
      return response.data;
    } catch (error) {
      console.error('Error creating slot:', error);
      throw error;
    }
  },

  // PUT /slots/{id}
  updateSlot: async (id, slotData) => {
    try {
      const response = await API.put(`/slots/${id}`, slotData);
      return response.data;
    } catch (error) {
      console.error(`Error updating slot ID ${id}:`, error);
      throw error;
    }
  },

  // DELETE /slots/{id}
  deleteSlot: async (id) => {
    try {
      const response = await API.delete(`/slots/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting slot ID ${id}:`, error);
      throw error;
    }
  },

  // POST /appointments/book
  bookAppointment: async (doctorId, slotId, patientId) => {
    try {
      const response = await API.post('/appointments/book', {
        doctorId: Number(doctorId),
        slotId: Number(slotId),
        patientId: Number(patientId)
      });
      return response.data;
    } catch (error) {
      console.error(`Error booking appointment for doctor ${doctorId}, slot ${slotId}, patient ${patientId}:`, error);
      throw error;
    }
  },

  // GET /appointments
  getAppointments: async () => {
    try {
      const response = await API.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Alias for compatibility with existing code
  getAllAppointments: async () => {
    return await appointmentService.getAppointments();
  },

  // DELETE /appointments/cancel/{id}
  cancelAppointment: async (id) => {
    try {
      const response = await API.delete(`/appointments/cancel/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling appointment with ID ${id}:`, error);
      throw error;
    }
  },

  // GET /appointments/doctor/{doctorId}
  getAppointmentsByDoctor: async (doctorId) => {
    try {
      const response = await API.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for doctor ID ${doctorId}:`, error);
      throw error;
    }
  },

  // GET /appointments/patient/{patientId}
  getAppointmentsByPatient: async (patientId) => {
    try {
      const response = await API.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ID ${patientId}:`, error);
      throw error;
    }
  },

  // GET /appointments/status/{status}
  getAppointmentsByStatus: async (status) => {
    try {
      const response = await API.get(`/appointments/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments with status ${status}:`, error);
      throw error;
    }
  },

  // GET /dashboard/counts
  getDashboardStats: async () => {
    try {
      const response = await API.get('/dashboard/counts');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // PUT /appointments/complete/{id}
  completeAppointment: async (id) => {
    try {
      const response = await API.put(`/appointments/complete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error completing appointment with ID ${id}:`, error);
      throw error;
    }
  },

  // GET /reports/summary
  getReportsSummary: async () => {
    try {
      const response = await API.get('/reports/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports summary:', error);
      throw error;
    }
  },

  // GET /reports/top-doctors
  getTopDoctors: async () => {
    try {
      const response = await API.get('/reports/top-doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching top doctors:', error);
      throw error;
    }
  },

  // GET /reports/monthly-trend
  getMonthlyTrend: async () => {
    try {
      const response = await API.get('/reports/monthly-trend');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      throw error;
    }
  },

  // GET /appointments/{id}/receipt
  downloadReceipt: async (id) => {
    try {
      const response = await API.get(`/appointments/${id}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading receipt for appointment ID ${id}:`, error);
      throw error;
    }
  }
};

export default appointmentService;
