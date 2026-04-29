import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth'; 
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import axios from 'axios';

const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen({ navigation }) {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = "http://10.230.255.206:8000/api/signup/";

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        let temp = {};
        if (!form.fullName.trim()) temp.fullName = translate("full_name_required", language);
        else if (!nameRegex.test(form.fullName.trim())) temp.fullName = translate("name_alphabet_only", language);

        if (!form.email.trim()) temp.email = translate("email_required", language);
        else if (!emailRegex.test(form.email.trim())) temp.email = translate("invalid_email", language);

        if (!form.password.trim()) temp.password = translate("password_required", language);
        if (form.password.length < 6) temp.password = "Password must be at least 6 characters";
        if (form.password !== form.confirmPassword) temp.confirmPassword = translate("passwords_dont_match", language);
        
        if (!form.location.trim()) temp.location = "Location is required";

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setIsLoading(true);

        try {
            const firebaseUser = await auth().createUserWithEmailAndPassword(
                form.email.trim(), 
                form.password
            );

            // API payload updated (crop_type removed)
            const djangoResponse = await axios.post(API_URL, {
                username: form.email.trim(),
                email: form.email.trim(),
                password: form.password, 
                full_name: form.fullName,
                location: form.location,
                firebase_uid: firebaseUser.user.uid 
            });

            await AsyncStorage.setItem(`user_${form.email}`, JSON.stringify(form));

            Alert.alert("Success", "Account created successfully");
            navigation.replace("Login");

        } catch (err) {
            console.log("Signup Error: ", err);
            
            if (err.code === 'auth/email-already-in-use') {
                Alert.alert("Error", "This email is already registered.");
            } else {
                Alert.alert("Error", "Connection failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputFields = [
        { key: "fullName", icon: "👤", placeholder: "full_name_placeholder" },
        { key: "email", icon: "📩", placeholder: "email_placeholder" },
        { key: "password", icon: "🔒", placeholder: "password_placeholder", secure: true },
        { key: "confirmPassword", icon: "🔒", placeholder: "confirm_password_placeholder", secure: true },
        { key: "location", icon: "📍", placeholder: "location_placeholder" },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{translate("create_account", language)}</Text>
            
            {inputFields.map((item, index) => (
                <View key={index} style={{ width: "80%" }}>
                    <View style={styles.inputBox}>
                        <Text style={styles.inputIcon}>{item.icon}</Text>
                        <TextInput
                            placeholder={translate(item.placeholder, language)}
                            placeholderTextColor="#7A7A7A"
                            style={styles.input}
                            value={form[item.key]}
                            secureTextEntry={item.secure || false}
                            onChangeText={(text) => setForm({...form, [item.key]: text})}
                            autoCapitalize={item.key === "email" || item.key === "password" ? "none" : "words"}                        />
                    </View>
                    {errors[item.key] && <Text style={styles.errorText}>{errors[item.key]}</Text>}
                </View>
            ))}

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>SIGN UP</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 20 }}>
                <Text style={{ color: '#2E7D32' }}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 50, paddingBottom: 50, alignItems: 'center', backgroundColor: '#E6F7E6' },
    title: { fontSize: 26, fontWeight: '700', color: '#1B3C1A', marginBottom: 20 },
    inputBox: { flexDirection: 'row', width: '100%', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 5, elevation: 3, alignItems: 'center' },
    inputIcon: { fontSize: 20, marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: '#000000' },
    errorText: { color: "red", marginBottom: 10, fontSize: 12 },
    signupBtn: { width: '80%', backgroundColor: '#2E7D32', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    signupText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});