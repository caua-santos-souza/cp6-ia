import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function StackNavigator() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.colors.text,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
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
      <Stack.Screen 
        name="charts" 
        options={{ 
          title: 'Gráficos',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="chatbot" 
        options={{ 
          title: 'Chatbot Financeiro',
          headerShown: true 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StackNavigator />
    </ThemeProvider>
  );
}

