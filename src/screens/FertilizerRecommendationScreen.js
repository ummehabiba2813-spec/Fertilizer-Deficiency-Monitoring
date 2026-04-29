import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import axios from 'axios';

export default function FertilizerRecommendationScreen({ route }) {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    
    const { result, crop } = route.params || {};
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // APNA IP ADDRESS YAHAN LIKHEIN
    const API_BASE_URL = "http://10.230.255.206:8000"; 

    useEffect(() => {
        const fetchDatabasePrice = async () => {
            try {
                const deficiencyName = result?.deficiency || 'Nitrogen';
                 const cropName = crop || 'Wheat'; 
                const response = await axios.get(`${API_BASE_URL}/api/get-recommendation/`, {
                    params: { deficiency: deficiencyName , crop: cropName }
                });

                if (response.data.status === 'success') {
                    setData(response.data);
                }
            } catch (error) {
                console.log("Database Fetch Error: Using fallback data", error);
                // Agar server down ho to purana data dikhaye
                setData(result); 
            } finally {
                setLoading(false);
            }
        };

        fetchDatabasePrice();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text>Fetching Latest Prices...</Text>
            </View>
        );
    }

    const displayData = data || result || {};
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    const textAlignmentStyle = isRTL ? { textAlign: 'right' } : { textAlign: 'left' };
    const flexDirectionStyle = isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={[styles.card, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                
                <Text style={[styles.header, textAlignmentStyle]}>{translate('RECOM_PLAN', language)}</Text>
                <View style={styles.divider} />

                <Text style={[styles.label, textAlignmentStyle]}>{translate('Deficiency', language)}:</Text>
                <Text style={[styles.valueHighlight, textAlignmentStyle]}>{translate(displayData.deficiency, language)}</Text>

                <Text style={[styles.label, textAlignmentStyle]}>{translate('Fertilizer Option 1', language)}:</Text>
                <View style={[styles.priceRow, flexDirectionStyle]}>
                    <Text style={styles.valueBold}>{translate(displayData.fertilizer_1, language)}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>Rs. {displayData.price1 || '0'}</Text>
                    </View>
                </View>

                {displayData.fertilizer_1 !== displayData.fertilizer_2 && (
                    <>
                        <Text style={[styles.label, textAlignmentStyle]}>{translate('Fertilizer Option 2', language)}:</Text>
                        <View style={[styles.priceRow, flexDirectionStyle]}>
                            <Text style={styles.valueBold}>{translate(displayData.fertilizer_2, language)}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>Rs. {displayData.price2 || '0'}</Text>
                            </View>
                        </View>
                    </>
                )}

                <Text style={[styles.label, textAlignmentStyle]}>{translate('Required Amount', language)}:</Text>
                <Text style={[styles.value, textAlignmentStyle]}>{displayData.amount}</Text>

                <View style={styles.noteBox}>
                    <Text style={[styles.label, textAlignmentStyle, { color: '#2e7d32', marginTop: 0 }]}>{translate('Note', language)}:</Text>
                    <Text style={[styles.noteText, textAlignmentStyle]}>{translate(displayData.note_key, language)}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 15, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 5, width: '100%' },
    header: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', width: '100%' },
    divider: { height: 3, backgroundColor: '#4caf50', width: 60, marginBottom: 20, borderRadius: 2 },
    label: { fontSize: 14, color: '#666', marginTop: 15, fontWeight: '600', width: '100%' },
    valueHighlight: { fontSize: 22, fontWeight: 'bold', color: '#d32f2f', width: '100%' },
    valueBold: { fontSize: 18, fontWeight: '700', color: '#333' },
    priceRow: { width: '100%', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginTop: 5 },
    priceContainer: { backgroundColor: '#2e7d32', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    priceText: { color: '#fff', fontWeight: 'bold' },
    value: { fontSize: 18, color: '#444', marginTop: 5 },
    noteBox: { marginTop: 25, padding: 15, backgroundColor: '#f1f8e9', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#2e7d32', width: '100%' },
    noteText: { fontSize: 15, color: '#444', fontStyle: 'italic' }
});