import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          <Ionicons name="search" size={28} color="#FFF" />
          <Text style={styles.buttonText}>Buscar Pet</Text>
          <Text style={styles.buttonSubtext}>Encontre pets perdidos</Text>
        </TouchableOpacity>

        {/* Botão Cadastrar Pet */}
        <TouchableOpacity 
          style={[styles.seloButton, styles.cadastrarButton]}
          onPress={() => navigation.navigate('CadastrarPet')}
        >
          <Ionicons name="paw" size={28} color="#FFF" />
          <Text style={styles.buttonText}>Cadastrar Pet</Text>
          <Text style={styles.buttonSubtext}>Registre um pet perdido</Text>
        </TouchableOpacity>

        {/* Botão Meus Animais */}
        <TouchableOpacity 
          style={[styles.seloButton, styles.meusAnimaisButton]}
          onPress={() => navigation.navigate('MeusAnimais')}
        >
          <Ionicons name="albums" size={28} color="#FFF" />
          <Text style={styles.buttonText}>Meus Animais</Text>
          <Text style={styles.buttonSubtext}>Veja seus pets cadastrados</Text>
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
    marginVertical: 30,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seloButton: {
    width: '48%',
    height: 140,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buscarButton: {
    backgroundColor: '#3498DB',
  },
  cadastrarButton: {
    backgroundColor: '#2ECC71',
  },
  meusAnimaisButton: {
    backgroundColor: '#E67E22',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textAlign: 'center',
  },
});
