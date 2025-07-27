import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3005',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error.response?.data || new Error('Login failed');
    }
    console.error('An unexpected error occurred:', error);
    throw new Error('An unexpected error occurred');
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch profile:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch profile');
    }
    console.error('An unexpected error occurred:', error);
    throw new Error('An unexpected error occurred');
  }
};

export default apiClient;
