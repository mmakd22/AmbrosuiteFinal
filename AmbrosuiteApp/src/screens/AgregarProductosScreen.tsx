import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { RootStackParamList } from '../navigation/AppNavigator';

type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

type AgregarProductosRouteProp = RouteProp<RootStackParamList, 'AgregarProductos'>;

const AgregarProductosScreen = () => {
  const route = useRoute<AgregarProductosRouteProp>();
  const { pedidoId } = route.params;
  const navigation = useNavigation();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ProductosFinales`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    fetchProductos();
  }, []);

  const handleCantidadChange = (id: number, cantidad: string) => {
    const numero = parseInt(cantidad, 10);
    setCantidades((prev) => ({
      ...prev,
      [id]: isNaN(numero) ? 0 : numero,
    }));
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => {
      const cantidad = cantidades[producto.id] || 0;
      return total + cantidad * producto.precio;
    }, 0);
  };

  const handleConfirmar = async () => {
    const detalles = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoFinalId, cantidad]) => ({
        pedidoId,
        productoFinalId: Number(productoFinalId),
        cantidad,
      }));
  
    console.log('🟡 Detalles a enviar:', detalles);
  
    try {
      for (const detalle of detalles) {
        console.log('📤 Enviando detalle:', detalle);
  
        const res = await fetch(`${API_BASE_URL}/api/PedidoDetalles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle),
        });
  
        const data = await res.json();
        console.log('✅ Respuesta del servidor:', res.status, data);
      }
  
      console.log('⚙️ Actualizando estado del pedido a 1...');
      const resEstado = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 1 }),
      });
  
      const dataEstado = await resEstado.json();
      console.log('📘 Respuesta de PUT estado:', resEstado.status, dataEstado);
  
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error al confirmar productos:', error);
    }
  };
  

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Seleccioná productos</Text>

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
              placeholder="0"
              onChangeText={(text) => handleCantidadChange(item.id, text)}
            />
          </View>
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total: </Text>
        <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
      </View>

      <Button title="Confirmar selección" onPress={handleConfirmar} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  producto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  nombre: { fontSize: 16, fontWeight: '600' },
  precio: { fontSize: 14, color: '#666' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 60,
    padding: 6,
    textAlign: 'center',
    fontSize: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#800020' },
});

export default AgregarProductosScreen;
