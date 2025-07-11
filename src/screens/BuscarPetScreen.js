import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';
import { auth } from '../services/firebaseConfig'; // Importando o Firebase

export default function BuscarPetScreen({ navigation }) {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarAnimais();
  }, []);

  const buscarAnimais = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErro('Permissão de localização negada.');
        setCarregando(false);
        return;
      }

      const localizacao = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = localizacao.coords;

      // Obtendo o token JWT do Firebase
      const token = await auth.currentUser.getIdToken(true);
      console.log("Token JWT obtido:", token); // Verifique se o token está sendo obtido corretamente

      // Fazendo a requisição com o token no cabeçalho
      const res = await api.get('/animais/proximos', {
        headers: {
          Authorization: `Bearer ${token}`, // Enviando o token JWT no cabeçalho Authorization
        },
        params: { latitude, longitude }
      });

      // Verifique a resposta recebida
      console.log("Resposta recebida:", res.data); 

      if (res.data.success) {
        setAnimais(res.data.data || []);
      } else {
        setErro('Erro ao buscar animais');
      }
    } catch (err) {
      console.error('Erro ao buscar animais:', err);
      setErro('Erro ao buscar animais');
    } finally {
      setCarregando(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetalhesPet', { petId: item.id })}
    >
      <Image
        source={{ uri: item.fotos && item.fotos.length > 0 ? item.fotos[0] : 'https://via.placeholder.com/100' }}
        style={styles.foto}
      />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome || 'Animal sem nome'}</Text>
        <Text style={styles.detalhes}>{[item.raca, item.cor].filter(Boolean).join(' • ')}</Text>
        <Text style={styles.distancia}>
          {item.distancia ? `Distância: ${parseFloat(item.distancia).toFixed(1)} km` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.center}>
        <Text style={styles.erroTexto}>{erro}</Text>
      </View>
    );
  }

  if (animais.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.semResultados}>Nenhum pet encontrado por perto.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={animais}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 20
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3
  },
  foto: {
    width: 100,
    height: 100,
    backgroundColor: '#eee'
  },
  info: {
    padding: 10,
    flex: 1
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  detalhes: {
    color: '#7f8c8d',
    marginVertical: 5
  },
  distancia: {
    color: '#2980b9',
    fontWeight: '600'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  erroTexto: {
    color: 'red',
    textAlign: 'center'
  },
  semResultados: {
    textAlign: 'center',
    color: '#555'
  }
});
