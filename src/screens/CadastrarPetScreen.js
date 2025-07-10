import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import { auth } from '../services/firebaseConfig';

export default function CadastrarPetScreen({ navigation }) {
  const [form, setForm] = useState({
    nome: '',
    tipo: 'Cachorro',
    raca: '',
    cor: '',
    porte: 'Médio',
    sexo: 'Macho',
    status: 'Perdido',
    descricao: '',
    referencia: '',
    latitude: null,
    longitude: null
  });

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    (async () => {
      const [imagePerm, locationPerm] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        Location.requestForegroundPermissionsAsync()
      ]);

      if (!imagePerm.granted) {
        Alert.alert('Permissão necessária', 'Acesso à galeria é obrigatório.');
      }

      if (!locationPerm.granted) {
        setLocationError('Permissão de localização negada. Selecione manualmente.');
      } else {
        try {
          const location = await Location.getLastKnownPositionAsync() || await Location.getCurrentPositionAsync();
          setForm(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }));
        } catch (err) {
          setLocationError('Erro ao obter localização. Selecione manualmente.');
        }
      }
    })();
  }, []);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5,
        aspect: [4, 3]
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}_${index}.jpg`,
          type: asset.type === 'image' ? asset.uri.endsWith('.png') ? 'image/png' : 'image/jpeg' : 'image/jpeg'
        }));

        setFotos(prev => {
          const total = [...prev, ...newPhotos].slice(0, 5);
          return total;
        });
      }
    } catch (err) {
      console.error('Erro ao escolher imagem:', err);
    }
  };

  const removePhoto = index => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validação básica dos campos obrigatórios
    if (!form.nome.trim() || !form.raca.trim()) {
      Alert.alert('Atenção', 'Nome e raça são obrigatórios.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      Alert.alert('Atenção', 'Selecione uma localização.');
      return;
    }

    if (fotos.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos uma foto.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Campos do formulário
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Fotos - append com campo 'fotos' (array)
      fotos.forEach((photo, index) => {
        // Extraindo extensão e definindo mimeType correto
        const uriParts = photo.uri.split('.');
        const extension = uriParts[uriParts.length - 1].toLowerCase();
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('fotos', {
          uri: photo.uri,
          name: photo.name || `photo_${Date.now()}_${index}.${extension}`,
          type: mimeType
        });
      });

      // Buscar token do usuário para autenticação Bearer
      const token = await auth.currentUser.getIdToken(true);

      // Requisição POST para cadastro do animal com headers multipart e token
      const response = await api.post('/animais', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro no cadastro');
      }

      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Erro no cadastro:', err);
      Alert.alert('Erro', err.response?.data?.error || err.message || 'Erro ao cadastrar o pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Informações do Pet</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome *"
        value={form.nome}
        onChangeText={text => setForm({ ...form, nome: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Raça *"
        value={form.raca}
        onChangeText={text => setForm({ ...form, raca: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Cor"
        value={form.cor}
        onChangeText={text => setForm({ ...form, cor: text })}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descrição"
        multiline
        value={form.descricao}
        onChangeText={text => setForm({ ...form, descricao: text })}
      />

      <Text style={styles.sectionTitle}>Localização</Text>

      {locationError && <Text style={styles.errorText}>{locationError}</Text>}

      {form.latitude && form.longitude ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: form.latitude,
              longitude: form.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            }}
            onPress={e => {
              setForm({ ...form, latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude });
            }}
            onMapReady={() => {}}
          >
            <Marker
              coordinate={{ latitude: form.latitude, longitude: form.longitude }}
              draggable
              onDragEnd={e => setForm({ ...form, latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude })}
            />
          </MapView>
        </View>
      ) : (
        <ActivityIndicator size="large" />
      )}

      <TextInput
        style={styles.input}
        placeholder="Ponto de referência"
        value={form.referencia}
        onChangeText={text => setForm({ ...form, referencia: text })}
      />

      <Text style={styles.sectionTitle}>Fotos</Text>

      <View style={styles.photosContainer}>
        {fotos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {fotos.length < 5 && (
        <TouchableOpacity style={styles.addButton} onPress={handleImagePick}>
          <Icon name="add-a-photo" size={24} color="white" />
          <Text style={styles.addButtonText}>Adicionar Fotos ({fotos.length}/5)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Cadastrar Pet</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 15 },
  mapContainer: { height: 250, borderRadius: 8, overflow: 'hidden', marginBottom: 15 },
  map: { ...StyleSheet.absoluteFillObject },
  errorText: { color: 'red', marginBottom: 10 },
  photosContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  photoWrapper: { position: 'relative', marginRight: 10, marginBottom: 10 },
  photo: { width: 80, height: 80, borderRadius: 6 },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f00',
    borderRadius: 12,
    padding: 2,
    zIndex: 10
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a84ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  addButtonText: { color: '#fff', marginLeft: 8 },
  submitButton: {
    backgroundColor: '#34c759',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7'
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
