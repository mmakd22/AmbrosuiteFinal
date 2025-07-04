
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PedidoScreen from '../screens/PedidoScreen';
import AgregarProductosScreen from '../screens/AgregarProductosScreen';
import { removeToken, removeRole } from '../utils/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
};

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Pedido: { pedidoId: number };
  AgregarProductos: { pedidoId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = ({ isAuthenticated, setIsAuthenticated }: Props) => {
  console.log("AppNavigator render - isAuthenticated:", isAuthenticated);

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'auth' : 'unauth'}
      screenOptions={{
        headerStyle: { backgroundColor: '#800020' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
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
