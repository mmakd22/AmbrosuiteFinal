import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../utils/config';
import type { RootStackParamList } from '../navigation/AppNavigator';

type MesaDetalleRouteProp = RouteProp<RootStackParamList, 'MesaDetalle'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MesaDetalle'>;

type Pedido = {
  id: number;
  estado: number;
};

type PedidoDetalle = {
  id: number;
  cantidad: number;
  productoFinal?: {
    nombre: string;
    precio: number;
  };
};

const estados: Record<number, string> = {
  0: 'Pendiente',
  1: 'En cocina',
  2: 'Entregado',
  3: 'Pago',
};

const MesaDetalleScreen = () => {
  const route = useRoute<MesaDetalleRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { mesaId } = route.params;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [detalles, setDetalles] = useState<PedidoDetalle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidoActivo = async () => {
      try {
        const resPedidos = await fetch(`${API_BASE_URL}/api/Pedidos/mesa/${mesaId}`);
        const pedidos = await resPedidos.json();
        const pedidoActivo = pedidos.find((p: any) => p.estado !== 3);
        if (pedidoActivo) {
          setPedido(pedidoActivo);

          const resDetalles = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoActivo.id}`);
          const detalles = await resDetalles.json();
          setDetalles(detalles);
        }
      } catch (error) {
        console.error('Error al cargar pedido:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidoActivo();
  }, [mesaId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#800020" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesa #{mesaId}</Text>

      {pedido ? (
        <>
          <Text style={styles.estado}>Estado: {estados[pedido.estado]}</Text>

          <FlatList
            data={detalles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const nombre = item.productoFinal?.nombre ?? 'Producto desconocido';
              return (
                <Text style={styles.item}>
                  {item.cantidad}x {nombre}
                </Text>
              );
            }}
          />

          {pedido.estado === 1 && (
            <TouchableOpacity
              style={styles.botonAgregarGrande}
              onPress={() => navigation.navigate('AgregarProductos', { pedidoId: pedido.id })}
            >
              <Text style={styles.botonAgregarTexto}>Agregar productos</Text>
            </TouchableOpacity>
          )}

          {(pedido.estado === 1 || pedido.estado === 2) && (
            <View style={styles.buttonContainer}>
              <Button title="Cambiar estado del pedido" onPress={() => {}} />
            </View>
          )}
        </>
      ) : (
        <Text>No hay pedido activo para esta mesa.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#800020' },
  estado: { fontSize: 16, marginBottom: 8 },
  item: { fontSize: 16, paddingVertical: 4 },
  buttonContainer: { marginTop: 12 },
  botonAgregarGrande: {
    backgroundColor: '#800020',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 30,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default MesaDetalleScreen;
