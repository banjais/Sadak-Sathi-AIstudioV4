import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import RNMapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getIncidents, Incident } from '../../api/incidentsApi';

const MapView = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Effect to fetch user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Effect to fetch incident data from the API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(data);
      } catch (error) {
        Alert.alert("Error", "Could not fetch incident data.");
      }
    };

    fetchIncidents();
  }, []);

  // Determine the initial region for the map
  const initialRegion = {
    latitude: location ? location.coords.latitude : 27.7172, // Default to Kathmandu
    longitude: location ? location.coords.longitude : 85.3240,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <RNMapView
      style={styles.map}
      provider={PROVIDER_GOOGLE} // Use Google Maps for better support
      initialRegion={initialRegion}
      showsUserLocation={true}
      followsUserLocation={true}
    >
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          coordinate={{
            latitude: incident.latitude,
            longitude: incident.longitude,
          }}
          title={incident.title}
          description={incident.description}
          pinColor="red" // Use a distinct color for incidents
        />
      ))}
    </RNMapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapView;
