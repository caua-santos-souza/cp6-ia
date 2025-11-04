import { model } from '../../firebaseConfig';
import { CupomFiscal } from '../types/Cupom';

export const generateFinancialInsights = async (cupons: CupomFiscal[]): Promise<string> => {
  try {
    if (cupons.length === 0) {
      return 'Você ainda não possui cupons registrados. Comece capturando alguns cupons fiscais!';
    }

    // Organizar dados para análise
    const totalGastos = cupons.reduce((sum, cupom) => sum + cupom.valorTotal, 0);
    const gastosPorCategoria = cupons.reduce((acc, cupom) => {
      acc[cupom.categoria] = (acc[cupom.categoria] || 0) + cupom.valorTotal;
      return acc;
    }, {} as Record<string, number>);

    const categoriaMaisGasta = Object.entries(gastosPorCategoria)
      .sort(([, a], [, b]) => b - a)[0];

    const prompt = `Você é um assistente financeiro pessoal amigável. Analise estes dados e dê insights de forma NATURAL e CONVERSA, como se estivesse conversando com um amigo.

Dados:
- Total de cupons: ${cupons.length}
- Total gasto: R$ ${totalGastos.toFixed(2)}
- Gastos por categoria:
${Object.entries(gastosPorCategoria).map(([cat, valor]) => `  • ${cat}: R$ ${valor.toFixed(2)}`).join('\n')}
- Categoria com maior gasto: ${categoriaMaisGasta ? categoriaMaisGasta[0] : 'N/A'}

INSTRUÇÕES IMPORTANTES:
- Seja CONCISO e DIRETO (máximo 150 palavras)
- Use linguagem NATURAL e CONVERSACIONAL, como se estivesse falando com um amigo
- Não use formatação markdown excessiva (sem listas longas, sem títulos com #)
- Foque nos pontos principais
- Se houver poucos dados, seja honesto e dê dicas práticas
- Se houver muitos dados, destaque padrões interessantes
- Use emojis ocasionalmente se fizer sentido (💰 📊 💡)
- Não seja formal demais - seja amigável!

Responda em parágrafos curtos e naturais, como uma conversa.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Erro ao gerar insights financeiros:', error);
    throw error;
  }
};

