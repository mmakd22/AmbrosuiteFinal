import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
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
  id?: number;
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
  const [seleccionados, setSeleccionados] = useState<Record<number, number>>({});
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
    } catch (error) {
      console.error('Error al obtener detalles existentes:', error);
    }
  };

  const handleAgregarProductos = async () => {
    const detallesAEnviar = Object.entries(seleccionados)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([producto_id, cantidad]) => ({
        pedido_id: pedidoId,
        producto_id: parseInt(producto_id),
        cantidad,
      }));
  
    if (detallesAEnviar.length === 0) {
      Alert.alert('No seleccionaste productos');
      return;
    }
  
    let errores = 0;
  
    for (const detalle of detallesAEnviar) {
      const existente = detallesExistentes.find(
        (d) => d.producto_id === detalle.producto_id
      );
  
      if (existente) {
        // Hacer PUT sumando cantidad
        const nuevaCantidad = existente.cantidad + detalle.cantidad;
        try {
          const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${existente.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...detalle,
              cantidad: nuevaCantidad,
              id: existente.id,
            }),
          });
  
          if (!res.ok) {
            errores++;
            console.error('Error al actualizar producto:', await res.json());
          }
        } catch (error) {
          errores++;
          console.error('Error en PUT:', error);
        }
      } else {
        // Hacer POST si no existe
        try {
          const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detalle),
          });
  
          if (!res.ok) {
            errores++;
            console.error('Error al agregar producto:', await res.json());
          }
        } catch (error) {
          errores++;
          console.error('Error en POST:', error);
        }
      }
    }
    if (errores > 0) {
      Alert.alert('Algunos productos no se pudieron agregar o actualizar.');
    } else {
      Alert.alert('Productos actualizados correctamente.', '', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Pedido', { pedidoId });
          },
        },
      ]);
    }
  };
  

  const total = Object.entries(seleccionados).reduce((sum, [id, cantidad]) => {
    const producto = productos.find((p) => p.id === parseInt(id));
    return sum + (producto ? producto.precio * cantidad : 0);
  }, 0);

  const renderItem = ({ item }: { item: Producto }) => {
    const cantidadExistente =
      detallesExistentes.find((d) => d.producto_id === item.id)?.cantidad || 0;

    return (
      <View style={styles.producto}>
        <View>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text>${item.precio.toFixed(2)}</Text>
        </View>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={cantidadExistente > 0 ? `${cantidadExistente}` : 'Cantidad'}
          value={seleccionados[item.id]?.toString() || ''}
          onChangeText={(text) => {
            const cantidad = parseInt(text) || 0;
            setSeleccionados((prev) => ({ ...prev, [item.id]: cantidad }));
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Seleccioná productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <TouchableOpacity style={styles.boton} onPress={handleAgregarProductos}>
        <Text style={styles.botonTexto}>Confirmar selección</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  producto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nombre: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 80,
    textAlign: 'center',
    padding: 6,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
  },
  boton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#800020',
    borderRadius: 6,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
