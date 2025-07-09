// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.10:3000', // Coloque o IP da sua máquina
});

export default api;
