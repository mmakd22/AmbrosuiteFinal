import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_BASE_URL } from '../utils/config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AgregarProductos'>;

type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

type PedidoDetalle = {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
};

type RouteParams = {
  pedidoId: number;
};

export default function AgregarProductosScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { pedidoId } = route.params as RouteParams;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [detallesExistentes, setDetallesExistentes] = useState<PedidoDetalle[]>([]);

  useEffect(() => {
    fetchProductos();
    fetchDetalles();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ProductosFinales`);
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const fetchDetalles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoId}`);
      const data = await res.json();
      setDetallesExistentes(data);

      // Seteamos las cantidades existentes
      const initial: Record<number, number> = {};
      data.forEach((d: PedidoDetalle) => {
        initial[d.producto_id] = d.cantidad;
      });
      setCantidades(initial);
    } catch (error) {
      console.error('Error al obtener detalles existentes:', error);
    }
  };

  const handleConfirmar = async () => {
    Keyboard.dismiss();
    let errores = 0;

    for (const producto of productos) {
      const nuevaCantidad = cantidades[producto.id] || 0;
      const detalleExistente = detallesExistentes.find(d => d.producto_id === producto.id);

      if (detalleExistente) {
        if (nuevaCantidad === 0) {
          // DELETE
          try {
            const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${detalleExistente.id}`, {
              method: 'DELETE',
            });
            if (!res.ok) errores++;
          } catch (err) {
            console.error('Error en DELETE:', err);
            errores++;
          }
        } else {
          // PUT
          try {
            const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${detalleExistente.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: detalleExistente.id,
                pedido_id: pedidoId,
                producto_id: producto.id,
                cantidad: nuevaCantidad,
              }),
            });
            if (!res.ok) errores++;
          } catch (err) {
            console.error('Error en PUT:', err);
            errores++;
          }
        }
      } else {
        if (nuevaCantidad > 0) {
          // POST
          try {
            const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pedido_id: pedidoId,
                producto_id: producto.id,
                cantidad: nuevaCantidad,
              }),
            });
            if (!res.ok) errores++;
          } catch (err) {
            console.error('Error en POST:', err);
            errores++;
          }
        }
      }
    }

    if (errores > 0) {
      Alert.alert('Atención', 'Hubo errores al actualizar los productos.');
    } else {
      Alert.alert('Listo', 'Los productos se actualizaron correctamente.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Pedido', { pedidoId }),
        },
      ]);
    }
  };

  const total = Object.entries(cantidades).reduce((sum, [id, cantidad]) => {
    const producto = productos.find(p => p.id === parseInt(id));
    return sum + (producto ? producto.precio * cantidad : 0);
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar productos del pedido</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.producto}>
            <View>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cantidades[item.id]?.toString() || ''}
              onChangeText={(text) => {
                const cantidad = parseInt(text) || 0;
                setCantidades(prev => ({ ...prev, [item.id]: cantidad }));
              }}
            />
          </View>
        )}
      />
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <TouchableOpacity style={styles.boton} onPress={handleConfirmar}>
        <Text style={styles.botonTexto}>Confirmar selección</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  producto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nombre: { fontSize: 16 },
  precio: { fontSize: 14, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 70,
    textAlign: 'center',
    padding: 6,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 12,
  },
  boton: {
    backgroundColor: '#800020',
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
  },
  botonTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
