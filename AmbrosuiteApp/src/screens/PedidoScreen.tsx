import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';

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

type RouteParams = {
    pedidoId: number;
};

const estadosTexto: Record<number, string> = {
    0: 'Activo',
    1: 'Entregado',
    2: 'En facturación',
    3: 'Facturado',
};

const PedidoScreen = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { pedidoId } = route.params as RouteParams;

    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [detalles, setDetalles] = useState<PedidoDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState<number>(0);

    useEffect(() => {
        const fetchPedido = async () => {
            try {
                const resPedido = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`);
                const dataPedido = await resPedido.json();
                setPedido(dataPedido);

                const resDetalles = await fetch(`${API_BASE_URL}/api/PedidoDetalles/pedido/${pedidoId}`);
                const dataDetalles = await resDetalles.json();
                setDetalles(dataDetalles);
            } catch (error) {
                console.error('Error al cargar el pedido:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedido();
    }, [pedidoId]);

    const calcularTotal = () => {
        return detalles.reduce((acc, item) => {
            const precio = item.productoFinal?.precio ?? 0;
            return acc + precio * item.cantidad;
        }, 0);
    };

    const cambiarEstado = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            setPedido((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
            setModalVisible(false);
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#800020" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titulo}>Pedido #{pedido?.id}</Text>
            <Text style={styles.estado}>Estado: {pedido ? estadosTexto[pedido.estado] : 'Cargando...'}</Text>

            <FlatList
                data={detalles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.producto}>
                        {item.cantidad}x {item.productoFinal?.nombre ?? 'Producto'}
                    </Text>
                )}
                ListEmptyComponent={<Text style={styles.vacio}>Sin productos agregados.</Text>}
            />

            <TouchableOpacity
                style={styles.boton}
                onPress={() => navigation.navigate('AgregarProductos', { pedidoId })}
            >
                <Text style={styles.botonTexto}>Agregar productos</Text>
            </TouchableOpacity>

            {pedido?.estado === 0 || pedido?.estado === 1 ? (
  <TouchableOpacity
    style={[styles.boton, { backgroundColor: '#004080' }]}
    onPress={() => {
      const nuevo = pedido.estado === 0 ? 1 : 2;
      setNuevoEstado(nuevo);
      setModalVisible(true);
    }}
  >
    <Text style={styles.botonTexto}>Cambiar estado</Text>
  </TouchableOpacity>
) : null}

            <Text style={styles.total}>Total: ${calcularTotal().toFixed(2)}</Text>

            {/* Modal para cambio de estado */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cambiar estado del pedido</Text>

                        <TouchableOpacity
                            style={styles.opcion}
                            onPress={() => setNuevoEstado(0)}
                        >
                            <Text style={styles.opcionTexto}>Activo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.opcion}
                            onPress={() => setNuevoEstado(1)}
                        >
                            <Text style={styles.opcionTexto}>Entregado</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.boton, { marginTop: 16 }]}
                            onPress={cambiarEstado}
                        >
                            <Text style={styles.botonTexto}>Guardar</Text>
                        </TouchableOpacity>

                        <Pressable
                            style={[styles.boton, { backgroundColor: '#6c757d', marginTop: 8 }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.botonTexto}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    estado: { fontSize: 16, marginBottom: 16 },
    producto: { fontSize: 16, paddingVertical: 4 },
    vacio: { textAlign: 'center', color: '#6c757d' },
    total: { fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'right' },
    boton: {
        backgroundColor: '#800020',
        padding: 14,
        marginTop: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    opcion: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f1f1f1',
        borderRadius: 6,
        marginBottom: 10,
    },
    opcionTexto: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default PedidoScreen;
