import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { getCupons } from '../services/firestore';
import { CupomFiscal } from '../types/Cupom';

export default function CuponsScreen() {
  const [cupons, setCupons] = useState<CupomFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCupons = async () => {
    try {
      const data = await getCupons();
      setCupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCupons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCupons();
  };

  const renderCupom = ({ item }: { item: CupomFiscal }) => {
    const dataFormatada = new Date(item.createdAt).toLocaleDateString('pt-BR');
    
    return (
      <View style={styles.cupomCard}>
        <Text style={styles.estabelecimento}>{item.estabelecimento}</Text>
        <Text style={styles.valor}>R$ {item.valorTotal.toFixed(2)}</Text>
        <Text style={styles.data}>Data: {dataFormatada}</Text>
        <Text style={styles.categoria}>Categoria: {item.categoria}</Text>
        {item.data && <Text style={styles.dataCupom}>Data do cupom: {item.data}</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando cupons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Cupons</Text>
      {cupons.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhum cupom cadastrado ainda.</Text>
          <Text style={styles.emptySubtext}>Capture cupons fiscais para começar!</Text>
        </View>
      ) : (
        <FlatList
          data={cupons}
          renderItem={renderCupom}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  cupomCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  estabelecimento: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  valor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dataCupom: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoria: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

