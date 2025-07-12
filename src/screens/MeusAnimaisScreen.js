import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { auth } from '../services/firebaseConfig';
import { buscarAnimaisDoUsuario } from '../services/api';
// Você pode importar também as funções de editar/remover se quiser usá-las depois

export default function MeusAnimaisScreen({ navigation }) {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const token = await auth.currentUser.getIdToken(true);
        const resposta = await buscarAnimaisDoUsuario(token);
        if (resposta.success) {
          setAnimais(resposta.data);
        } else {
          console.warn('Erro ao buscar animais:', resposta.error);
          setAnimais([]);
        }
      } catch (error) {
        console.error('Erro ao buscar animais:', error);
        setAnimais([]);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const handleDetalhes = (animal) => {
    // Supondo que você tenha uma tela chamada "DetalhesAnimal"
    navigation.navigate('DetalhesAnimal', { animal });
  };

  const handleEditar = (animal) => {
    navigation.navigate('EditarAnimal', { animal });
  };

  const handleRemover = (animalId) => {
    Alert.alert(
      'Remover Animal',
      'Tem certeza que deseja remover este animal?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            // Implemente a lógica de remoção aqui se quiser
            Alert.alert('Ainda não implementado.');
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Animais</Text>

      <FlatList
        data={animais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.fotos && item.fotos.length > 0 ? (
              <Image
                source={{ uri: item.fotos[0] }}
                style={styles.imagem}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.semFoto}>
                <Text style={styles.semFotoTexto}>📷 Sem foto</Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.tipoRaca}>
                {item.tipo} - {item.raca}
              </Text>
              <Text style={[styles.status, statusColor(item.status)]}>
                Status: {item.status}
              </Text>

              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={[styles.botao, styles.botaoDetalhes]}
                  onPress={() => handleDetalhes(item)}
                >
                  <Text style={styles.botaoTexto}>🔍 Detalhes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botao, styles.botaoEditar]}
                  onPress={() => handleEditar(item)}
                >
                  <Text style={styles.botaoTexto}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botao, styles.botaoRemover]}
                  onPress={() => handleRemover(item.id)}
                >
                  <Text style={styles.botaoTexto}>❌ Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum animal encontrado.</Text>}
      />
    </View>
  );
}

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'adotado':
      return { color: 'green' };
    case 'disponível':
      return { color: '#007bff' };
    case 'perdido':
      return { color: 'red' };
    default:
      return { color: '#555' };
  }
};

// ... (imports e lógica inicial permanecem os mesmos)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagem: {
    width: '100%',
    height: 200,
  },
  semFoto: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semFotoTexto: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    padding: 12,
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  tipoRaca: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  botoesContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  botao: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  botaoTexto: {
    fontWeight: '600',
    fontSize: 14,
  },
  botaoDetalhes: {
    backgroundColor: '#cce5ff',
  },
  botaoEditar: {
    backgroundColor: '#fff3cd',
  },
  botaoRemover: {
    backgroundColor: '#f8d7da',
  },
});
