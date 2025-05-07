import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { removeToken } from '../utils/auth';

type Mesa = { id: number };
type Pedido = {
  id: number;
  estado: number;
  mesaId: number;
};

type Props = {
  setIsAuthenticated: (auth: boolean) => void;
};

const estadoColores: Record<number, { texto: string; color: string }> = {
  0: { texto: 'Disponible', color: '#28a745' },
  1: { texto: 'Pendiente', color: '#007bff' },
  2: { texto: 'En cocina', color: '#ffc107' },
  3: { texto: 'Entregado', color: '#dc3545' },
};

const HomeScreen = ({ setIsAuthenticated }: Props) => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMesas = await fetch(`${API_BASE_URL}/api/Mesas`);
        const dataMesas = await resMesas.json();
        setMesas(dataMesas);

        const resPedidos = await fetch(`${API_BASE_URL}/api/Pedidos`);
        const dataPedidos = await resPedidos.json();
        setPedidos(dataPedidos);
      } catch (error) {
        console.error('Error al cargar mesas o pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await removeToken();
    setIsAuthenticated(false);
  };

  const agregarPedido = async (mesaId: number) => {
    try {
      const body = {
        total: 0,
        estado: 1, // pendiente
        mesa_id: mesaId,
        usuario_id: 3, // ajustar según lógica real
      };

      const response = await fetch(`${API_BASE_URL}/api/Pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('No se pudo crear el pedido');

      const data = await response.json();
      console.log('Pedido creado:', data);
      navigation.navigate('MesaDetalle', { mesaId });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      Alert.alert('Error', 'No se pudo crear el pedido');
    }
  };

  const getEstadoMesa = (mesaId: number): number => {
    const pedidoActivo = pedidos.find(
      (p) => p.mesaId === mesaId && p.estado >= 1 && p.estado <= 3
    );
    return pedidoActivo ? pedidoActivo.estado : 0;
  };

  const renderMesa = ({ item }: { item: Mesa }) => {
    const estado = getEstadoMesa(item.id);
    const estadoInfo = estadoColores[estado];

    return (
      <View style={[styles.mesa, { backgroundColor: estadoInfo.color }]}>
        <Text style={styles.mesaTexto}>{estadoInfo.texto}</Text>
        <Text style={styles.mesaID}>#Mesa {item.id}</Text>

        {estado === 0 ? (
          <Button title="Agregar pedido" onPress={() => agregarPedido(item.id)} color="#ffffff" />
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('MesaDetalle', { mesaId: item.id })}
            style={styles.touchOverlay}
          />
        )}
      </View>
    );
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.grid}
        data={mesas}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={renderMesa}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { padding: 16, alignItems: 'center' },
  mesa: {
    width: 140,
    height: 140,
    borderRadius: 12,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    position: 'relative',
  },
  mesaTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  mesaID: {
    fontSize: 14,
    marginTop: 4,
    color: '#ffffffcc',
    fontFamily: 'Roboto',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 140,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginRight: 12,
    marginTop: 12,
    backgroundColor: '#800020',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default HomeScreen;
