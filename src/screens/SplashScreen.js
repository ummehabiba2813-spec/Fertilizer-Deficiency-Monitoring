import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');  // Splash ke baad Login open ho
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/Splash.png')} 
        style={{ width: 120, height: 120, resizeMode: 'contain' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f0f5f0ff' },
});
