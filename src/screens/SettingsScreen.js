// SettingsScreen.js
import React, { useEffect, useContext, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { SettingsContext } from '../context/SettingsContext'; 
import { translate } from '../utils/lang';

const LANGS = ['English', 'اردو', 'پنجابی', 'پشتو'];
const UNITS = ['Hectare', 'Acre'];

export default function SettingsScreen({ navigation }) {
    // --- Global settings context ---
    // Yahan hum wahi function name use kar rahe hain jo aapne diya hai
    const { settings, saveSettings: saveSettingsContext } = useContext(SettingsContext);

    const [unit, setUnit] = useState(settings.unit || 'Hectare');
    const [notifications, setNotifications] = useState(settings.notifications ?? true);
    const [offlineMode, setOfflineMode] = useState(settings.offlineMode ?? true);

    const themeDark = settings.themeDark;
    const language = settings.language; 

    // Helper function for quick translation
    const t = (key) => translate(key, language);
    
    const saveSetting = async (key, value, isGlobal = false) => {
        if (!isGlobal) {
            if (key === 'unit') setUnit(value);
            if (key === 'notifications') setNotifications(value);
            if (key === 'offlineMode') setOfflineMode(value);
        }

        const updatedSettings = {
            ...settings,
            [key]: value,
        };

        try {
            await AsyncStorage.setItem('@app_settings', JSON.stringify(updatedSettings));
            // Global changes (language, themeDark) call your context function
            if (isGlobal) saveSettingsContext(updatedSettings); 
        } catch (e) {
            console.warn('Failed to save settings', e);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const s = await AsyncStorage.getItem('@app_settings');
                if (s) {
                    const obj = JSON.parse(s);
                    setUnit(obj.unit || 'Hectare');
                    setNotifications(obj.notifications ?? true);
                    setOfflineMode(obj.offlineMode ?? true);
                }
            } catch (e) {
                console.warn('Failed to load settings', e);
            }
        })();
    }, []);

    const confirmClearHistory = () => {
        Alert.alert(
            t('Clear history'), 
            t('Are you sure you want to delete all saved scans and history? This cannot be undone.'), 
            [
                { text: t('Cancel'), style: 'cancel' }, 
                { 
                    text: t('Delete'), 
                    style: 'destructive', 
                    onPress: async () => {
                        await AsyncStorage.removeItem('@scan_history');
                        Alert.alert(t('Done'), t('Scan history cleared.')); 
                    }
                },
            ]
        );
    };

    const exportData = async () => {
        Alert.alert(t('Export Data'), t('Data export started (implement backend / file creation).'));
    };

    const navigateToProfile = () => {
        navigation.navigate('SignUp');
    };

    const currentStyles = themeDark ? darkStyles : lightStyles;
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    
    const textAlignmentStyle = isRTL ? { textAlign: 'right' } : { textAlign: 'left' };
    const rowDirectionStyle = isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' };

    return (
        <ScrollView style={[styles.container, currentStyles.container]} contentContainerStyle={{ paddingBottom: 40 }}>
            
            <Text style={[styles.sectionTitle, currentStyles.sectionTitle, textAlignmentStyle]}>{t('Account')}</Text>
            <TouchableOpacity style={styles.buttonLink} onPress={navigateToProfile}>
                <Text style={[styles.buttonLinkText, textAlignmentStyle]}>{t('Edit Profile (Change Signup Info)')}</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, currentStyles.sectionTitle, textAlignmentStyle]}>{t('General')}</Text>

            <Text style={[styles.label, currentStyles.label, textAlignmentStyle]}>{t('Language')}</Text>
            <View style={[styles.pickerWrap, currentStyles.pickerWrap]}>
                <Picker 
                    selectedValue={language} 
                    onValueChange={(v) => saveSetting('language', v, true)} 
                    style={[currentStyles.picker]} 
                    dropdownIconColor={themeDark ? "#fff" : "#000"}
                >
                    {LANGS.map(l => <Picker.Item key={l} label={l} value={l} />)}
                </Picker>
            </View>

            <View style={[styles.row, rowDirectionStyle]}>
                <Text style={[styles.label, currentStyles.label]}>{t('Dark Theme')}</Text>
                <Switch 
                    value={themeDark} 
                    onValueChange={(v) => saveSetting('themeDark', v, true)} 
                    trackColor={{ false: "#767577", true: "#81b0ff" }} 
                    thumbColor={themeDark ? "#0a7f2e" : "#f4f3f4"}
                />
            </View>

            <Text style={[styles.label, currentStyles.label, textAlignmentStyle]}>{t('Area Unit')}</Text>
            <View style={[styles.pickerWrap, currentStyles.pickerWrap]}>
                <Picker 
                    selectedValue={unit} 
                    onValueChange={(v) => saveSetting('unit', v)} 
                    style={[currentStyles.picker]}
                >
                    {UNITS.map(u => <Picker.Item key={u} label={u} value={u} />)}
                </Picker>
            </View>

            <Text style={[styles.sectionTitle, currentStyles.sectionTitle, textAlignmentStyle]}>{t('Notifications')}</Text>
            <View style={[styles.row, rowDirectionStyle]}>
                <Text style={[styles.label, currentStyles.label]}>{t('Reminders & Alerts')}</Text>
                <Switch 
                    value={notifications} 
                    onValueChange={(v) => saveSetting('notifications', v)} 
                    trackColor={{ false: "#767577", true: "#81b0ff" }} 
                    thumbColor={notifications ? "#0a7f2e" : "#f4f3f4"}
                />
            </View>

            <Text style={[styles.sectionTitle, currentStyles.sectionTitle, textAlignmentStyle]}>{t('Data & Privacy')}</Text>
            <View style={[styles.row, rowDirectionStyle]}>
                <Text style={[styles.label, currentStyles.label]}>{t('Offline Mode (save local)')}</Text>
                <Switch 
                    value={offlineMode} 
                    onValueChange={(v) => saveSetting('offlineMode', v)} 
                    trackColor={{ false: "#767577", true: "#81b0ff" }} 
                    thumbColor={offlineMode ? "#0a7f2e" : "#f4f3f4"}
                />
            </View>

            <TouchableOpacity style={[styles.button, {backgroundColor:'#ffdddd'}]} onPress={confirmClearHistory}>
                <Text style={[styles.buttonText, {color:'#a00'}]}>{t('Clear Scan History')}</Text>
            </TouchableOpacity>

            <Text style={[styles.small, currentStyles.small, {marginTop:20}, textAlignmentStyle]}>
                {t('About Text')}
            </Text>
        </ScrollView>
    );
}

// Styles remains the same as your original
const lightStyles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    sectionTitle: { color: '#000' },
    label: { color: '#000' },
    pickerWrap: { borderColor: '#eee' },
    picker: { color: '#000' },
    small: { color: '#666' }
});

const darkStyles = StyleSheet.create({
    container: { backgroundColor: '#121212' },
    sectionTitle: { color: '#e0e0e0' },
    label: { color: '#e0e0e0' },
    pickerWrap: { borderColor: '#333', backgroundColor: '#333' },
    picker: { color: '#e0e0e0' },
    small: { color: '#aaa' }
});

const styles = StyleSheet.create({
    container:{flex:1, padding:18},
    sectionTitle:{fontSize:16, fontWeight:'700', marginTop:20, marginBottom:5},
    label:{fontSize:14},
    pickerWrap:{ borderWidth:1, borderRadius:8, overflow:'hidden', marginTop:6},
    row:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:12},
    button:{backgroundColor:'#0a7f2e', padding:12, borderRadius:8, alignItems:'center', marginTop:12},
    buttonText:{color:'#fff', fontWeight:'700'},
    buttonLink:{borderBottomWidth:1, borderBottomColor:'#ccc', paddingBottom:5},
    buttonLinkText:{color:'#008CFF', fontWeight:'600', fontSize:15},
    small:{fontSize:12}
});