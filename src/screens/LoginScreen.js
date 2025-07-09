import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace('Home');
    } catch (error) {
      setErro('E-mail ou senha inválidos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} style={styles.input} />
      <Button title="Entrar" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('Cadastro')}>Criar conta</Text>
      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
  erro: { color: 'red', marginTop: 10 }
});
