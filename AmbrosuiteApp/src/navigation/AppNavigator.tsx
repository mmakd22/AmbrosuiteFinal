import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PedidoScreen from '../screens/PedidoScreen';
import AgregarProductosScreen from '../screens/AgregarProductosScreen';
import { removeToken } from '../utils/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
};

export type RootStackParamList = {
  Home: undefined;
  Pedido: { pedidoId: number };
  AgregarProductos: { pedidoId: number };
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = ({ isAuthenticated, setIsAuthenticated }: Props) => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#800020' },
        headerTintColor: '#fff',
        headerTitle: () => {
          const params = route.params as any;
          if (route.name === 'Pedido' && params?.pedidoId) {
            return (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                Pedido #{params.pedidoId}
              </Text>
            );
          }
          const titles: Record<string, string> = {
            Home: 'Pedidos Activos',
            AgregarProductos: 'Agregar productos',
            Login: 'Iniciar sesión',
          };
          return (
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              {titles[route.name] || route.name}
            </Text>
          );
        },
        headerRight: () =>
            route.name !== 'Login' && (
              <TouchableOpacity
                onPress={async () => {
                  await removeToken();
                  setIsAuthenticated(false);
                }}
                style={{ marginRight: 12 }}
              >
                <Icon name="logout" size={24} color="#fff" />
              </TouchableOpacity>
          ),
      })}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Pedido" component={PedidoScreen} />
          <Stack.Screen name="AgregarProductos" component={AgregarProductosScreen} />
        </>
      ) : (
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
