import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USER_ID_KEY = 'auth_user_id';

export var USER_ID = 0;

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

export const setUserId = async (id: number) => {
  await AsyncStorage.setItem(USER_ID_KEY, id.toString());
  USER_ID = id;
  console.log(id);
};

export const getUserId = async () => {
  const id = await AsyncStorage.getItem(USER_ID_KEY);

  console.log(id);
  USER_ID = id ? parseInt(id, 10) : 2;
};

export const removeUserId = async () => {
  await AsyncStorage.removeItem(USER_ID_KEY);
};