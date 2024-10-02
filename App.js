import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Polyline, Marker, Callout } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "react-native-web";

const ORS_API_KEY = ""; // Coloca aquí tu clave de la API de OpenRouteService

const rawCoordinates = [
  [-89.83158465874861, 13.59889728079186],
  [-89.83167652053572, 13.597915220525152],
  [-89.83164687082633, 13.59767386450386],
  [-89.83110576363242, 13.597540578236945],
  [-89.83064619313862, 13.597382075552161],
  [-89.8302607469183, 13.59712991197128],
  [-89.82993899060345, 13.596913455261614],
  [-89.8283416329294, 13.595231907074165],
  [-89.82869719094974, 13.594581980343179],
  [-89.82919561031103, 13.593523856392508],
  [-89.8296307708734, 13.592760444705064],
  [-89.83010307774978, 13.59204861376331],
  [-89.83076112542945, 13.591151083371372],
  [-89.83022035963175, 13.590783562544019],
  [-89.82973213070788, 13.59055144170199],
  [-89.82877690020528, 13.590154256622867],
  [-89.82817192687925, 13.589901507487],
  [-89.8280127217952, 13.590288376491955],
  [-89.82787474405633, 13.590670086624911],
  [-89.8276306295944, 13.591222017756408],
  [-89.82729856485636, 13.591782239445465],
  [-89.82688147167947, 13.592277122972504],
  [-89.82655682407693, 13.59255251635038],
  [-89.82621228860955, 13.59289007974202],
  [-89.82603815944117, 13.592695009743423],
  [-89.82572236586434, 13.59240240444555],
  [-89.82523817458068, 13.59196484415699],
  [-89.82475415451886, 13.591577571168145],
  [-89.82444426340498, 13.591333730062715],
  [-89.82427898826172, 13.591230457052532],
  [-89.82392482724093, 13.591170214441732],
  [-89.82360903385502, 13.59088908149107],
  [-89.82302761951216, 13.590605080071995],
  [-89.82230445339277, 13.590240727302628],
  [-89.82153986671804, 13.58977682941503],
  [-89.82114143556929, 13.589484220513057],
  [-89.8209082795638, 13.589243248204824],
  [-89.82061524919528, 13.588986083721863],
  [-89.8200633482707, 13.589597120831925],
  [-89.81922848734645, 13.590450613179797],
  [-89.8175764094896, 13.592161870999206],
  [-89.81562210931773, 13.59423480304153],
  [-89.81037711967008, 13.599798008745154],
  [-89.80302279293512, 13.607522487491764],
  [-89.79642139754222, 13.615371422937528],
  [-89.77854929143956, 13.636834443548835],
  [-89.76815201035531, 13.649461318354057],
  [-89.75728143855649, 13.662572385385275],
  [-89.74849141615314, 13.673276427217289],
  [-89.74685231072607, 13.675346686556978],
  [-89.7451221372577, 13.67825455992498],
  [-89.74247232090256, 13.683524987048642],
  [-89.73508201486412, 13.69746081594947],
  [-89.7309337680013, 13.705735931142755],
  [-89.73028445309924, 13.70665099015315],
  [-89.72988646945225, 13.706899138347666],
  [-89.72947066564247, 13.707043410433883],
  [-89.72884101987364, 13.707141515401801],
  [-89.72833017519324, 13.707233849452109],
  [-89.72807475285275, 13.707412746570455],
  [-89.72803911252603, 13.707614727024264],
  [-89.72808663296163, 13.707828249028893],
  [-89.72826193533791, 13.708171420683698],
  [-89.72830945577353, 13.708304150286807],
  [-89.72811343397754, 13.708419567272742],
  [-89.72724203517048, 13.708760803442757],
  [-89.72699849293947, 13.70888776187681],
  [-89.72664802972834, 13.708985866074414],
  [-89.72641042755151, 13.709072428567112],
  [-89.72592334308831, 13.709112824386807],
  [-89.72402846261294, 13.709291718971528],
  [-89.7216124156886, 13.709447529260729],
  [-89.71918293413232, 13.709603337793851],
  [-89.71748407797, 13.709712980593196],
  [-89.72521661595476, 13.70905452699084],
];

// Componentes para los elementos de buses, paradas y rutas
const BusItem = ({ busInfo, onBusSelect }) => (
  <TouchableOpacity style={styles.busItem} onPress={() => onBusSelect(busInfo)}>
    <FontAwesome5 name="bus" size={24} color="green" />
    <Text style={styles.busText}>{busInfo}</Text>
  </TouchableOpacity>
);

const StopItem = ({ stopInfo, onStopSelect }) => (
  <TouchableOpacity
    style={styles.busItem}
    onPress={() => onStopSelect(stopInfo)}
  >
    <FontAwesome5 name="map-marker" size={24} color="green" />
    <Text style={styles.busText}>{stopInfo}</Text>
  </TouchableOpacity>
);

const TerminalItem = ({ terminalInfo, onStopSelect }) => (
  <TouchableOpacity
    style={styles.busItem}
    //onPress={() => onStopSelect(stopInfo)}
  >
    <FontAwesome5 name="warehouse" size={24} color="gray" />
    <Text style={styles.busText}>{terminalInfo}</Text>
  </TouchableOpacity>
);

const RouteItem = ({ routeInfo }) => (
  <TouchableOpacity
    style={styles.busItem}
    onPress={() => console.log(`Ruta seleccionada: ${routeInfo}`)}
  >
    <FontAwesome5 name="map" size={24} color="green" />
    <Text style={styles.busText}>{routeInfo}</Text>
  </TouchableOpacity>
);

// Función para convertir las coordenadas crudas a un formato usable
const convertCoordinates = (coords) =>
  coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lineCoordinates, setLineCoordinates] = useState([]);
  const [selectedStopInfo, setSelectedStopInfo] = useState("");
  const mapRef = useRef(null);
  const [markerCoords, setMarkerCoords] = useState(null);
  const busModalRef = useRef(null);
  const stopSelectedRef = useRef(null);
  const stopsModalRef = useRef(null);
  const routesModalRef = useRef(null);
  const terminalModalRef = useRef(null);

  const nearbyBuses = [
    "216 - hacia Santa Ana | Autobus",
    "202 - hacia San Salvador | Autobus",
    "113 - hacia La Libertad | Autobus",
    "252 - hacia Sonsonate | Microbus",
  ];

  const nearbyRoutes = [
    "216 | Sonsonate - Santa Ana y viceversa",
    "205 | Sonsonate - San Salvador y viceversa",
    "252 | Acajutla - Sonsonate y viceversa",
  ];

  const nearbyStops = [
    "Mercado Municipal | a 200m",
    "Colonia Acaxual | a 432m",
  ];

  const nearbyTerminals = [
    "Terminal Nueva, Sonsonate",
    "Terminal Vieja, Sonsonate",
    "Terminal de la 252, Sonsonate",
  ];

  const busStops = [
    { latitude: 13.59078164773139, longitude: -89.83090407745692 },
    { latitude: 13.590189705103981, longitude: -89.8280521869527 },
  ];

  const openBusModal = useCallback(() => busModalRef.current?.open(), []);
  const openStopsModal = useCallback(() => stopsModalRef.current?.open(), []);
  const openStopSelectedModal = useCallback(
    () => stopSelectedRef.current?.open(),
    []
  );
  const openRoutesModal = useCallback(() => routesModalRef.current?.open(), []);
  const openTerminalModal = useCallback(
    () => terminalModalRef.current?.open(),
    []
  );

  const handleBusSelect = (busInfo) => {
    if (busInfo.includes("252")) {
      const coordinates = convertCoordinates(rawCoordinates);
      setLineCoordinates(coordinates);

      mapRef.current.animateToRegion(
        {
          latitude: 13.59889728079186,
          longitude: -89.83158465874861,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } else {
      setLineCoordinates([]);
    }
    busModalRef.current.close();
  };

  const handleStopSelect = (stopInfo) => {
    if (stopInfo.includes("Mercado")) {
      const coordinates = {
        latitude: 13.59078164773139,
        longitude: -89.83090407745692,
      };
      setMarkerCoords(coordinates);
      setSelectedStopInfo(stopInfo); // Guardar el nombre de la parada seleccionada

      mapRef.current.animateToRegion(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
      stopsModalRef.current.close();
    } else if (stopInfo.includes("Acaxual")) {
      const coordinates = {
        latitude: busStops[1].latitude,
        longitude: busStops[1].longitude,
      };
      setMarkerCoords(coordinates);
      setSelectedStopInfo(stopInfo); // Guardar el nombre de la parada seleccionada

      mapRef.current.animateToRegion(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
      stopsModalRef.current.close();
    } else {
      setMarkerCoords([]);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#61dafb" barStyle={"dark-content"} />
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="¿A dónde vas?"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <FontAwesome5 name="search" size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 13.7942,
            longitude: -88.8965,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {lineCoordinates.length > 0 && (
            <Polyline
              coordinates={lineCoordinates}
              strokeColor="blue"
              strokeWidth={4}
            />
          )}
          {markerCoords && (
            <Marker coordinate={markerCoords} pinColor="blue">
              <Callout onPress={openStopSelectedModal}>
                <View style={{ padding: 5 }}>
                  <Text style={{ fontWeight: "bold" }}>Parada de bus</Text>
                  <Text>{selectedStopInfo}</Text>
                  <Text style={{ color: "green", marginTop: 5 }}>Ver más</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>
        <Modalize ref={busModalRef} snapPoint={300}>
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Buses que pasan por aquí...</Text>
            <ScrollView>
              {nearbyBuses.map((bus, index) => (
                <BusItem
                  key={index}
                  busInfo={bus}
                  onBusSelect={handleBusSelect}
                />
              ))}
            </ScrollView>
          </View>
        </Modalize>
        <Modalize ref={stopsModalRef} snapPoint={300}>
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Paradas de buses Cercanas</Text>
            <ScrollView>
              {nearbyStops.map((stop, index) => (
                <StopItem
                  key={index}
                  stopInfo={stop}
                  onStopSelect={handleStopSelect}
                />
              ))}
            </ScrollView>
          </View>
        </Modalize>
        <Modalize ref={routesModalRef} snapPoint={300}>
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Rutas Disponibles</Text>
            <ScrollView>
              {nearbyRoutes.map((route, index) => (
                <RouteItem key={index} routeInfo={route} />
              ))}
            </ScrollView>
          </View>
        </Modalize>
        {/* */}
        <Modalize ref={terminalModalRef} snapPoint={300}>
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Terminales de buses...</Text>
            <ScrollView>
              {nearbyTerminals.map((terminal, index) => (
                <TerminalItem
                  key={index}
                  terminalInfo={terminal}
                  //onStopSelect={handleStopSelect}
                />
              ))}
            </ScrollView>
          </View>
        </Modalize>
        <Modalize ref={stopSelectedRef} snapPoint={300}>
          <View style={{ padding: 20 }}>
            <Text style={styles.modalTitle}>Informacion de la parada</Text>
            <ScrollView>
              <Text className="text-lg text-center">selectedStopInfo</Text>
            </ScrollView>
          </View>
        </Modalize>
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.navItem} onPress={openBusModal}>
            <FontAwesome5 name="bus-alt" size={24} color="green" />
            <Text style={styles.navText}>Buses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={openRoutesModal}>
            <FontAwesome5 name="map" size={24} color="green" />
            <Text style={styles.navText}>Rutas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={openStopsModal}>
            <FontAwesome5 name="map-marker" size={24} color="green" />
            <Text style={styles.navText}>Paradas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={openTerminalModal}>
            <FontAwesome5 name="warehouse" size={24} color="green" />
            <Text style={styles.navText}>Terminales</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome5 name="user" size={24} color="green" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  map: {
    flex: 1,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  busItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  busText: {
    marginLeft: 10,
    fontSize: 16,
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "white",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
  },
});
