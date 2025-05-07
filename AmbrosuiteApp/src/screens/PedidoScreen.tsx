import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../utils/config';
import { RootStackParamList } from '../navigation/AppNavigator';

type PedidoScreenRouteProp = RouteProp<RootStackParamList, 'Pedido'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pedido'>;

type PedidoDetalle = {
  id: number;
  productoId: number;
  cantidad: number;
  producto: {
    nombre: string;
    precio: number;
  };
};

export default function PedidoScreen() {
  const route = useRoute<PedidoScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { pedidoId } = route.params;

  const [detalles, setDetalles] = useState<PedidoDetalle[]>([]);

  const fetchDetalles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoId}`);
      const data = await res.json();
      setDetalles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setDetalles([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetalles();
    }, [pedidoId])
  );

  const total = detalles.reduce(
    (sum, d) => sum + (d?.producto?.precio || 0) * d.cantidad,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido #{pedidoId}</Text>

      <FlatList
        data={detalles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.detalle}>
            <Text style={styles.nombre}>{item.producto?.nombre}</Text>
            <Text>Cantidad: {item.cantidad}</Text>
            <Text>Subtotal: ${(item.producto?.precio * item.cantidad).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos agregados.</Text>}
      />

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('AgregarProductos', { pedidoId })}
      >
        <Text style={styles.botonTexto}>Agregar productos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  detalle: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  nombre: { fontSize: 16, fontWeight: '600' },
  empty: { marginTop: 20, textAlign: 'center', color: '#999' },
  total: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  boton: {
    backgroundColor: '#800020',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
