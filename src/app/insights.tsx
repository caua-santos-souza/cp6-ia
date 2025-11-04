import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Button, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { generateFinancialInsights } from '../services/aiInsights';
import { getCupons } from '../services/firestore';
import { CupomFiscal } from '../types/Cupom';

export default function InsightsScreen() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const cupons = await getCupons();
      const generatedInsights = await generateFinancialInsights(cupons);
      setInsights(generatedInsights);
    } catch (error: any) {
      console.error('Erro ao gerar insights:', error);
      setInsights(`Erro ao gerar insights: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Insights Financeiros</Text>
        <Text style={styles.subtitle}>Análises geradas por IA</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Gerando insights...</Text>
          </View>
        ) : (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsText}>{insights}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Atualizar Insights" onPress={loadInsights} disabled={loading} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 200,
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

