import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_BASE_URL } from '../utils/config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Pedido = {
  id: number;
  estado: number;
};

const estados: { [key: number]: string } = {
  0: 'Activo',
  1: 'Entregado',
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pedidos`);
      const data = await response.json();
      const activos = data.filter((p: Pedido) => p.estado === 0 || p.estado === 1);
      setPedidos(activos);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  const renderItem = ({ item }: { item: Pedido }) => (
    <TouchableOpacity
      style={styles.pedidoCard}
      onPress={() => navigation.navigate('Pedido', { pedidoId: item.id })}
    >
      <Text style={styles.pedidoText}>Pedido #{item.id}</Text>
      <Text style={styles.estado}>{estados[item.estado] || 'Desconocido'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay pedidos activos.</Text>}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pedidoCard: {
    backgroundColor: '#eee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  pedidoText: { fontSize: 18, fontWeight: 'bold' },
  estado: { marginTop: 4, color: '#666' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});
