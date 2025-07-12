import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';
import { auth } from '../services/firebaseConfig';

export default function BuscarPetScreen() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [petSelecionado, setPetSelecionado] = useState(null); // pet selecionado para detalhe
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [erroDetalhe, setErroDetalhe] = useState('');

  useEffect(() => {
    buscarAnimais();
  }, []);

  const buscarAnimais = async () => {
    setCarregando(true);
    setErro('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErro('Permissão de localização negada.');
        setCarregando(false);
        return;
      }

      const localizacao = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = localizacao.coords;

      const token = await auth.currentUser.getIdToken(true);

      const res = await api.get('/animais/proximos', {
        headers: { Authorization: `Bearer ${token}` },
        params: { latitude, longitude },
      });

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

  // Função para carregar detalhes do pet selecionado
  const carregarDetalhePet = async (petId) => {
    setCarregandoDetalhe(true);
    setErroDetalhe('');
    try {
      const token = await auth.currentUser.getIdToken(true);
      const response = await api.get(`/animais/${petId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPetSelecionado(response.data.data);
      } else {
        setErroDetalhe('Não foi possível carregar os detalhes do pet.');
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do pet:', err);
      setErroDetalhe('Erro ao carregar os detalhes do pet.');
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  // Renderiza cada item da lista
  const renderItem = ({ item }) => {
    const fotoUri = item.fotos && item.fotos.length > 0
      ? (typeof item.fotos[0] === 'string'
        ? (item.fotos[0].startsWith('http') ? item.fotos[0] : `http://192.168.0.9:3000${item.fotos[0]}`)
        : item.fotos[0].uri)
      : 'https://via.placeholder.com/100';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => carregarDetalhePet(item.id)}
      >
        <Image source={{ uri: fotoUri }} style={styles.foto} />
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome || 'Animal sem nome'}</Text>
          <Text style={styles.detalhes}>{[item.raca, item.cor].filter(Boolean).join(' • ')}</Text>
          <Text style={styles.distancia}>
            {item.distancia ? `Distância: ${parseFloat(item.distancia).toFixed(1)} km` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Tela de detalhes do pet selecionado
  const TelaDetalhes = () => {
    if (carregandoDetalhe) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }

    if (erroDetalhe) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{erroDetalhe}</Text>
          <Button title="Voltar" onPress={() => setPetSelecionado(null)} />
        </View>
      );
    }

    if (!petSelecionado) return null;

    const pet = petSelecionado;

    const fotoUri = pet.fotos && pet.fotos.length > 0
      ? (typeof pet.fotos[0] === 'string'
        ? (pet.fotos[0].startsWith('http') ? pet.fotos[0] : `http://192.168.0.9:3000${pet.fotos[0]}`)
        : pet.fotos[0].uri)
      : 'https://via.placeholder.com/300';

    const abrirMapa = () => {
      if (!pet.latitude || !pet.longitude) {
        Alert.alert('Localização indisponível', 'Não há localização cadastrada para este pet.');
        return;
      }
      const url = Platform.select({
        ios: `maps:0,0?q=${pet.latitude},${pet.longitude}`,
        android: `geo:0,0?q=${pet.latitude},${pet.longitude}`,
      });
      Linking.openURL(url).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o mapa.');
      });
    };

    return (
      <ScrollView contentContainerStyle={styles.containerDetalhes}>
        <Image source={{ uri: fotoUri }} style={styles.photoDetalhe} resizeMode="cover" />

        <View style={styles.infoSection}>
          <Text style={styles.name}>{pet.nome || 'Sem nome'}</Text>
          <Text style={styles.subInfo}>{pet.tipo} • {pet.raca} • {pet.cor}</Text>
          <Text style={[styles.status, pet.status === 'Perdido' ? styles.statusPerdido : styles.statusEncontrado]}>
            {pet.status}
          </Text>
          <Text style={styles.subInfo}>Porte: {pet.porte} • Sexo: {pet.sexo}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{pet.descricao || 'Nenhuma descrição fornecida.'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <Text>Latitude: {pet.latitude}</Text>
          <Text>Longitude: {pet.longitude}</Text>
          {pet.referencia ? <Text>Referência: {pet.referencia}</Text> : null}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 20 }}>
          {pet.latitude && pet.longitude ? (
            <View style={{ marginRight: 10, flex: 1 }}>
              <Button title="Ver no mapa" onPress={abrirMapa} />
            </View>
          ) : null}

          <View style={{ flex: 1 }}>
            <Button title="Voltar para a lista" onPress={() => setPetSelecionado(null)} />
          </View>
        </View>
      </ScrollView>
    );
  };

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
        <Text style={styles.errorText}>{erro}</Text>
      </View>
    );
  }

  // Se tem pet selecionado, mostra o detalhe, senão lista
  return petSelecionado ? (
    <TelaDetalhes />
  ) : (
    <FlatList
      data={animais}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.lista}
      ListEmptyComponent={<Text style={styles.semResultados}>Nenhum pet encontrado por perto.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  foto: {
    width: 100,
    height: 100,
    backgroundColor: '#eee',
  },
  info: {
    padding: 10,
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detalhes: {
    color: '#7f8c8d',
    marginVertical: 5,
  },
  distancia: {
    color: '#2980b9',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  semResultados: {
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
  },

  // Estilos do detalhe
  containerDetalhes: {
    padding: 20,
    backgroundColor: '#fff',
  },
  photoDetalhe: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoSection: {
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subInfo: {
    fontSize: 16,
    color: '#555',
    marginVertical: 2,
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
    color: '#fff',
  },
  statusPerdido: {
    backgroundColor: '#e74c3c',
  },
  statusEncontrado: {
    backgroundColor: '#27ae60',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#444',
  },
});
