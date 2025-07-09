import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

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

      const res = await api.get(`/animais/proximos`, {
        params: { latitude, longitude }
      });

      setAnimais(res.data.data);
    } catch (err) {
      console.error('Erro ao buscar animais:', err);
      setErro('Erro ao buscar animais');
    } finally {
      setCarregando(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.fotos[0] }} style={styles.foto} />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome || 'Animal sem nome'}</Text>
        <Text style={styles.detalhes}>{item.raca} • {item.cor}</Text>
        <Text style={styles.distancia}>Distância: {item.distancia} km</Text>
      </View>
    </TouchableOpacity>
  );

  if (carregando) {
    return <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 50 }} />;
  }

  if (erro) {
    return <Text style={{ color: 'red', padding: 20 }}>{erro}</Text>;
  }

  if (animais.length === 0) {
    return <Text style={{ padding: 20 }}>Nenhum pet encontrado por perto.</Text>;
  }

  return (
    <FlatList
      data={animais}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 20 },
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
    height: 100
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
  }
});
