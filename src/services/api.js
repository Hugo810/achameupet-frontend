import axios from 'axios';

const api = axios.create({

  baseURL: 'http://192.168.0.9:3000/api', // Para celular real
});

export default api;
