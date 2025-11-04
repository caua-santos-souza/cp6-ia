import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#000000', // Cor preta para o botão de voltar e texto do header
        headerStyle: {
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Início',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="capture" 
        options={{ 
          title: 'Capturar Cupom',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="cupons" 
        options={{ 
          title: 'Meus Cupons',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="insights" 
        options={{ 
          title: 'Insights Financeiros',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}

