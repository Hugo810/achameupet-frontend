import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import * as Clipboard from 'expo-clipboard';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('teste@fake.com'); // Email pré-preenchido para testes
  const [senha, setSenha] = useState('123456'); // Senha pré-preenchida para testes
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      // 1. Faz login no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      // 2. Obtém o token JWT
      const token = await userCredential.user.getIdToken();
      
      // 3. Exibe o token em um alerta (para copiar no Postman)
      Alert.alert(
        'Token para Postman',
        token,
        [
          {
            text: 'Copiar',
            onPress: async () => {
              await Clipboard.setStringAsync(token);
              Alert.alert('Token copiado!');
            }
          },
          {
            text: 'Ir para Home',
            onPress: () => navigation.replace('Home')
          }
        ],
        { cancelable: false }
      );

      // 4. Log no console para debug
      console.log('TOKEN:', token);

    } catch (error) {
      setErro('E-mail ou senha inválidos');
      console.error('Erro no login:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
      
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Senha" 
        secureTextEntry 
        value={senha} 
        onChangeText={setSenha} 
        style={styles.input} 
      />
      
      <Button title="Entrar" onPress={handleLogin} />
      
      {/* Botão extra apenas para testes */}
      <Button 
        title="Gerar Token para Postman" 
        onPress={handleLogin} 
        color="#888" 
      />
      
      <Text style={styles.link} onPress={() => navigation.navigate('Cadastro')}>
        Criar conta
      </Text>
      
      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    padding: 20 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    padding: 15,
    marginVertical: 10, 
    borderRadius: 8,
    borderColor: '#ccc'
  },
  link: { 
    marginTop: 15, 
    color: 'blue', 
    textAlign: 'center' 
  },
  erro: { 
    color: 'red', 
    marginTop: 10,
    textAlign: 'center' 
  }
});