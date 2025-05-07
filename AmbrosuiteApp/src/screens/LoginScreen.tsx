import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { setToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';

type Props = {
  navigation: any;
  setIsAuthenticated: (auth: boolean) => void;
};

const LoginScreen = ({ setIsAuthenticated }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage(''); // limpia errores anteriores
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || 'Credenciales inválidas');
        return;
      }

      await setToken(data.token);
      setIsAuthenticated(true);
    } catch (error: any) {
      setErrorMessage('Error de conexión o inesperado');
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.title}>Ambrosuite</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMessage('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#999"
        style={styles.input}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMessage('');
        }}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  button: {
    width: '100%',
    backgroundColor: '#800020',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  errorText: {
    color: '#800020',
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
});

export default LoginScreen;
