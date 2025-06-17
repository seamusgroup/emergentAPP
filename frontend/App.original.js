import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import EmployeeDashboard from './src/screens/EmployeeDashboard';
import ManagerDashboard from './src/screens/ManagerDashboard';
import SuperAdminDashboard from './src/screens/SuperAdminDashboard';

// Import theme
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="EmployeeDashboard" component={EmployeeDashboard} />
            <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}