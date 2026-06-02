import API from './api';

const doctorService = {
  // GET /doctors - Fetch all doctors
  getAllDoctors: async () => {
    try {
      const response = await API.get('/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // GET /doctors/specialization/{specialization} - Search by specialization
  getDoctorsBySpecialization: async (specialization) => {
    try {
      const response = await API.get(`/doctors/specialization/${specialization}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctors by specialization "${specialization}":`, error);
      throw error;
    }
  },

  // GET /api/doctor-slots/doctor/{doctorId} - Get slots for a doctor
  getDoctorSlots: async (doctorId) => {
    try {
      console.log("Selected doctor:", doctorId);
      const response = await API.get(`/api/doctor-slots/doctor/${doctorId}`);
      console.log("Slots API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching slots for doctor ${doctorId}:`, error);
      throw error;
    }
  },

  // POST /doctors - Create a new doctor (ADMIN only)
  createDoctor: async (doctor) => {
    try {
      const response = await API.post('/doctors', doctor);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },

  // PUT /doctors/{id} - Update an existing doctor (ADMIN only)
  updateDoctor: async (id, doctor) => {
    try {
      const response = await API.put(`/doctors/${id}`, doctor);
      return response.data;
    } catch (error) {
      console.error(`Error updating doctor ${id}:`, error);
      throw error;
    }
  },

  // DELETE /doctors/{id} - Delete a doctor (ADMIN only)
  deleteDoctor: async (id) => {
    try {
      const response = await API.delete(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting doctor ${id}:`, error);
      throw error;
    }
  }
};

export default doctorService;
