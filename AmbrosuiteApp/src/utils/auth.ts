import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';

export const setToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const setRole = async (role: number) => {
  await AsyncStorage.setItem(ROLE_KEY, role.toString());
};

export const getRole = async () => {
  const stored = await AsyncStorage.getItem(ROLE_KEY);
  return stored ? parseInt(stored, 10) : null;
};

export const removeRole = async () => {
  await AsyncStorage.removeItem(ROLE_KEY);
};
