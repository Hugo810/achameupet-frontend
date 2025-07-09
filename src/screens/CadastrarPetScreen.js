import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Configuração inicial de permissões
  useEffect(() => {
    (async () => {
      // Solicita permissão para acessar a galeria
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para adicionar fotos');
      }

      // Solicita permissão de localização
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        setLocationError('Permissão de localização negada. Você pode selecionar manualmente no mapa.');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setForm(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }));
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setLocationError('Não foi possível obter sua localização. Selecione manualmente no mapa.');
      }
    })();
  }, []);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        allowsMultipleSelection: true
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg'
        }));
        setFotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Limite de 5 fotos
      }
    } catch (error) {
      console.error('Erro ao selecionar imagens:', error);
      Alert.alert('Erro', 'Não foi possível selecionar as imagens');
    }
  };

  const removePhoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validações
    if (!form.nome || !form.raca) {
      Alert.alert('Atenção', 'Nome e raça são obrigatórios');
      return;
    }
    if (fotos.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos uma foto');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Atenção', 'Selecione uma localização no mapa');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Adiciona campos do formulário
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Adiciona fotos
      fotos.forEach((photo, index) => {
        formData.append('fotos', {
          uri: photo.uri,
          name: `photo_${index}.jpg`,
          type: 'image/jpeg'
        });
      });

      const token = await auth.currentUser.getIdToken(true);
      
      const response = await api.post('/animais', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        transformRequest: () => formData
      });

      if (response.data.success) {
        Alert.alert('Sucesso', 'Pet cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.data.error || 'Erro ao cadastrar pet');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível cadastrar o pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Seção de Informações Básicas */}
      <Text style={styles.sectionTitle}>Informações do Pet</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome *"
        value={form.nome}
        onChangeText={text => setForm({...form, nome: text})}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Tipo:</Text>
        <View style={styles.pickerOptions}>
          {['Cachorro', 'Gato', 'Outro'].map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.pickerOption,
                form.tipo === tipo && styles.pickerOptionSelected
              ]}
              onPress={() => setForm({...form, tipo})}
            >
              <Text style={form.tipo === tipo ? styles.pickerOptionTextSelected : styles.pickerOptionText}>
                {tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Raça *"
        value={form.raca}
        onChangeText={text => setForm({...form, raca: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Cor"
        value={form.cor}
        onChangeText={text => setForm({...form, cor: text})}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Porte:</Text>
        <View style={styles.pickerOptions}>
          {['Pequeno', 'Médio', 'Grande'].map(porte => (
            <TouchableOpacity
              key={porte}
              style={[
                styles.pickerOption,
                form.porte === porte && styles.pickerOptionSelected
              ]}
              onPress={() => setForm({...form, porte})}
            >
              <Text style={form.porte === porte ? styles.pickerOptionTextSelected : styles.pickerOptionText}>
                {porte}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Sexo:</Text>
        <View style={styles.pickerOptions}>
          {['Macho', 'Fêmea'].map(sexo => (
            <TouchableOpacity
              key={sexo}
              style={[
                styles.pickerOption,
                form.sexo === sexo && styles.pickerOptionSelected
              ]}
              onPress={() => setForm({...form, sexo})}
            >
              <Text style={form.sexo === sexo ? styles.pickerOptionTextSelected : styles.pickerOptionText}>
                {sexo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Status:</Text>
        <View style={styles.pickerOptions}>
          {['Perdido', 'Encontrado', 'Para adoção'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.pickerOption,
                form.status === status && styles.pickerOptionSelected
              ]}
              onPress={() => setForm({...form, status})}
            >
              <Text style={form.status === status ? styles.pickerOptionTextSelected : styles.pickerOptionText}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descrição (opcional)"
        value={form.descricao}
        onChangeText={text => setForm({...form, descricao: text})}
        multiline
      />

      {/* Seção de Localização */}
      <Text style={styles.sectionTitle}>Localização</Text>
      
      {locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}
      
      {form.latitude && form.longitude ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: form.latitude,
              longitude: form.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={(e) => {
              setForm({
                ...form,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude
              });
            }}
            onMapReady={() => setMapLoaded(true)}
          >
            <Marker
              coordinate={{
                latitude: form.latitude,
                longitude: form.longitude
              }}
              draggable
              onDragEnd={(e) => {
                setForm({
                  ...form,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude
                });
              }}
            />
          </MapView>
          {!mapLoaded && (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" />
          <Text>Carregando mapa...</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Ponto de referência (opcional)"
        value={form.referencia}
        onChangeText={text => setForm({...form, referencia: text})}
      />

      {/* Seção de Fotos */}
      <Text style={styles.sectionTitle}>Fotos (máx. 5)</Text>
      
      <View style={styles.photosContainer}>
        {fotos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <TouchableOpacity 
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {fotos.length < 5 && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleImagePick}
          disabled={fotos.length >= 5}
        >
          <Icon name="add-a-photo" size={24} color="white" />
          <Text style={styles.addButtonText}>Adicionar Fotos ({fotos.length}/5)</Text>
        </TouchableOpacity>
      )}

      {/* Botão de Envio */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar Pet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white'
  },
  pickerContainer: {
    marginBottom: 15
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555'
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5'
  },
  pickerOptionSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4'
  },
  pickerOptionText: {
    color: '#333'
  },
  pickerOptionTextSelected: {
    color: 'white'
  },
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  mapPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15
  },
  photoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  }
});