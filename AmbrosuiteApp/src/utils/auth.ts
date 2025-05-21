import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

const ROLE_KEY = 'auth_role';

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};


export const setRole = async (rol_id: number): Promise<void> => {
  await AsyncStorage.setItem(ROLE_KEY, rol_id.toString());
};

export const getRole = async (): Promise<number | null> => {
  const value = await AsyncStorage.getItem(ROLE_KEY);
  return value ? parseInt(value, 10) : null;
};

export const removeRole = async (): Promise<void> => {
  await AsyncStorage.removeItem(ROLE_KEY);
};