import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { generateFinancialInsights } from '../services/aiInsights';
import { getCupons } from '../services/firestore';
import { CupomFiscal } from '../types/Cupom';
import { useTheme } from '../contexts/ThemeContext';

export default function InsightsScreen() {
  const { theme } = useTheme();
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Insights Financeiros</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Análises geradas por IA</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Gerando insights...</Text>
          </View>
        ) : (
          <View style={[styles.insightsContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.insightsText, { color: theme.colors.text }]}>{insights}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.updateButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadInsights}
            disabled={loading}
          >
            <Text style={styles.updateButtonText}>🔄 Atualizar Insights</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  insightsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 200,
    borderWidth: 1,
  },
  insightsText: {
    fontSize: 16,
    lineHeight: 26,
  },
  buttonContainer: {
    marginTop: 20,
  },
  updateButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

