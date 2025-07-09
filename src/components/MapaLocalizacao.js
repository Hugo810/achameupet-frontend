// src/components/MapaLocalizacao.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function MapaLocalizacao({ onLocationChange }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização negada.');
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setLocation(newLocation);
        if (onLocationChange) onLocationChange(newLocation);
      } catch (err) {
        setError('Erro ao obter localização');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={location}
      showsUserLocation={true}
      onRegionChangeComplete={(region) => {
        const newLocation = {
          latitude: region.latitude,
          longitude: region.longitude,
        };
        setLocation(newLocation);
        if (onLocationChange) onLocationChange(newLocation);
      }}
    >
      <Marker
        coordinate={location}
        draggable
        onDragEnd={(e) => {
          const coords = e.nativeEvent.coordinate;
          setLocation(coords);
          if (onLocationChange) onLocationChange(coords);
        }}
        title="Local do Pet"
        description="Arraste para ajustar"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 250,
    width: '100%',
    borderRadius: 10,
    marginVertical: 15,
  },
  loader: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
});