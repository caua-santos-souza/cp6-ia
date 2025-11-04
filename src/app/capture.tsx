import { StyleSheet, Text, View, Button, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { extractCupomDataFromImage } from '../services/aiExtraction';
import { saveCupom } from '../services/firestore';
import { CupomFiscal, CategoriaDespesa } from '../types/Cupom';

export default function CaptureScreen() {
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Capturar Cupom Fiscal</Text>
        
        <View style={styles.buttonContainer}>
          <Button title="Tirar Foto" onPress={pickImage} />
          <View style={styles.buttonSpacer} />
          <Button title="Escolher da Galeria" onPress={pickImageFromGallery} />
        </View>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.buttonSpacer} />
            <Button title="Extrair Dados" onPress={extractData} disabled={loading} />
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processando...</Text>
          </View>
        )}

        {extractedData && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Dados Extraídos:</Text>
            <Text style={styles.dataText}>Estabelecimento: {extractedData.estabelecimento}</Text>
            <Text style={styles.dataText}>Valor: R$ {extractedData.valorTotal.toFixed(2)}</Text>
            <Text style={styles.dataText}>Data: {extractedData.data}</Text>
            {extractedData.hora && (
              <Text style={styles.dataText}>Hora: {extractedData.hora}</Text>
            )}
            <Text style={styles.dataText}>Categoria: {extractedData.categoria}</Text>
            
            <View style={styles.buttonSpacer} />
            <Button title="Salvar Cupom" onPress={saveExtractedCupom} disabled={loading} />
          </View>
        )}
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  imageContainer: {
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  dataContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dataText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
});

