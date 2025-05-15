import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '../utils/config';

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: {
    nombre: string;
  };
};

type PedidoDetalle = {
  pedido_id: number;
  producto_id: number;
  cantidad: number;
};

const AgregarProductosScreen = () => {
  const router = useRouter();
  const { pedidoId } = useLocalSearchParams<{ pedidoId: string }>();
  const pedidoIdNumber = parseInt(pedidoId);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/CategoriaProductos`);
      const data = await res.json();

      const productosUnificados: Producto[] = data.map((cp: any) => ({
        id: cp.producto.id,
        nombre: cp.producto.nombre,
        precio: cp.producto.precio,
        categoria: {
          nombre: cp.categoria?.nombre || 'Sin categoría'
        }
      }));

      const productosUnicos = productosUnificados.filter(
        (p, index, self) => index === self.findIndex((q) => q.id === p.id)
      );

      setProductos(productosUnicos);

      const categoriasUnicas = [...new Set(productosUnicos.map(p => p.categoria.nombre))];
      setCategorias(categoriasUnicas);
      setCategoriaSeleccionada(categoriasUnicas[0]);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleCantidadChange = (productoId: number, value: string) => {
    const cantidad = parseInt(value) || 0;
    setCantidades((prev) => ({ ...prev, [productoId]: cantidad }));
  };

  const calcularTotal = () => {
    return productos.reduce((acc, prod) => {
      const cantidad = cantidades[prod.id] || 0;
      return acc + cantidad * prod.precio;
    }, 0);
  };

  const handleConfirmar = async () => {
    const detalles: PedidoDetalle[] = Object.entries(cantidades)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({
        pedido_id: pedidoIdNumber,
        producto_id: parseInt(id),
        cantidad
      }));

    if (detalles.length === 0) {
      Alert.alert('Error', 'Debés seleccionar al menos un producto.');
      return;
    }

    try {
      for (const detalle of detalles) {
        const response = await fetch(`${API_BASE_URL}/api/PedidoDetalles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        });

        if (!response.ok) throw new Error('Error al agregar producto');
      }

      Alert.alert('Éxito', 'Productos agregados correctamente', [
        { text: 'OK', onPress: () => router.replace(`/Pedido/${pedidoId}`) }
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo agregar el producto.');
    }
  };

  const productosFiltrados = productos.filter(p => p.categoria.nombre === categoriaSeleccionada);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
      <Text style={styles.titulo}>Agregar productos al pedido</Text>

      <View style={styles.categorias}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoriaBtn,
              cat === categoriaSeleccionada && styles.categoriaBtnActiva
            ]}
            onPress={() => setCategoriaSeleccionada(cat)}
          >
            <Text
              style={[
                styles.categoriaTexto,
                cat === categoriaSeleccionada && styles.categoriaTextoActiva
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Cantidad"
              value={(cantidades[item.id]?.toString()) || ''}
              onChangeText={(value) => handleCantidadChange(item.id, value)}
            />
          </View>
        )}
      />

      <Text style={styles.total}>Total: ${calcularTotal().toFixed(2)}</Text>

      <TouchableOpacity style={styles.confirmarBtn} onPress={handleConfirmar}>
        <Text style={styles.confirmarTexto}>Confirmar selección</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AgregarProductosScreen;

const styles = StyleSheet.create({
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  categorias: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  categoriaBtn: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  categoriaBtnActiva: {
    backgroundColor: '#800020',
  },
  categoriaTexto: {
    color: '#800020',
    fontWeight: '600',
  },
  categoriaTextoActiva: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    elevation: 3,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  precio: {
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 20,
    color: '#111',
  },
  confirmarBtn: {
    backgroundColor: '#800020',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  confirmarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
