import { model } from '../../firebaseConfig';
import { CupomExtracao, CategoriaDespesa } from '../types/Cupom';

export const extractCupomData = async (imageUri: string): Promise<CupomExtracao> => {
  try {
    // Converter a imagem para base64 ou usar o método apropriado do Firebase AI
    // Por enquanto, vamos usar generateContent com a imagem
    const prompt = `Analise esta imagem de cupom fiscal e extraia as seguintes informações em formato JSON:
    {
      "valorTotal": número (valor numérico),
      "data": "YYYY-MM-DD",
      "hora": "HH:MM" (se disponível),
      "estabelecimento": "nome do estabelecimento",
      "categoria": uma das seguintes: "alimentação", "transporte", "lazer", "saúde", "educação", "moradia", "outros",
      "dadosExtras": {
        "items": ["item1", "item2"] (lista de itens comprados, se visível),
        "cnpj": "CNPJ se visível",
        "endereco": "endereço se visível"
      }
    }
    
    Responda APENAS com o JSON, sem texto adicional.`;

    // Para usar com imagem, precisamos usar o método generateContent com Part
    // Por enquanto, vamos fazer uma versão que funciona com texto primeiro
    // Depois podemos adaptar para aceitar imagem
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair dados do cupom');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    
    return {
      valorTotal: parseFloat(extractedData.valorTotal) || 0,
      data: extractedData.data || new Date().toISOString().split('T')[0],
      hora: extractedData.hora,
      estabelecimento: extractedData.estabelecimento || 'Estabelecimento não identificado',
      categoria: (extractedData.categoria as CategoriaDespesa) || CategoriaDespesa.OUTROS,
      dadosExtras: extractedData.dadosExtras,
    };
  } catch (error) {
    console.error('Erro ao extrair dados do cupom:', error);
    throw error;
  }
};

// Função para extrair dados de uma imagem usando Firebase AI Logic
export const extractCupomDataFromImage = async (imageBase64: string): Promise<CupomExtracao> => {
  try {
    // Remover o prefixo data:image/...;base64, se existir
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const prompt = `Você é um especialista em análise de cupons fiscais brasileiros. Sua tarefa é EXTRAIR APENAS informações que estão VISÍVEIS na imagem do cupom. NÃO invente, NÃO suponha, NÃO crie valores fictícios.

Analise a imagem cuidadosamente e extraia EXATAMENTE o que você consegue LER e VER:

1. Valor Total: Procure por "TOTAL", "VALOR TOTAL", "TOTAL A PAGAR" ou similar. Extraia o número EXATO que está escrito.
2. Data: Procure por campos de data no formato brasileiro (DD/MM/AAAA) ou similar. Converta para YYYY-MM-DD.
3. Hora: Procure por campos de hora (HH:MM). Se não encontrar, deixe null.
4. Estabelecimento: Procure pelo nome do estabelecimento comercial no topo ou início do cupom.
5. Categoria: Baseado nos ITENS que você vê no cupom, classifique em: "alimentação", "transporte", "lazer", "saúde", "educação", "moradia", ou "outros".
6. Itens: Liste os produtos/serviços que você consegue VER escritos no cupom.

Regras CRÍTICAS:
- Se você NÃO conseguir ver claramente uma informação na imagem, use o valor padrão indicado abaixo
- NÃO invente valores baseado em suposições
- NÃO crie dados que não estão na imagem
- Se a imagem estiver muito escura, borrada ou ilegível, indique isso claramente

Formato de resposta (JSON válido):
{
  "valorTotal": <número extraído do cupom ou 0 se não visível>,
  "data": "YYYY-MM-DD" ou data de hoje se não visível,
  "hora": "HH:MM" ou null,
  "estabelecimento": "<nome exato do estabelecimento>" ou "Estabelecimento não identificado",
  "categoria": "<uma das categorias listadas>",
  "dadosExtras": {
    "items": [<lista de itens visíveis no cupom>],
    "cnpj": "<se visível no cupom>",
    "endereco": "<se visível no cupom>"
  }
}

Responda APENAS com o JSON válido, sem explicações, sem texto adicional, sem markdown.`;

    // Usar generateContent com imagem usando Part com inlineData
    console.log('Enviando imagem para análise...');
    console.log('Tamanho do base64:', base64Data.length);
    
    const result = await model.generateContent([
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
    ]);
    
    const responseText = result.response.text();
    console.log('Resposta da IA:', responseText);
    
    // Extrair JSON da resposta - pode estar entre ```json ou apenas {...}
    let jsonString = responseText;
    
    // Tentar extrair JSON se estiver entre marcadores
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                     responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      jsonString = jsonMatch[1] || jsonMatch[0];
    }
    
    console.log('JSON extraído:', jsonString);
    
    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
      console.log('Dados parseados:', extractedData);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', jsonString);
      console.error('Erro completo:', parseError);
      throw new Error('Resposta da IA não está em formato JSON válido. Resposta: ' + responseText.substring(0, 200));
    }
    
    // Validar e retornar os dados extraídos
    return {
      valorTotal: extractedData.valorTotal ? parseFloat(extractedData.valorTotal.toString().replace(',', '.')) : 0,
      data: extractedData.data || new Date().toISOString().split('T')[0],
      hora: extractedData.hora || undefined,
      estabelecimento: extractedData.estabelecimento || 'Estabelecimento não identificado',
      categoria: extractedData.categoria && Object.values(CategoriaDespesa).includes(extractedData.categoria)
        ? (extractedData.categoria as CategoriaDespesa)
        : CategoriaDespesa.OUTROS,
      dadosExtras: extractedData.dadosExtras || undefined,
    };
  } catch (error) {
    console.error('Erro ao extrair dados do cupom da imagem:', error);
    throw error;
  }
};

