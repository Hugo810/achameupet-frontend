import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.56.11:3000/api',
  
});

export const buscarAnimaisDoUsuario = async (token) => {
  try {
    const response = await api.get('/animais/meus', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Retorne diretamente os dados da resposta da API
    return response.data;
  } catch (error) {
    console.error('Erro na API buscarAnimaisDoUsuario:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Erro desconhecido',
    };
  }
};



export default api;
