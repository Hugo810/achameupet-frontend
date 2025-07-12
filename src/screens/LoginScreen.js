import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import * as Clipboard from 'expo-clipboard';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('shirley@gmail.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const token = await userCredential.user.getIdToken();

      Alert.alert(
        'Token JWT',
        token,
        [
          {
            text: 'Copiar',
            onPress: async () => {
              await Clipboard.setStringAsync(token);
              Alert.alert('Copiado para a área de transferência');
            }
          },
          {
            text: 'Ir para Home',
            onPress: () => navigation.replace('Home')
          }
        ],
        { cancelable: false }
      );

      console.log('TOKEN:', token);
    } catch (error) {
      setErro('E-mail ou senha inválidos');
      console.error('Erro no login:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo ao AchaMeuPet</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, styles.botaoCinza]} onPress={handleLogin}>
        <Text style={styles.botaoTexto}>Gerar Token para Postman</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    padding: 14,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  botao: {
    backgroundColor: '#3498DB',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 10,
  },
  botaoCinza: {
    backgroundColor: '#7F8C8D',
  },
  botaoTexto: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  erro: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  link: {
    marginTop: 20,
    color: '#2980B9',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
