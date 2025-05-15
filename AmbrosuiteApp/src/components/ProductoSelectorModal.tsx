import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { API_BASE_URL } from '../utils/config';

type Categoria = {
  id: number;
  nombre: string;
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria: Categoria;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (productoId: number, cantidad: number) => void;
};

const ProductoSelectorModal = ({ visible, onClose, onAdd }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<string>('1');

  useEffect(() => {
    if (visible) {
      fetch(`${API_BASE_URL}/api/ProductosFinales`)
        .then((res) => res.json())
        .then((data: Producto[]) => {
          setProductos(data);

          // Extraer categorías únicas
          const categoriasUnicas = Array.from(
            new Set(data.map((p) => p.categoria.nombre))
          );

          const categoriasDTO: Categoria[] = categoriasUnicas.map((nombre, index) => ({
            id: index,
            nombre,
          }));

          setCategorias(categoriasDTO);
          setSelectedCategoria(categoriasDTO[0]?.nombre || null);
        })
        .catch((e) => console.error('Error al cargar productos:', e));
    }
  }, [visible]);

  const productosFiltrados = productos.filter(
    (p) => p.categoria?.nombre === selectedCategoria
  );

  const handleAgregar = () => {
    if (selectedId && parseInt(cantidad) > 0) {
      onAdd(selectedId, parseInt(cantidad));
      setSelectedId(null);
      setCantidad('1');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Seleccioná productos</Text>

          {/* Chips de categorías */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  selectedCategoria === cat.nombre && styles.chipSelected,
                ]}
                onPress={() => setSelectedCategoria(cat.nombre)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategoria === cat.nombre && styles.chipTextSelected,
                  ]}
                >
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Listado de productos filtrado */}
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.productoItem,
                  selectedId === item.id && styles.productoItemSelected,
                ]}
                onPress={() => {
                  setSelectedId(item.id);
                  setCantidad('1');
                }}
              >
                <Text style={styles.nombreProducto}>{item.nombre}</Text>
                <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
              </TouchableOpacity>
            )}
            style={styles.productList}
          />

          {/* Cantidad */}
          <TextInput
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
            placeholder="Cantidad"
            style={styles.cantidadInput}
          />

          {/* Botones */}
          <TouchableOpacity onPress={handleAgregar} style={styles.agregarBtn}>
            <Text style={styles.agregarTexto}>Confirmar selección</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelarBtn}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProductoSelectorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
  },
  container: {
    margin: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#800020',
  },
  chipText: {
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productList: {
    maxHeight: 250,
    marginBottom: 10,
  },
  productoItem: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  productoItemSelected: {
    backgroundColor: '#ffdede',
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: '500',
  },
  precio: {
    color: '#555',
  },
  cantidadInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  agregarBtn: {
    backgroundColor: '#800020',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  agregarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelarBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelarTexto: {
    color: 'red',
  },
});
