import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MesaDetalleScreen from '../screens/MesaDetalleScreen';
import AgregarProductosScreen from '../screens/AgregarProductosScreen';

type AppNavigatorProps = {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  MesaDetalle: { mesaId: number };
  AgregarProductos: { pedidoId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = ({ isAuthenticated, setIsAuthenticated }: AppNavigatorProps) => {
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>

          <Stack.Screen name="MesaDetalle" component={MesaDetalleScreen} />
          <Stack.Screen name="AgregarProductos" component={AgregarProductosScreen} />
        </>
      ) : (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
)};

export default AppNavigator;
