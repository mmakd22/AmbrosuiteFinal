import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { API_BASE_URL } from '../utils/config';
import { setToken, setRole, setUserId } from '../utils/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  setIsAuthenticated: (auth: boolean) => void;
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen = ({ setIsAuthenticated, navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('✅ LoginScreen montado correctamente');
  }, []);

  const handleLogin = async () => {
    setError('');
    console.log('🔐 Iniciando login con:', email);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        console.log('⚠️ Credenciales inválidas');
        setError('Credenciales inválidas');
        return;
      }

      const data = await res.json();
      console.log('✅ Datos recibidos:', data);

      if (data.rol_id === 1 || data.rol_id === 4) {
        await setToken(data.token);
        await setRole(data.rol_id);
        await setUserId(data.id);
        setIsAuthenticated(true);
        console.log('✅ Autenticación exitosa');
      } else {
        setError('Este usuario no tiene permisos para ingresar.');
        console.log('⛔ Rol no autorizado:', data.rol_id);
      }
    } catch (err) {
      console.error('❌ Error de red o servidor:', err);
      setError('Error de red o del servidor');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Iniciar sesión" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default LoginScreen;