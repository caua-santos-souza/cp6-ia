import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { getCupons } from '../services/firestore';
import { CupomFiscal, CategoriaDespesa } from '../types/Cupom';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function ChartsScreen() {
  const { theme } = useTheme();
  const [cupons, setCupons] = useState<CupomFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCupons();
  }, []);

  const loadCupons = async () => {
    try {
      const data = await getCupons();
      setCupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter cor da categoria (definida antes de ser usada)
  const getColorForCategory = (categoria: string): string => {
    const colors: Record<string, string> = {
      alimentação: '#FF6B6B',
      transporte: '#4ECDC4',
      lazer: '#FFE66D',
      saúde: '#95E1D3',
      educação: '#F38181',
      moradia: '#AA96DA',
      outros: '#C7CEEA',
    };
    return colors[categoria.toLowerCase()] || '#C7CEEA';
  };

  // Agrupar por categoria
  const gastosPorCategoria = cupons.reduce((acc, cupom) => {
    const cat = cupom.categoria;
    acc[cat] = (acc[cat] || 0) + cupom.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar por mês
  const gastosPorMes = cupons.reduce((acc, cupom) => {
    const date = new Date(cupom.createdAt);
    const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[mesAno] = (acc[mesAno] || 0) + cupom.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  // Preparar dados para o gráfico de pizza
  const pieData = Object.entries(gastosPorCategoria).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    population: value,
    color: getColorForCategory(name),
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Preparar dados para o gráfico de barras mensal
  const barData = {
    labels: Object.keys(gastosPorMes).sort(),
    datasets: [
      {
        data: Object.keys(gastosPorMes)
          .sort()
          .map(mes => gastosPorMes[mes]),
      },
    ],
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando gráficos...</Text>
      </View>
    );
  }

  if (cupons.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Nenhum dado disponível para gráficos.</Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Capture cupons fiscais para ver os gráficos!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Gráficos de Gastos</Text>

        {/* Gráfico de Pizza - Por Categoria */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Gastos por Categoria</Text>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                color: (opacity = 1) => {
                  const r = parseInt(theme.colors.text.slice(1, 3), 16);
                  const g = parseInt(theme.colors.text.slice(3, 5), 16);
                  const b = parseInt(theme.colors.text.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={[styles.emptyChartText, { color: theme.colors.textSecondary }]}>Sem dados por categoria</Text>
          )}
        </View>

        {/* Gráfico de Barras - Por Mês */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Gastos Mensais</Text>
          {barData.labels.length > 0 ? (
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 2,
                color: (opacity = 1) => {
                  const r = parseInt(theme.colors.primary.slice(1, 3), 16);
                  const g = parseInt(theme.colors.primary.slice(3, 5), 16);
                  const b = parseInt(theme.colors.primary.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                },
                labelColor: (opacity = 1) => {
                  const r = parseInt(theme.colors.text.slice(1, 3), 16);
                  const g = parseInt(theme.colors.text.slice(3, 5), 16);
                  const b = parseInt(theme.colors.text.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                },
                style: {
                  borderRadius: 16,
                },
              }}
              verticalLabelRotation={30}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel="R$ "
              yAxisSuffix=""
            />
          ) : (
            <Text style={[styles.emptyChartText, { color: theme.colors.textSecondary }]}>Sem dados mensais</Text>
          )}
        </View>

        {/* Resumo */}
        <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Resumo</Text>
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            Total gasto: R$ {cupons.reduce((sum, c) => sum + c.valorTotal, 0).toFixed(2)}
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            Total de cupons: {cupons.length}
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            Categorias: {Object.keys(gastosPorCategoria).length}
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyChartText: {
    fontSize: 14,
    marginTop: 20,
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
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

