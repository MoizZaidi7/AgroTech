import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this URL based on your backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;