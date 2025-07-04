import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { getToken, getRole } from './src/utils/auth';
import { LogBox } from 'react-native';
import { View, Text } from 'react-native';


LogBox.ignoreLogs(["Tried to enqueue runnable"]); // evitar spam innecesario

// Captura errores JS no atrapados
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
        const rol = await getRole();
        if (token && (rol === 0 || rol === 1)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);
  
  // Evita renderizar antes de saber el auth
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
