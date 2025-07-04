
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { getToken, getRole } from './src/utils/auth';
import { LogBox, View, Text } from 'react-native';

LogBox.ignoreLogs(["Tried to enqueue runnable"]);

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("ERROR GLOBAL:", error.message, error.stack);
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticación...");
        const token = await getToken();
        console.log("Token obtenido:", JSON.stringify(token));
        const rol = await getRole();
        console.log("Rol obtenido:", JSON.stringify(rol));

        if (token && (rol === 0 || rol === 1)) {
          setIsAuthenticated(true);
        } else {
          console.log("🧪 No hay token o rol válido. Mostrando Login.");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
    </NavigationContainer>
  );
}