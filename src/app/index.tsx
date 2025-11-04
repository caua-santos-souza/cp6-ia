import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>💰 Análise de Cupons Fiscais</Text>
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.themeToggleText, { color: theme.colors.primary }]}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>IA Generativa para seus gastos</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/capture')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📸</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Capturar Cupom</Text>
            <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
              Tire uma foto do seu cupom fiscal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/cupons')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Meus Cupons</Text>
            <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
              Veja todos os cupons salvos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/insights')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>💡</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Insights Financeiros</Text>
            <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
              Análises geradas por IA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/charts')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Gráficos</Text>
            <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
              Visualize seus gastos por categoria e mês
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/chatbot')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>🤖</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Chatbot Financeiro</Text>
            <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
              Tire dúvidas sobre suas finanças
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Como usar:</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            1. Capture um cupom fiscal usando a câmera{'\n'}
            2. A IA extrairá automaticamente os dados{'\n'}
            3. Salve e acompanhe seus gastos{'\n'}
            4. Receba insights personalizados
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  themeToggleText: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuItem: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
