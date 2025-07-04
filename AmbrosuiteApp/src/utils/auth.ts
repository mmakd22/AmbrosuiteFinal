import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USER_ID_KEY = 'auth_user_id';

export var USER_ID = 0;

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('[AUTH] setToken error', error);
  }
}


export async function getToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('[AUTH] getToken:', token);
    return token;
  } catch (error) {
    console.error('[AUTH] getToken error', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('[AUTH] removeToken error', error);
  }
}

export async function setRole(role: number): Promise<void> {
  try {
    await AsyncStorage.setItem(ROLE_KEY, String(role));
  } catch (error) {
    console.error('[AUTH] setRole error', error);
  }
}

export async function getRole(): Promise<number | null> {
  try {
    const role = await AsyncStorage.getItem(ROLE_KEY);
    console.log('[AUTH] getRole:', role);
    return role ? Number(role) : null;
  } catch (error) {
    console.error('[AUTH] getRole error', error);
    return null;
  }
}

export async function removeRole(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ROLE_KEY);
  } catch (error) {
    console.error('[AUTH] removeRole error', error);
  }
}

export async function setUserId(id: number): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, String(id));
    USER_ID = id;
  } catch (error) {
    console.error('[AUTH] setUserId error', error);
  }
}

export async function getUserId(): Promise<number | null> {
  try {
    const id = await AsyncStorage.getItem(USER_ID_KEY);
    console.log('[AUTH] getUserId:', id);
    USER_ID = id ? parseInt(id, 10) : 2;
    return id ? Number(id) : null;
  } catch (error) {
    console.error('[AUTH] getUserId error', error);
    return null;
  }
}

export const removeUserId = async () => {
  await AsyncStorage.removeItem(USER_ID_KEY);
};