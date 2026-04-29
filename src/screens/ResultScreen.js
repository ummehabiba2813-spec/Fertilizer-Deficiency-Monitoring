import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios'; 

export default function ResultScreen({ route, navigation }) {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    const { photoUri } = route.params || {};
    
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    const [isLoading, setIsLoading] = useState(false);
    const [resultData, setResultData] = useState(null);

    // --- CONFIGURATION ---
    const DJANGO_URL = "http://10.230.255.206:8000";

    const handleAnalyze = async () => {
        setIsLoading(true);
        
        try {
            const userUID = await AsyncStorage.getItem('current_user_email') || 'guest';

            // 1. Image ko Form Data mein convert karein
            const formData = new FormData();
            formData.append('image', {
                uri: photoUri,
                name: 'leaf_scan.jpg',
                type: 'image/jpeg',
            });

            // 2. Django Model API ko call karein
            const predictResponse = await axios.post(`${DJANGO_URL}/api/predict/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // --- PROFESSIONAL CHECK: Low Confidence Handling ---
            if (predictResponse.data.status === "low_confidence") {
                setIsLoading(false);
                Alert.alert(
                    translate("Analysis Inconclusive", language),
                    translate(predictResponse.data.message, language),
                    [{ text: "OK" }]
                );
                return; // Logic yahan ruk jayegi agar result sahi nahi hai
            }

            // 3. Agar status success hai to data process karein
            const prediction = predictResponse.data.prediction;
            const confidence = predictResponse.data.confidence;

            // Recommendation results hasil karein
            const response = await axios.post(`${DJANGO_URL}/api/save-scan/`, {
                uid: userUID,
                crop: "Rice", // Aapka model Rice ke liye hai isliye yahan Rice likha hai
                result: prediction
            });

            const finalResult = {
                id: Date.now().toString(),
                date: new Date().toLocaleString(),
                deficiency: prediction, 
                confidence: confidence,
                fertilizer_1: response.data.fertilizer_1, 
                fertilizer_2: response.data.fertilizer_2,
                amount: response.data.amount || '50kg/acre',
                photo: photoUri
            };

            // 4. Local storage mein save karein
            const historyKey = `history_${userUID}`; 
            const existingHistory = await AsyncStorage.getItem(historyKey);
            const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
            historyArray.unshift(finalResult); 
            await AsyncStorage.setItem(historyKey, JSON.stringify(historyArray));

            setResultData(finalResult);

        } catch (error) {
            console.error("Integration Error:", error);
            Alert.alert("Server Error", "Model could not process image. Check Django terminal.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, {textAlign: isRTL ? 'right' : 'left'}]}>
                {translate('Analysis Result', language)}
            </Text>
            
            {photoUri && <Image source={{uri: photoUri}} style={styles.image} />}
            
            {isLoading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#2e7d32" />
                    <Text style={styles.loadingText}>
                        {translate('Analyzing leaf deficiency...', language)}
                    </Text>
                </View>
            )}

            {!isLoading && resultData && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>
                        {translate('Deficiency Detected', language)}: <Text style={styles.boldText}>{resultData.deficiency}</Text>
                    </Text>
                    <Text style={styles.confidence}>
                        {translate('Confidence', language)}: {resultData.confidence}%
                    </Text>

                    <TouchableOpacity 
                        style={styles.greenBtn} 
                        onPress={() => navigation.navigate('FertilizerRecommendation', { 
                            result: resultData, 
                            crop: "Rice" 
                        })}
                    >
                        <Text style={styles.btnText}>{translate('View Recommendation', language)}</Text>
                    </TouchableOpacity>                  
                </View>
            )}

            {!isLoading && !resultData && (
                <TouchableOpacity style={styles.greenBtn} onPress={handleAnalyze}>
                    <Text style={styles.btnText}>{translate('Analyze with Model', language)}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container:{flex:1, padding:20, alignItems:'center', backgroundColor:'#fff'},
    title:{fontSize:24, fontWeight:'700', marginTop:20, color: '#333'},
    image:{width:300, height:200, marginTop:20, borderRadius: 12, resizeMode: 'cover', borderWidth: 2, borderColor: '#ddd'},
    loaderContainer: { marginTop: 30, alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#2e7d32', fontWeight: '500' },
    resultBox: { marginTop: 25, width: '100%', padding: 15, backgroundColor: '#f1f8e9', borderRadius: 10, alignItems: 'center' },
    resultLabel: { fontSize: 18, color: '#333' },
    confidence: { fontSize: 14, color: '#666', marginTop: 5 },
    boldText: { fontWeight: 'bold', color: '#d32f2f' },
    greenBtn:{ marginTop:20, backgroundColor:'#2e7d32', paddingVertical:12, paddingHorizontal:40, borderRadius:8, elevation: 3 },
    btnText:{color:'#fff', fontWeight:'700', fontSize: 16}
});