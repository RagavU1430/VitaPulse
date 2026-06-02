import API from './api';

const patientService = {
  // GET /patients - Fetch all patients
  getAllPatients: async () => {
    try {
      const response = await API.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Alias for consistency
  getPatients: async () => {
    return await patientService.getAllPatients();
  },

  // GET /patients/{id} - Fetch patient by ID
  getPatientById: async (id) => {
    try {
      const response = await API.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  // GET /patients/search?keyword={keyword} - Search patients by name or email
  searchPatients: async (keyword) => {
    try {
      const response = await API.get('/patients/search', { params: { keyword } });
      return response.data;
    } catch (error) {
      console.error(`Error searching patients with keyword "${keyword}":`, error);
      throw error;
    }
  },

  // Alias for backward compatibility
  searchPatientsByName: async (name) => {
    return await patientService.searchPatients(name);
  },

  // GET /patients/{id}/details - Fetch patient user profile (User-based)
  getPatientDetails: async (id) => {
    try {
      const response = await API.get(`/patients/${id}/details`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient details for ${id}:`, error);
      throw error;
    }
  },

  // GET /patients/{id}/appointments - Fetch patient appointment history
  getPatientAppointments: async (id) => {
    try {
      const response = await API.get(`/patients/${id}/appointments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${id}:`, error);
      throw error;
    }
  },

  // GET /patients/{id}/stats - Fetch patient appointment statistics
  getPatientStats: async (id) => {
    try {
      const response = await API.get(`/patients/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for patient ${id}:`, error);
      throw error;
    }
  }
};

export default patientService;
