import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pedido'>;

type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

type Detalle = {
  id: number;
  producto_id: number;
  cantidad: number;
  producto: Producto;
};

export default function PedidoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { pedidoId } = route.params as { pedidoId: number };

  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [estado, setEstado] = useState<number>(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<number | null>(null);

  useEffect(() => {
    fetchPedido();
  }, []);

  const fetchPedido = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoId}`);
      const data = await res.json();
      setDetalles(data);
      if (data.length > 0 && data[0].pedido?.estado !== null) {
        setEstado(data[0].pedido.estado);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    }
  };

  const total = detalles.reduce(
    (sum, d) => sum + d.producto.precio * d.cantidad,
    0
  );

  const handleCambioEstado = async () => {
    if (nuevoEstado === null) return;
  
    try {
      // Paso 1: Obtener datos completos del pedido
      const resGet = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`);
      const pedidoActual = await resGet.json();
  
      // Paso 2: Modificar estado
      const pedidoActualizado = { ...pedidoActual, estado: nuevoEstado };
  
      // Paso 3: Enviar PUT con el objeto completo
      const resPut = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoActualizado),
      });
  
      if (resPut.ok) {
        Alert.alert('Estado actualizado correctamente');
        if (nuevoEstado === 2) {
          navigation.navigate('Home');
        } else {
          setEstado(nuevoEstado);
          fetchPedido();
        }
        setMostrarModal(false);
      } else {
        throw new Error('Error en respuesta PUT');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      Alert.alert('No se pudo cambiar el estado');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pedido #{pedidoId}</Text>

      <FlatList
        data={detalles}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No hay productos en este pedido.</Text>}
        renderItem={({ item }) => (
          <View style={styles.producto}>
            <Text style={styles.nombre}>{item.producto.nombre}</Text>
            <Text style={styles.detalle}>
              Cantidad: {item.cantidad} - Precio: ${item.producto.precio}
            </Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('AgregarProductos', { pedidoId })}
      >
        <Text style={styles.botonTexto}>Agregar productos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.boton, { backgroundColor: '#444' }]}
        onPress={() => setMostrarModal(true)}
      >
        <Text style={styles.botonTexto}>Cambiar estado</Text>
      </TouchableOpacity>

      <Modal visible={mostrarModal} transparent animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Seleccionar nuevo estado</Text>

            {[0, 1, 2].map((e) => (
              <TouchableOpacity
                key={e}
                style={styles.opcion}
                onPress={() => setNuevoEstado(e)}
              >
                <Text style={{ fontWeight: nuevoEstado === e ? 'bold' : 'normal' }}>
                  {e === 0 ? 'Activo' : e === 1 ? 'Entregado' : 'En facturación'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.botonGuardar} onPress={handleCambioEstado}>
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  producto: { marginBottom: 10 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  detalle: { color: '#555' },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
  },
  boton: {
    backgroundColor: '#800020',
    padding: 14,
    borderRadius: 6,
    marginTop: 16,
  },
  botonTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContenido: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  opcion: {
    paddingVertical: 10,
  },
  botonGuardar: {
    marginTop: 20,
    backgroundColor: '#800020',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});
