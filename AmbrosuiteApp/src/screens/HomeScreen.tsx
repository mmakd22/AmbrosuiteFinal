import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    StyleSheet,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getUserId, USER_ID } from '../utils/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type Pedido = { id: number; estado: number };
type Mesa = { id: number; estado: number };

export default function HomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [mesasDisponibles, setMesasDisponibles] = useState<Mesa[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const usuarioId = USER_ID; 


    const fetchPedidos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Pedidos`);
            const data = await response.json();
            const activos = data.filter((p: Pedido) => p.estado === 0 || p.estado === 1);
            setPedidos(activos);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    };

    useFocusEffect(useCallback(() => { fetchPedidos(); }, []));
    useEffect(() => {
        const interval = setInterval(fetchPedidos, 60000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPedidos();
        setRefreshing(false);
    }, []);

    const abrirModalSeleccionMesa = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/Mesas`);
            const data = await res.json();
            const disponibles = data.filter((m: Mesa) => m.estado === 0);
            setMesasDisponibles(disponibles);
            setModalVisible(true);
        } catch (err) {
            console.error('Error al cargar mesas:', err);
        }
    };

    const crearPedido = async (mesaId: number) => {
        if (isLoading || usuarioId === null) return;
      
        setIsLoading(true);
      
        try {
          const response = await fetch(`${API_BASE_URL}/api/Pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              total: 0,
              estado: 0,
              mesa_id: mesaId,
              usuario_id: usuarioId,
            }),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al crear el pedido:', errorText);
            Alert.alert('Error', 'No se pudo crear el pedido.');
            return;
          }
      
          const nuevoPedido = await response.json(); // 👈 obtiene el pedido creado
          const pedidoId = nuevoPedido.id;
      
          await fetchPedidos();
          setModalVisible(false);
          Alert.alert('Éxito', 'Pedido creado correctamente.');
      
          // Navegar a la pantalla del pedido
          navigation.navigate('Pedido', { pedidoId });
        } catch (error) {
          console.error('Error general al crear pedido:', error);
          Alert.alert('Error inesperado al crear el pedido.');
        } finally {
          setIsLoading(false);
        }
      };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pedidos Activos</Text>

            <TouchableOpacity
                style={styles.boton}
                onPress={abrirModalSeleccionMesa}
                disabled={usuarioId === null}
            >
                <Text style={styles.botonTexto}>Agregar Pedido</Text>
            </TouchableOpacity>

            <FlatList
                data={pedidos}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.pedidoCard}
                        onPress={() => navigation.navigate('Pedido', { pedidoId: item.id })}
                    >
                        <Text style={styles.pedidoText}>Pedido #{item.id}</Text>
                        <Text style={styles.estado}>
                            Estado: {item.estado === 0 ? 'Activo' : 'Entregado'}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No hay pedidos activos.</Text>}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Seleccioná una mesa</Text>
                        <FlatList
                            data={mesasDisponibles}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.mesaCard}
                                    onPress={() => crearPedido(item.id)}
                                >
                                    <Text>Mesa #{item.id}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ marginTop: 10, color: 'red', textAlign: 'center' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    pedidoCard: {
        backgroundColor: '#eee',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    pedidoText: { fontSize: 18, fontWeight: 'bold' },
    estado: { marginTop: 4, color: '#666' },
    boton: {
        backgroundColor: '#800020',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    botonTexto: { color: '#fff', textAlign: 'center', fontSize: 16 },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    mesaCard: {
        padding: 12,
        backgroundColor: '#f4f4f4',
        borderRadius: 6,
        marginBottom: 10,
        alignItems: 'center',
    },
});
