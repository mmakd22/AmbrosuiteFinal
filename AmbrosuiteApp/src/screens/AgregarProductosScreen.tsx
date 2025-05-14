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

export default function AgregarProductosScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const rawParams = route.params as { pedidoId: number | string };
  const pedidoId = Number(rawParams.pedidoId);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [detallesExistentes, setDetallesExistentes] = useState<PedidoDetalle[]>([]);

  useEffect(() => {
    if (!pedidoId || isNaN(pedidoId)) {
      Alert.alert('Error', 'El ID del pedido no es válido.');
      return;
    }
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

      if (!Array.isArray(data)) {
        console.warn('Respuesta inesperada de PedidoDetalles:', data);
        setDetallesExistentes([]);
        setCantidades({});
        return;
      }

      setDetallesExistentes(data);
      const inicial: Record<number, number> = {};
      data.forEach((d: PedidoDetalle) => {
        inicial[d.producto_id] = d.cantidad;
      });
      setCantidades(inicial);
    } catch (error) {
      console.error('Error al obtener detalles existentes:', error);
    }
  };

  const handleConfirmar = async () => {
    Keyboard.dismiss();
    let errores = 0;

    for (const producto of productos) {
      const nuevaCantidad = cantidades[producto.id] || 0;
      const existente = detallesExistentes.find((d) => d.producto_id === producto.id);

      if (existente) {
        if (nuevaCantidad === 0) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${existente.id}`, {
              method: 'DELETE',
            });
            if (!res.ok) errores++;
          } catch (err) {
            errores++;
            console.error('Error en DELETE:', err);
          }
        } else {
          try {
            const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${existente.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: existente.id,
                pedido_id: pedidoId,
                producto_id: producto.id,
                cantidad: nuevaCantidad,
              }),
            });
            if (!res.ok) errores++;
          } catch (err) {
            errores++;
            console.error('Error en PUT:', err);
          }
        }
      } else if (nuevaCantidad > 0) {
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
          errores++;
          console.error('Error en POST:', err);
        }
      }
    }

    if (errores > 0) {
      Alert.alert('Atención', 'Algunos productos no se pudieron procesar.');
    } else {
      Alert.alert('Productos actualizados correctamente.', '', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Pedido', { pedidoId }),
        },
      ]);
    }
  };

  const total = Object.entries(cantidades).reduce((sum, [id, cantidad]) => {
    const producto = productos.find((p) => p.id === Number(id));
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
              onChangeText={(text) =>
                setCantidades((prev) => ({
                  ...prev,
                  [item.id]: parseInt(text) || 0,
                }))
              }
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
