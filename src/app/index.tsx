import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💰 Análise de Cupons Fiscais</Text>
        <Text style={styles.subtitle}>IA Generativa para seus gastos</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/capture')}
          >
            <Text style={styles.menuIcon}>📸</Text>
            <Text style={styles.menuTitle}>Capturar Cupom</Text>
            <Text style={styles.menuDescription}>
              Tire uma foto do seu cupom fiscal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/cupons')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuTitle}>Meus Cupons</Text>
            <Text style={styles.menuDescription}>
              Veja todos os cupons salvos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/insights')}
          >
            <Text style={styles.menuIcon}>💡</Text>
            <Text style={styles.menuTitle}>Insights Financeiros</Text>
            <Text style={styles.menuDescription}>
              Análises geradas por IA
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Como usar:</Text>
          <Text style={styles.infoText}>
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
