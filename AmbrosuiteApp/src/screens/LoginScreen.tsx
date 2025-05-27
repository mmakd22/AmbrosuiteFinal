import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { API_BASE_URL } from '../utils/config';
import { setToken, setRole } from '../utils/auth';

type Props = {
  setIsAuthenticated: (auth: boolean) => void;
};

const LoginScreen = ({ setIsAuthenticated }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Credenciales inválidas');
        return;
      }

      const data = await res.json();
      await setToken(data.token);

      // ahora consultamos el rol con el email
      const rolRes = await fetch(`${API_BASE_URL}/api/Usuarios/rol/${email}`);
      const rolData = await rolRes.json();

      if (rolData.rol_id === 0 || rolData.rol_id === 1) {
        await setRole(rolData.rol_id);
        setIsAuthenticated(true);
      } else {
        setError('Este usuario no tiene permisos para ingresar.');
      }

    } catch (err) {
      console.error(err);
      setError('Error de red o del servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default LoginScreen;
