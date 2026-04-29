import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import axios from 'axios';

export default function FertilizerCalculator() {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    
    const [acres, setAcres] = useState(''); 
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [areaType, setAreaType] = useState('Plain'); 
    const [deficiency, setDeficiency] = useState('Nitrogen');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    const textAlignmentStyle = isRTL ? { textAlign: 'right' } : { textAlign: 'left' };

    const crops = ['Wheat', 'Cotton', 'Rice', 'Maize', 'Sugarcane', 'Mustard', 'Bajra', 'Potato', 'Tomato', 'Citrus'];
    const areaTypes = ['Plain', 'Barani'];
    const deficiencies = ['Nitrogen', 'Phosphorus', 'Potassium'];

    const handleCalculateAndSave = async () => {
        // Validation for Input
        if (!acres || isNaN(acres) || parseFloat(acres) <= 0) {
            Alert.alert(translate('Error', language), translate('Please enter a valid area', language));
            return;
        }

        setLoading(true);
        setResult(null); // Purana result clear karein

        try {
            // 1. Get Rates from Server
            const response = await axios.get(`http://10.230.255.206:8000/api/get-rates/`, {
                params: { crop: selectedCrop, area: areaType, deficiency: deficiency },
                timeout: 5000 // 5 seconds timeout takay app hang na ho
            });

            // Check if data exists in response
            if (response.data && response.data.status !== 'not_possible' && response.data.fertilizer) {
                
                const ratePerAcre = response.data.bags_per_acre; 
                const fertilizerName = response.data.fertilizer;
                const totalRequired = (parseFloat(ratePerAcre) * parseFloat(acres)).toFixed(2);

                const finalMsg = `${translate('For', language)} ${acres} ${translate('Acres', language)} ${translate(selectedCrop, language)} (${translate(areaType, language)}), ${translate('you need', language)}: ${totalRequired} ${translate('Bags', language)} ${translate('of', language)} ${fertilizerName}`;
                
                setResult(finalMsg);
                Alert.alert(translate('Result', language), finalMsg);

                // 2. Save to History (Sirf tab jab result mil jaye)
                saveToBackendHistory(finalMsg);

            } else {
                // Agar status 'not_possible' ho ya data khali ho
                Alert.alert(translate('Notice', language), "Result related to your search is not found.");
            }

        } catch (error) {
            // Agar server 404 error de, ya network ka masla ho
            console.log("Calculation Error:", error.message);
            Alert.alert(translate('Notice', language), "Result related to your search is not found.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to save history
    const saveToBackendHistory = async (finalMsg) => {
        try {
            const userEmail = await AsyncStorage.getItem('current_user_email') || "farmer@example.com";
            await axios.post('http://10.230.255.206:8000/api/save-calculation/', {
                uid: userEmail, 
                crop: selectedCrop,
                area: acres,
                area_type: areaType,
                result: finalMsg
            });
            console.log("History saved successfully");
        } catch (saveErr) {
            console.log("History save failed silently:", saveErr.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={[styles.header, textAlignmentStyle]}>{translate('Fertilizer Calculator', language)}</Text>

            <Text style={[styles.label, textAlignmentStyle]}>{translate('Select Crop', language)}</Text>
            <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {crops.map((c) => (
                    <TouchableOpacity key={c} style={[styles.chip, selectedCrop === c && styles.activeChip]} onPress={() => setSelectedCrop(c)}>
                        <Text style={selectedCrop === c ? styles.whiteText : styles.blackText}>{translate(c, language)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.label, textAlignmentStyle]}>{translate('Area Type', language)}</Text>
            <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {areaTypes.map((a) => (
                    <TouchableOpacity key={a} style={[styles.chip, areaType === a && styles.activeChip]} onPress={() => setAreaType(a)}>
                        <Text style={areaType === a ? styles.whiteText : styles.blackText}>{translate(a, language)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.label, textAlignmentStyle]}>{translate('Deficiency', language)}</Text>
            <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {deficiencies.map((d) => (
                    <TouchableOpacity key={d} style={[styles.chip, deficiency === d && styles.activeChip]} onPress={() => setDeficiency(d)}>
                        <Text style={deficiency === d ? styles.whiteText : styles.blackText}>{translate(d, language)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <Text style={[styles.label, textAlignmentStyle]}>{translate('Enter Total Acres', language)}</Text>
            <TextInput 
                placeholder={translate('e.g. 5', language)} 
                value={acres} 
                onChangeText={setAcres} 
                keyboardType="numeric" 
                style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            />
            
            <TouchableOpacity style={styles.mainBtn} onPress={handleCalculateAndSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : 
                <Text style={styles.btnText}>{translate("Calculate & Save", language)}</Text>}
            </TouchableOpacity>

            {result && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f9f9f9' },
    header: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 20 },
    buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#2e7d32', borderRadius: 20 },
    activeChip: { backgroundColor: '#2e7d32' },
    whiteText: { color: '#fff' },
    blackText: { color: '#000' },
    mainBtn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resultCard: { padding: 15, backgroundColor: '#e8f5e9', borderRadius: 10, marginBottom: 80, borderWidth: 1, borderColor: '#2e7d32' },
    resultText: { fontSize: 16, color: '#2e7d32', fontWeight: '600', textAlign: 'center' }
});