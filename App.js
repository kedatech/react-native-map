import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const ORS_API_KEY = ''; 

export default function App() {
  const [location, setLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [walkingRoute, setWalkingRoute] = useState([]);

  // Paradas de bus simuladas
  const busStops = [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78885, longitude: -122.4310 },
    { latitude: 37.78925, longitude: -122.4224 },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permiso denegado",
          "No se pudo acceder a tu ubicación. Por favor selecciona manualmente tu ubicación en el mapa.",
          [{ text: "OK" }]
        );
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      findNearestBusStop(userLocation.coords);
    })();
  }, []);

  const findNearestBusStop = async (currentLocation) => {
    let minDistance = Infinity;
    let nearest = null;

    for (let stop of busStops) {
      const distance = await getWalkingDistance(currentLocation, stop);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = stop;
      }
    }

    setNearestStop(nearest);
    if (nearest) {
      getWalkingRoute(currentLocation, nearest);
    }
  };

  const getWalkingDistance = async (origin, destination) => {
    try {
      const response = await axios.post(`https://api.openrouteservice.org/v2/directions/foot-walking`, {
        coordinates: [
          [origin.longitude, origin.latitude],  // ORS usa coordenadas [longitud, latitud]
          [destination.longitude, destination.latitude]
        ]
      }, {
        headers: {
          Authorization: `Bearer ${ORS_API_KEY}`,
        }
      });

      const distance = response.data.routes[0].summary.distance; // distancia en metros
      return distance;
    } catch (error) {
      console.error("Error al calcular la distancia de la caminata:", error);
      return Infinity;
    }
  };

  const getWalkingRoute = async (origin, destination) => {
    try {
      const response = await axios.post(`https://api.openrouteservice.org/v2/directions/foot-walking`, {
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude]
        ]
      }, {
        headers: {
          Authorization: `Bearer ${ORS_API_KEY}`,
        }
      });

      const points = decodePolyline(response.data.routes[0].geometry);
      setWalkingRoute(points);
    } catch (error) {
      console.error("Error al obtener la ruta de caminata:", error);
    }
  };

  // Función para decodificar la polyline de ORS (similar a Google)
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    setManualLocation(coords);
    findNearestBusStop(coords);
  };

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        initialRegion={{
          latitude: location ? location.latitude : 37.78825,
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {(location || manualLocation) && (
          <Marker
            coordinate={manualLocation || { latitude: location.latitude, longitude: location.longitude }}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}

        {busStops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={`Parada ${index + 1}`}
            pinColor="green"
          />
        ))}

        {walkingRoute.length > 0 && (
          <Polyline
            coordinates={walkingRoute}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        )}

        <Polyline
          coordinates={busStops}
          strokeColor="#FF0000"
          strokeWidth={4}
        />
      </MapView>

      {modalVisible && nearestStop && (
        <View className="absolute top-10 left-5 bg-white p-4 rounded-lg shadow-lg z-10">
          <Text className="text-lg font-bold">Detalles del viaje</Text>
          <Text>Parada más cercana: {nearestStop.latitude}, {nearestStop.longitude}</Text>
        </View>
      )}
    </View>
  );
}
