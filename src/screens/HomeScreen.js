import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Certifique-se de ter instalado expo-vector-icons

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AchaMeuPet</Text>
        <Text style={styles.subtitle}>Conectando pets e seus tutores</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {/* Botão Buscar Pet */}
        <TouchableOpacity 
          style={[styles.seloButton, styles.buscarButton]}
          onPress={() => navigation.navigate('BuscarPet')}
        >
          <Ionicons name="search" size={32} color="#FFF" />
          <Text style={styles.buttonText}>Buscar Pet</Text>
          <Text style={styles.buttonSubtext}>Encontre pets perdidos</Text>
        </TouchableOpacity>

        {/* Botão Cadastrar Pet */}
        <TouchableOpacity 
          style={[styles.seloButton, styles.cadastrarButton]}
          onPress={() => navigation.navigate('CadastrarPet')}
        >
          <Ionicons name="paw" size={32} color="#FFF" />
          <Text style={styles.buttonText}>Cadastrar Pet</Text>
          <Text style={styles.buttonSubtext}>Registre um pet perdido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seloButton: {
    width: 280,
    height: 180,
    borderRadius: 25,
    padding: 20,
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buscarButton: {
    backgroundColor: '#3498DB', // Azul
  },
  cadastrarButton: {
    backgroundColor: '#2ECC71', // Verde
  },
  buttonText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
});