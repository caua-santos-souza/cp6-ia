import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { getCupons } from '../services/firestore';
import { CupomFiscal } from '../types/Cupom';
import { useTheme } from '../contexts/ThemeContext';

export default function CuponsScreen() {
  const { theme } = useTheme();
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
      <View style={[styles.cupomCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.estabelecimento, { color: theme.colors.text }]}>{item.estabelecimento}</Text>
        <Text style={[styles.valor, { color: theme.colors.primary }]}>R$ {item.valorTotal.toFixed(2)}</Text>
        <Text style={[styles.data, { color: theme.colors.textSecondary }]}>Data: {dataFormatada}</Text>
        <Text style={[styles.categoria, { color: theme.colors.textSecondary }]}>Categoria: {item.categoria}</Text>
        {item.data && <Text style={[styles.dataCupom, { color: theme.colors.textSecondary }]}>Data do cupom: {item.data}</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando cupons...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Meus Cupons</Text>
      {cupons.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Nenhum cupom cadastrado ainda.</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Capture cupons fiscais para começar!</Text>
        </View>
      ) : (
        <FlatList
          data={cupons}
          renderItem={renderCupom}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  cupomCard: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estabelecimento: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  valor: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  data: {
    fontSize: 14,
    marginBottom: 4,
  },
  dataCupom: {
    fontSize: 14,
    marginBottom: 4,
  },
  categoria: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

