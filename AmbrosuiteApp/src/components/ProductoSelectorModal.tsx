import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
} from 'react-native';
import { API_BASE_URL } from '../utils/config';

type Producto = {
  id: number;
  nombre: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  pedidoId: number;
  onProductoAgregado: () => void;
};

const ProductoSelectorModal = ({ visible, onClose, pedidoId, onProductoAgregado }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState('1');

  useEffect(() => {
    if (visible) {
      fetch(`${API_BASE_URL}/api/ProductosFinales`)
        .then((res) => res.json())
        .then((data) => setProductos(data))
        .catch((e) => console.error('Error al cargar productos:', e));
    }
  }, [visible]);

  const handleAgregar = async () => {
    if (!selectedId || !cantidad) return;
  
    try {
      // Buscar si ya existe ese producto en el pedido
      const resDetalles = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoId}`);
      const detallesExistentes = await resDetalles.json();
  
      const existente = detallesExistentes.find(
        (d: any) => d.productoFinal?.id === selectedId
      );
  
      if (!existente) {
        console.warn('Este modal está preparado para modificar productos existentes, no para crear nuevos.');
        return;
      }
  
      const body = {
        producto_id: selectedId,
        pedido_id: pedidoId,
        cantidad: parseInt(cantidad),
        estado: existente.estado // se mantiene
      };
  
      const response = await fetch(`${API_BASE_URL}/api/PedidoDetalles/${existente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const result = await response.text();
      console.log('PUT respuesta:', response.status, result);
  
      if (!response.ok) {
        throw new Error(`Error al modificar producto: ${result}`);
      }
  
      onProductoAgregado(); // recarga
      onClose();
      setSelectedId(null);
      setCantidad('1');
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Agregar producto</Text>

        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.producto,
                selectedId === item.id && styles.productoSeleccionado,
              ]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="Cantidad"
        />

        <Button title="Agregar al pedido" onPress={handleAgregar} color="#007BFF" />
        <Button title="Cancelar" onPress={onClose} color="#999" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  producto: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productoSeleccionado: {
    backgroundColor: '#d3e5ff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    marginVertical: 12,
  },
});

export default ProductoSelectorModal;
