import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { extractCupomDataFromImage } from '../services/aiExtraction';
import { saveCupom } from '../services/firestore';
import { CupomFiscal, CategoriaDespesa } from '../types/Cupom';
import { useTheme } from '../contexts/ThemeContext';

export default function CaptureScreen() {
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<CupomFiscal | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão da câmera para capturar cupons fiscais.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setExtractedData(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
      console.error(error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setExtractedData(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
      console.error(error);
    }
  };

  const extractData = async () => {
    if (!image) {
      Alert.alert('Aviso', 'Por favor, capture ou selecione uma imagem primeiro.');
      return;
    }

    setLoading(true);
    try {
      // Converter imagem para base64 usando expo-file-system ou método nativo
      // Para React Native, vamos usar fetch e converter para base64
      const response = await fetch(image);
      const blob = await response.blob();
      
      // Converter blob para base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const extracted = await extractCupomDataFromImage(base64data);
          
          const cupom: CupomFiscal = {
            ...extracted,
            imagemUri: image,
            createdAt: new Date(),
          };
          
          setExtractedData(cupom);
        } catch (error: any) {
          Alert.alert('Erro', `Não foi possível extrair dados: ${error.message}`);
          console.error('Erro detalhado:', error);
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        Alert.alert('Erro', 'Erro ao ler a imagem');
        setLoading(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error: any) {
      Alert.alert('Erro', `Erro ao processar imagem: ${error.message}`);
      console.error('Erro ao processar imagem:', error);
      setLoading(false);
    }
  };

  const saveExtractedCupom = async () => {
    if (!extractedData) return;

    setLoading(true);
    try {
      await saveCupom(extractedData);
      Alert.alert('Sucesso', 'Cupom salvo com sucesso!');
      setImage(null);
      setExtractedData(null);
    } catch (error: any) {
      Alert.alert('Erro', `Não foi possível salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Capturar Cupom Fiscal</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>📸 Tirar Foto</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity 
            style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={pickImageFromGallery}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>🖼️ Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={[styles.image, { backgroundColor: theme.colors.surface }]} />
            <View style={styles.buttonSpacer} />
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={extractData}
              disabled={loading}
            >
              <Text style={styles.buttonText}>✨ Extrair Dados</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Processando...</Text>
          </View>
        )}

        {extractedData && (
          <View style={[styles.dataContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.dataTitle, { color: theme.colors.text }]}>Dados Extraídos:</Text>
            <Text style={[styles.dataText, { color: theme.colors.text }]}>Estabelecimento: {extractedData.estabelecimento}</Text>
            <Text style={[styles.dataText, { color: theme.colors.primary, fontWeight: 'bold' }]}>Valor: R$ {extractedData.valorTotal.toFixed(2)}</Text>
            <Text style={[styles.dataText, { color: theme.colors.text }]}>Data: {extractedData.data}</Text>
            {extractedData.hora && (
              <Text style={[styles.dataText, { color: theme.colors.text }]}>Hora: {extractedData.hora}</Text>
            )}
            <Text style={[styles.dataText, { color: theme.colors.text }]}>Categoria: {extractedData.categoria}</Text>
            
            <View style={styles.buttonSpacer} />
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={saveExtractedCupom}
              disabled={loading}
            >
              <Text style={styles.buttonText}>💾 Salvar Cupom</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 12,
  },
  primaryButton: {
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  dataContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
});

