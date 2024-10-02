import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { Linking, Button, View } from "react-native";

// Componente funcional que utiliza hooks
export default function App() {
  // Función para abrir el navegador y redirigir a la API de Spring
  const handleLogin = async () => {
    const result = await WebBrowser.openBrowserAsync(
      "https://spring-oauth-api.onrender.com/grantcode"
    );
  };

  useEffect(() => {
    // Función que manejará el evento de redirección cuando el token llegue
    const handleUrl = ({ url }) => {
      // Extraer el token de la URL
      const token = url?.split("token=")[1];
      if (token) {
        // Guarda el token en el almacenamiento local o en el estado
        console.log("Token JWT recibido:", token);

        // Cierra el navegador
        WebBrowser.dismissBrowser();
      }
    };

    // Escuchar los eventos de redirección
    const subscription = Linking.addEventListener("url", handleUrl);

    // Limpiar el evento cuando se desmonte el componente
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View>
      <Button title="Login con Google" onPress={handleLogin} />
    </View>
  );
}
