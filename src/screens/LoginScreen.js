import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';

export default function LoginScreen({ navigation }) {
    // --- Context aur Language Setup ---
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    
    // --- RTL Check ---
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    const textAlignmentStyle = isRTL ? { textAlign: 'right', writingDirection: 'rtl' } : { textAlign: 'left', writingDirection: 'ltr' };
    const inputDirectionStyle = isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- Guest Login Logic ---
    const handleGuestPress = () => {
        // Dashboard (Home) par bhej rahe hain isGuest flag ke sath
        navigation.replace('Home', { isGuest: true }); 
    };

    // --- Standard Login Logic ---
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(translate('Error', language), translate('Please enter email and password', language));
            return;
        }

        try {
            const userData = await AsyncStorage.getItem(`user_${email}`);
            if (!userData) {
                Alert.alert(translate('Error', language), translate("You don't have an account. Please Sign Up.", language));
                return;
            }

            const user = JSON.parse(userData);

            if (password !== user.password) {
                Alert.alert(translate('Error', language), translate('Incorrect password', language));
                return;
            }

            Alert.alert(translate('Success', language), translate('Login Successful!', language));
            
            await AsyncStorage.setItem('current_user_email', email); 
            
            // Login user ke liye isGuest: false bhej rahe hain
            navigation.replace('Home', { isGuest: false, userId: email });

        } catch (error) {
            console.log(error);
            Alert.alert(translate('Error', language), translate('Something went wrong', language));
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 180 }}>
                <View style={styles.iconCircle}><Text style={styles.leaf}>🌿</Text></View>
                <Text style={[styles.title, textAlignmentStyle]}>{translate("Welcome Back!", language)}</Text>
                <Text style={[styles.subtitle, textAlignmentStyle]}>{translate("Login to Continue", language)}</Text>

                {/* Email/Phone Input */}
                <View style={[styles.inputBox, inputDirectionStyle]}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput 
                        placeholder={translate("Email or Phone", language)} 
                        style={[styles.input, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]} 
                        placeholderTextColor="#888" 
                        value={email} 
                        onChangeText={setEmail} 
                    />
                </View>

                {/* Password Input */}
                <View style={[styles.inputBox, inputDirectionStyle]}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput 
                        placeholder={translate("Password", language)} 
                        secureTextEntry 
                        style={[styles.input, isRTL ? { textAlign: 'right' } : { textAlign: 'left' }]} 
                        placeholderTextColor="#888" 
                        value={password} 
                        onChangeText={setPassword} 
                    />
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                    <Text style={styles.loginText}>{translate("Login", language)}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={[styles.signup, textAlignmentStyle]}>{translate("Don't have an account? Sign Up", language)}</Text>
                </TouchableOpacity>

                {/* Updated Guest Button */}
                <TouchableOpacity onPress={handleGuestPress}>
                    <Text style={[styles.guest, textAlignmentStyle]}>{translate("Continue as Guest", language)}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    iconCircle: { width: 70, height: 70, borderRadius: 40, backgroundColor: '#D4F5D4', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    leaf: { fontSize: 32 },
    title: { fontSize: 26, fontWeight: '700', color: '#1B3C1A' },
    subtitle: { fontSize: 16, color: '#4A654A', marginBottom: 25, marginTop: 4 },
    inputBox: { flexDirection: 'row', width: '100%', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 15, elevation: 3, alignItems: 'center' },
    inputIcon: { fontSize: 20, marginRight: 10, marginLeft: 0 },
    input: { flex: 1, fontSize: 16, color: '#000' },
    loginBtn: { width: '100%', backgroundColor: '#2E7D32', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    loginText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    signup: { marginTop: 15, fontSize: 16, color: '#2E7D32', fontWeight: '600' },
    guest: { marginTop: 12, fontSize: 15, color: '#555', textDecorationLine: 'underline' }, // Thora prominent kiya hai
});