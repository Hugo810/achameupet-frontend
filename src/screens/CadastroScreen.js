import React, { useState } from 'react';
import { 
  View, TextInput, Button, Text, StyleSheet, 
  ScrollView, Alert, Switch, ActivityIndicator, 
  TouchableOpacity, Image, Platform 
} from 'react-native';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CadastroScreen({ navigation }) {
  // Estados organizados
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    senha: '',
    whatsapp: '',
    cidade: '',
    bairro: '',
    tipoUsuario: 'Tutor',
    dataCadastro: new Date()
  });
  
  const [media, setMedia] = useState({ fotoPerfil: null });
  const [preferences, setPreferences] = useState({ receberPropaganda: true });
  const [uiState, setUiState] = useState({
    loading: false,
    showDatePicker: false
  });

  const handleChange = (campo, valor) => {
    if (campo === 'whatsapp') {
      valor = valor.replace(/\D/g, '');
    }
    setUserData({ ...userData, [campo]: valor });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setMedia({ fotoPerfil: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const validarCampos = () => {
    const camposObrigatorios = ['nome', 'email', 'senha', 'whatsapp', 'cidade', 'bairro'];
    const camposFaltantes = camposObrigatorios.filter(campo => !userData[campo]?.trim());

    if (camposFaltantes.length > 0) {
      Alert.alert('Atenção', `Preencha todos os campos obrigatórios: ${camposFaltantes.join(', ')}`);
      return false;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)) {
      Alert.alert('Atenção', 'Por favor, insira um e-mail válido');
      return false;
    }

    if (userData.senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (!/^[0-9]{10,11}$/.test(userData.whatsapp)) {
      Alert.alert('Atenção', 'WhatsApp deve conter DDD + número (10 ou 11 dígitos)');
      return false;
    }

    return true;
  };

  const handleCadastro = async () => {
    if (!validarCampos()) return;
    
    setUiState({ ...uiState, loading: true });
    
    try {
      // Verifica se e-mail já existe
      const methods = await fetchSignInMethodsForEmail(auth, userData.email);
      if (methods?.length > 0) {
        Alert.alert('E-mail já cadastrado', 'Este e-mail já está em uso. Deseja fazer login?', [
          { text: 'Sim', onPress: () => navigation.navigate('Login') },
          { text: 'Não', style: 'cancel' }
        ]);
        return;
      }

      // Cria usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.senha
      );
      
      // Prepara dados para o Firestore
      const userToSave = {
        nome: userData.nome,
        email: userData.email,
        whatsapp: `+55${userData.whatsapp}`,
        cidade: userData.cidade,
        bairro: userData.bairro,
        tipoUsuario: userData.tipoUsuario,
        receberPropaganda: preferences.receberPropaganda,
        fotoPerfil: media.fotoPerfil || null,
        dataCadastro: new Date().toISOString(),
        uid: userCredential.user.uid
      };

      // Salva no Firestore
      await setDoc(doc(db, "usuarios", userCredential.user.uid), userToSave);
      
      console.log("Usuário cadastrado com sucesso!");
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage = 'Erro durante o cadastro';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'E-mail já está em uso';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
          break;
        case 'permission-denied':
          errorMessage = 'Sem permissão para gravar no banco de dados';
          break;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setUiState({ ...uiState, loading: false });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setUiState({ ...uiState, showDatePicker: false });
    selectedDate && handleChange('dataCadastro', selectedDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Cadastro</Text>
      
      {/* Foto de Perfil */}
      <View style={styles.fotoContainer}>
        <TouchableOpacity onPress={pickImage}>
          {media.fotoPerfil ? (
            <Image source={{ uri: media.fotoPerfil }} style={styles.fotoPerfil} resizeMode="cover" />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoPlaceholderText}>+ Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Campos do formulário */}
      <TextInput 
        placeholder="Nome completo *" 
        value={userData.nome}
        onChangeText={t => handleChange('nome', t)} 
        style={styles.input}
        autoCapitalize="words"
      />
      
      <TextInput 
        placeholder="Email *" 
        value={userData.email}
        onChangeText={t => handleChange('email', t)} 
        style={styles.input} 
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput 
        placeholder="Senha (mínimo 6 caracteres) *" 
        value={userData.senha}
        onChangeText={t => handleChange('senha', t)} 
        style={styles.input} 
        secureTextEntry
      />
      
      <TextInput 
        placeholder="WhatsApp (com DDD) *" 
        value={userData.whatsapp}
        onChangeText={t => handleChange('whatsapp', t)} 
        style={styles.input} 
        keyboardType="number-pad"
        maxLength={11}
      />
      
      <TextInput 
        placeholder="Cidade *" 
        value={userData.cidade}
        onChangeText={t => handleChange('cidade', t)} 
        style={styles.input}
        autoCapitalize="words"
      />
      
      <TextInput 
        placeholder="Bairro *" 
        value={userData.bairro}
        onChangeText={t => handleChange('bairro', t)} 
        style={styles.input}
        autoCapitalize="words"
      />
      
      {/* Tipo de Usuário */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tipo de Usuário *</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, userData.tipoUsuario === 'Tutor' && styles.radioButtonSelected]}
            onPress={() => handleChange('tipoUsuario', 'Tutor')}
          >
            <Text style={styles.radioText}>Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radioButton, userData.tipoUsuario === 'Veterinário' && styles.radioButtonSelected]}
            onPress={() => handleChange('tipoUsuario', 'Veterinário')}
          >
            <Text style={styles.radioText}>Veterinário</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Data de Cadastro */}
      <TouchableOpacity 
        onPress={() => setUiState({ ...uiState, showDatePicker: true})} 
        style={styles.dataContainer}
      >
        <Text style={styles.textoData}>
          Data de Cadastro: {userData.dataCadastro?.toLocaleDateString('pt-BR') || 'Selecione'}
        </Text>
      </TouchableOpacity>
      
      {uiState.showDatePicker && (
        <DateTimePicker
          value={userData.dataCadastro}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          locale="pt-BR"
        />
      )}
      
      {/* Receber propaganda */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Receber promoções e novidades?</Text>
        <Switch
          value={preferences.receberPropaganda}
          onValueChange={t => setPreferences({ receberPropaganda: t })}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={preferences.receberPropaganda ? '#2196F3' : '#f4f3f4'}
        />
      </View>

      {uiState.loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <Button 
          title="Cadastrar" 
          onPress={handleCadastro} 
          color="#2196F3"
          disabled={uiState.loading}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  input: { 
    borderWidth: 1, 
    padding: 15,
    marginVertical: 8, 
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 16
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2196F3'
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  fotoPlaceholderText: {
    color: '#888',
    fontSize: 16
  },
  pickerContainer: {
    marginVertical: 10
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333'
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  radioButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  radioButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3'
  },
  radioText: {
    fontSize: 16
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 5
  },
  switchText: {
    fontSize: 16,
    color: '#333'
  },
  dataContainer: {
    borderWidth: 1, 
    padding: 15,
    marginVertical: 8, 
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  textoData: {
    fontSize: 16,
    color: '#333'
  }
});