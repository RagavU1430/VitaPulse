import API from './api';

const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', email);
      if (response.data.id) {
        localStorage.setItem('id', response.data.id);
      }
      if (response.data.name) {
        localStorage.setItem('name', response.data.name);
      }
    }
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await API.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const id = localStorage.getItem('id');
    const name = localStorage.getItem('name');
    if (!token) return null;
    return { token, role, email, id: id ? Number(id) : null, name };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
