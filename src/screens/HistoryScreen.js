import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import axios from 'axios';

export default function HistoryScreen({ navigation }) {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    const themeDark = settings.themeDark; 

    const [activeTab, setActiveTab] = useState('scan');
    const [scanHistory, setScanHistory] = useState([]);
    const [calcHistory, setCalcHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    const t = (key) => translate(key, language);
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';

    const loadHistory = async () => {
        setLoading(true);
        try {
            const email = await AsyncStorage.getItem('current_user_email') || "farmer@example.com";
            setUserEmail(email);

            const savedScan = await AsyncStorage.getItem(`history_${email}`);
            setScanHistory(savedScan ? JSON.parse(savedScan) : []);

            const response = await axios.get(`http://10.230.255.206:8000/api/get-calculations/`, {
                params: { uid: email }
            });
            setCalcHistory(response.data);
        } catch (e) {
            console.log("Error loading history:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadHistory);
        return unsubscribe;
    }, [navigation]);

    // Sab se pehle Confirmation Pop-up aayega
    const deleteItem = (index, id = null) => {
        Alert.alert(
            t('Delete'), 
            t('Are you sure you want to delete this?'), 
            [
                { text: t('Cancel'), style: 'cancel' },
                { 
                    text: t('Yes'), 
                    onPress: async () => {
                        if (activeTab === 'scan') {
                            // Local Scan History Delete
                            const updatedScan = [...scanHistory];
                            updatedScan.splice(index, 1);
                            setScanHistory(updatedScan);
                            await AsyncStorage.setItem(`history_${userEmail}`, JSON.stringify(updatedScan));
                        } else {
                            // Calculation History Delete (UI se foran hatayein)
                            const updatedCalc = [...calcHistory];
                            updatedCalc.splice(index, 1);
                            setCalcHistory(updatedCalc);

                            // Backend delete call (Background mein chalne dein)
                            try {
                                await axios.delete(`http://10.230.255.206:8000/api/delete-calculation/${id}/`);
                            } catch (err) {
                                // Agar server error de bhi, to user ko Alert nahi dikhayenge
                                console.log("Server delete failed, but removed from UI:", err);
                            }
                        }
                    } 
                }
            ]
        );
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity 
            style={[
                styles.item, 
                { 
                    backgroundColor: themeDark ? '#1e1e1e' : '#fff', 
                    flexDirection: isRTL ? 'row-reverse' : 'row' 
                }
            ]}
            onPress={() => activeTab === 'scan' ? navigation.navigate('FertilizerRecommendation', { result: item }) : null}
        >
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={styles.dateText}>{activeTab === 'scan' ? item.date : item.created_at}</Text>
                <Text style={styles.resultHeading}>
                    {activeTab === 'scan' ? t(item.deficiency) : `${t(item.crop)} (${item.area} ${t('Acres')})`}
                </Text>
                <Text style={{color: themeDark ? '#ccc' : '#666', fontSize: 13}}>
                    {activeTab === 'scan' ? item.crop : item.result}
                </Text>
            </View>

            <TouchableOpacity onPress={() => deleteItem(index, item.id)} style={styles.deleteBtn}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: themeDark ? '#121212' : '#f7f7f7' }]}>
            <View style={[styles.tabContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'scan' && styles.activeTab]} 
                    onPress={() => setActiveTab('scan')}
                >
                    <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>{t('Scan History')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'calc' && styles.activeTab]} 
                    onPress={() => setActiveTab('calc')}
                >
                    <Text style={[styles.tabText, activeTab === 'calc' && styles.activeTabText]}>{t('Calculation History')}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={activeTab === 'scan' ? scanHistory : calcHistory}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>{t('No history found')}</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    tabContainer: { backgroundColor: '#e0e0e0', borderRadius: 25, marginBottom: 20, padding: 5, flexDirection: 'row' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
    activeTab: { backgroundColor: '#2e7d32' },
    tabText: { fontWeight: 'bold', color: '#555' },
    activeTabText: { color: '#fff' },
    item: { 
        padding: 15, 
        marginBottom: 12, 
        borderRadius: 15, 
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#2e7d32',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dateText: { fontSize: 11, color: '#888', marginBottom: 5 },
    resultHeading: { fontSize: 17, fontWeight: 'bold', color: '#2e7d32' },
    deleteBtn: { padding: 10, marginLeft: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});