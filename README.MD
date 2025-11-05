# CP6-IA — App Móvel de Análise de Cupons com IA Generativa

Português — Documento principal do projeto.

## Visão geral

Este repositório contém um aplicativo móvel (Expo / React Native + TypeScript) que captura imagens de cupons fiscais, extrai automaticamente informações relevantes usando o Firebase AI Logic (analyze-images) e gera insights financeiros personalizados com o modelo generativo Gemini 2.5 Flash via AI Logic Chat.

Objetivos principais:
- Capturar imagem do cupom pelo dispositivo (câmera ou galeria).
- Enviar imagem para análise usando Firebase AI Logic (analyze-images).
- Extrair campos principais: valor total, data/hora, estabelecimento e categoria da despesa.
- Persistir os registros em Firestore.
- Gerar insights em linguagem natural usando Gemini 2.5 Flash (AI Logic Chat).

O app usa Expo (veja `package.json`) e integra com Firebase para Storage, Firestore e AI Logic.

## Funcionalidades implementadas

- Captura/seleção de imagem (câmera/galeria) — `expo-image-picker`.
- Upload para Storage / processamento via Cloud Function (recomendado) ou chamada backend que invoca AI Logic.
- Extração de campos do cupom por AI Logic `analyze-images`.
- Persistência dos dados extraídos em Firestore.
- Tela de listagem de cupons e visualização detalhada.
- Geração de insights financeiros (comparativos mensais, alertas) usando AI Logic Chat (Gemini 2.5 Flash).
- Gráficos de gastos mensais por categoria (`react-native-chart-kit`).
- Notificações locais (pontapé inicial com `expo-notifications`).

Extras (sugestões/futuro): chatbot financeiro integrado, sincronização multi-conta, regras de alerta configuráveis.

## Tecnologias

- Frontend: Expo / React Native + TypeScript
- Firebase: Firestore, Storage, Firebase Functions (backend recomendado), Firebase AI Logic (analyze-images + chat)
- IA generativa: Gemini 2.5 Flash (via Firebase AI Logic Chat API)
- Charts: `react-native-chart-kit`

## Arquitetura (resumo)

App (Expo) -> Storage (upload imagem) -> Cloud Function (trigger on upload)
		-> AI Logic analyze-images (extrai campos)
		-> Cloud Function processa saída e salva em Firestore
		-> App consulta Firestore e pede insights para AI Logic Chat (Gemini 2.5 Flash)

Diagrama ASCII:

App (Expo)
	├─ Upload imagem -> Firebase Storage
	├─ Ler/mostrar dados -> Firestore
	└─ Pedir insight -> Cloud Function / Backend -> AI Logic Chat (Gemini 2.5 Flash)

Cloud Functions
	├─ Trigger: storage.object.finalize (nova imagem)
	├─ Chama: AI Logic analyze-images
	├─ Normaliza e valida campos
	└─ Persiste: Firestore (coleção `cupons`)

AI Logic
	├─ analyze-images -> retorna entidades / texto OCR
	└─ chat (Gemini 2.5 Flash) -> gera insights em linguagem natural

## Contrato de dados (exemplo)

Exemplo do documento salvo em Firestore (`cupons/{id}`):

```json
{
	"estabelecimento": "Padaria Boa Pão",
	"valor_total": 34.50,
	"data_hora": "2025-10-12T09:23:00.000Z",
	"categoria": "Alimentação",
	"itens": [
		{"descricao": "Pão francês", "quantidade": 10, "valor": 10.0},
		{"descricao": "Café", "quantidade": 1, "valor": 5.0}
	],
	"origem_imagem": "gs://<bucket>/uploads/receipt-123.jpg",
	"createdAt": "2025-10-12T09:25:00.000Z",
	"processedByAI": true
}
```

## Configuração do Firebase (resumo)

1. Crie um projeto no Firebase Console.
2. Habilite Firestore (modo start em teste durante o desenvolvimento) e Firebase Storage.
3. Habilite a API do AI Logic conforme a documentação: https://firebase.google.com/docs/ai-logic
4. Configure uma conta de serviço (Service Account) com permissões para AI Logic / Storage / Firestore para uso em Cloud Functions.
5. No projeto frontend, adicione as configurações do Firebase em `.env` neste modelo:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=<sua_api_key_aqui>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<seu_projeto.firebaseapp.com>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<seu_projeto_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<seu_projeto.appspot.com>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<seu_sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<seu_app_id>
```
e coloque suas keys do firebase onde é requisitado.

6. Configure regras de segurança do Firestore e Storage apropriadas antes do deploy.

Obs: por segurança, chame AI Logic a partir de backend (Cloud Functions) usando a Service Account. Evite colocar chaves sensíveis no app cliente.

## Integração com Firebase AI Logic — fluxo e notas

Fluxo recomendado:
- App envia imagem para Firebase Storage (upload autenticado).
- Cloud Function (trigger on finalize) baixa a imagem e chama AI Logic analyze-images.
- A resposta do AI Logic é processada (OCR + entidades) para extrair `valor_total`, `data_hora`, `estabelecimento` e inferir `categoria`.
- Salva documento em Firestore.

Pontos importantes:
- Use validação/normalização robusta (parse de valores monetários, formatos de data locais).
- Para classificar categoria, você pode usar uma regra simples baseada em palavras-chave do estabelecimento ou delegar a classificação para o modelo generativo (pedir ao Gemini que retorne a categoria dada a transcrição).
- Mantenha logs e métricas para monitorar a qualidade da extração.

Exemplo de payload (pseudocódigo) para `analyze-images` — ver doc oficial para formato exato:

```json
{
	"image": {"gcsUri": "gs://<bucket>/uploads/receipt-123.jpg"},
	"features": ["DOCUMENT_TEXT_DETECTION"]
}
```

Depois de obter o texto OCR, aplique heurísticas / regex para encontrar o total e a data. Se a extração falhar, registre e considere solicitar revisão manual.

## Uso do Gemini 2.5 Flash (AI Logic Chat) para insights

Como funciona:
- App ou backend envia uma mensagem para AI Logic Chat usando o endpoint apropriado e selecionando o modelo `gemini-2.5-flash`.
- No prompt, forneça o histórico mínimo: recortes dos registros do usuário (ou sumarize previamente) e peça insights (comparativos, alertas, dicas).

Exemplo de prompt (simplificado):

"Tenho estes gastos no mês de outubro: Alimentação: R$ 800, Transporte: R$ 120, Lazer: R$ 200. Compare com setembro (Alimentação: R$ 700). Gere 3 insights práticos e sugerir um plano de economia de 10%."

Resposta esperada (exemplo):
"Suas despesas em alimentação aumentaram 14% em relação a setembro. Sugestão: reduzir lanches fora para economizar R$ 80/mês..."

Boas práticas de prompt:
- Forneça contexto e limites (ex.: "resuma em 3 bullets, linguagem simples, e inclua porcentagens").
- Evite enviar PII desnecessária.
- Para performance, envie resumos em vez de todos os registros se o histórico for grande.

## Trechos de código (exemplos) — pontos de integração

- Upload do app para o Storage (exemplo em `capture.tsx`):

```ts
// captura imagem e faz upload para Storage
const uploadImage = async (uri: string, filename: string) => {
	const response = await fetch(uri);
	const blob = await response.blob();
	const ref = firebase.storage().ref().child(`uploads/${filename}`);
	await ref.put(blob);
	return ref.getDownloadURL();
}
```

- Cloud Function (pseudocódigo) para invocar analyze-images e salvar em Firestore:

```js
exports.onReceiptUpload = functions.storage.object().onFinalize(async (object) => {
	const gcsUri = `gs://${object.bucket}/${object.name}`;
	// Chamar AI Logic analyze-images (via SDK/REST) com gcsUri
	const aiResult = await callAiLogicAnalyzeImages(gcsUri);
	const parsed = parseReceipt(aiResult);
	await firestore.collection('cupons').add(parsed);
});
```

- Chamada ao AI Logic Chat (pseudocódigo):

```js
const chatResponse = await callAiLogicChat({
	model: 'gemini-2.5-flash',
	messages: [
		{role: 'system', content: 'Você é um assistente financeiro.'},
		{role: 'user', content: 'Analise estes gastos e gere insights...'}
	]
});
```

Observação: consulte a documentação oficial do Firebase AI Logic (https://firebase.google.com/docs/ai-logic) para o formato exato de requisições e bibliotecas suportadas.

## Trechos assistidos pelo GitHub Copilot

Durante o desenvolvimento, o Copilot foi usado para:
- Sugerir regex para extrair valores monetários e datas a partir do OCR.
- Sugerir e otimizar trechos de código durante o desenvolvimento.
- Propor prompts refinados para o Gemini (ex.: instruções de sistema e formatação da saída).

Exemplo (registro no README): "Trecho X gerado com ajuda do Copilot: função `parseReceipt` — sugeriu a regex e testes de borda". Inclua comentários no código indicando onde o Copilot ajudou (ex.: `// sugerido pelo Copilot`).

## Como rodar (desenvolvimento)

Pré-requisitos: Node.js (LTS), Expo CLI, Firebase CLI configurado e login com conta que tem acesso ao projeto Firebase.

Instalar dependências:

```powershell
npx expo install
```
crie um arquivo .env na pasta raiz do projeto com as keys do firebase:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=<sua_api_key_aqui>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<seu_projeto.firebaseapp.com>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<seu_projeto_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<seu_projeto.appspot.com>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<seu_sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<seu_app_id>
```

Iniciar o app (Expo):

```powershell
npx expo start
```
## Testes rápidos

- Upload manual de uma imagem de cupom e verificar se um documento aparece em `cupons` no Firestore.
- Teste de prompt: enviar resumo ao endpoint de Chat e validar resposta (linguagem, percentuais, sugestões).

## Prompts e exemplos práticos

- Prompt para classificação de categoria (entrada: transcrição OCR):

"Você é um classificador de despesas. Dada a transcrição do cupom, responda apenas com uma das categorias: Alimentação, Transporte, Lazer, Saúde, Supermercado, Outros. Transcrição: '...'."

- Prompt para gerar insights mensais:

"Resuma as despesas do mês em até 4 bullets: 1) principais categorias por gasto; 2) variação percentual vs mês anterior; 3) 2 ações práticas para reduzir gastos em categorias mais altas. Formato: JSON com campos 'insights' e 'actions'."

Incluímos no repositório exemplos reais de prompts usados e respostas observadas (adicione no diretório `docs/prompts/` se desejar armazenar exemplos).



