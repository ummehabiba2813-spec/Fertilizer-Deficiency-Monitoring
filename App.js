// App.js
import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LeafScanScreen from './src/screens/LeafScanScreen';
import SplashScreen from './src/screens/SplashScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FertilizerCalculatorScreen from './src/screens/FertilizerCalculatorScreen';
import FertilizerRecommendationScreen from './src/screens/FertilizerRecommendationScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ResultScreen from './src/screens/ResultScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AboutScreen from './src/screens/AboutScreen';
// Settings Context
import { SettingsProvider, SettingsContext } from './src/context/SettingsContext';

const Stack = createNativeStackNavigator();

// Navigator wrapper to use useContext at top level
function AppNavigator() {
  const { settings } = useContext(SettingsContext);

  // Global theme (dark/light)
  const theme = settings.themeDark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName="Splash">

        {/* Splash / Login / SignUp always white background */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' }
          }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' }
          }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' }
          }}
        />

        {/* Main app screens follow global theme */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="LeafScan" component={LeafScanScreen} />
        <Stack.Screen name="FertilizerCalculator" component={FertilizerCalculatorScreen} />
        <Stack.Screen name="FertilizerRecommendation" component={FertilizerRecommendationScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Main App wrapped with SettingsProvider
export default function App() {
  return (
    <SettingsProvider>
      <AppNavigator />
    </SettingsProvider>
  );
}
