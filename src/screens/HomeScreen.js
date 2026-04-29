import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, SafeAreaView, Modal, Pressable, StatusBar } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import auth from '@react-native-firebase/auth'; 

export default function HomeScreen({ route, navigation }) {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    const { isGuest } = route.params || { isGuest: true };
    const [menuVisible, setMenuVisible] = useState(false);

    // --- Logout Function ---
    const handleLogoutAndDelete = async () => {
        setMenuVisible(false);
        if (isGuest) {
            navigation.replace('Login');
            return;
        }

        Alert.alert(
            translate("Logout", language),
            translate("Are you sure? You want to logout.", language),
            [
                { text: translate("Cancel", language), style: "cancel" },
                { 
                    text: translate("Yes", language), 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth().currentUser;
                            if (user) {
                                await user.delete(); 
                                Alert.alert("Success", "Logout completed.");
                            }
                            navigation.replace('Login');
                        } catch (error) {
                            Alert.alert("Error", "Please Re-login to perform this action.");
                        }
                    } 
                }
            ]
        );
    };

    const handleRestrictedAction = (screenName) => {
        if (isGuest) {
            Alert.alert(translate('Access Denied', language), translate('This feature is only for logged-in users.', language));
        } else {
            navigation.navigate(screenName);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#639250" />
            
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{translate("Dashboard", language)}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* BOTTOM SHEET MENU */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.dragHandle} />
                        
                        <TouchableOpacity style={styles.menuOption} onPress={() => { setMenuVisible(false); navigation.navigate('Login'); }}>
                            <Text style={styles.menuOptionText}>🔐 {translate("Login", language)}</Text>
                        </TouchableOpacity>

                        {/* Updated to 'SignUp' to match App.js Case */}
                        <TouchableOpacity style={styles.menuOption} onPress={() => { setMenuVisible(false); navigation.navigate('SignUp'); }}>
                            <Text style={styles.menuOptionText}>📝 {translate("SignUp", language)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuOption, { borderBottomWidth: 0 }]} onPress={handleLogoutAndDelete}>
                            <Text style={[styles.menuOptionText, { color: '#E53935' }]}>🚪 {isGuest ? translate("Exit Guest Mode", language) : translate("Logout", language)}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.heroBox}>
                    <Image source={require('../assets/dashboard.png')} style={styles.heroImage} />
                    <Text style={styles.heroTitleText}>{translate("FARMER'S ASSISTANT", language)}</Text>
                    <Text style={styles.heroSubtitle}>{translate("AI-Based Fertilizer Deficiency Detection", language)}</Text>

                    <View style={styles.mainButtons}>
                        <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.navigate('LeafScan')}>
                            <Text style={styles.roundIcon}>📷</Text>
                            <Text style={styles.roundText}>{translate("Leaf Scan", language)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundBtn} onPress={() => handleRestrictedAction('Chatbot')}>
                            <Text style={styles.roundIcon}>🎤</Text>
                            <Text style={styles.roundText}>{translate("AI Chatbot", language)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card} onPress={() => handleRestrictedAction('History')}>
                        <Text style={styles.icon}>🕑</Text>
                        <Text style={styles.cardText}>{translate("History", language)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FertilizerCalculator')}>
                        <Text style={styles.icon}>🧮</Text>
                        <Text style={styles.cardText}>{translate("Calculator", language)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => handleRestrictedAction('Community')}>
                        <Text style={styles.icon}>👥</Text>
                        <Text style={styles.cardText}>{translate("Community", language)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('About')}>
                        <Text style={styles.icon}>ℹ️</Text>
                        <Text style={styles.cardText}>{translate("About", language)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Settings')}>
                        <Text style={styles.icon}>⚙️</Text>
                        <Text style={styles.cardText}>{translate("Settings", language)}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#639250' },
    headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#639250' },
    menuIcon: { fontSize: 28, color: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    dragHandle: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
    menuOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    menuOptionText: { fontSize: 18, fontWeight: '600', color: '#333' },
    container: { flexGrow: 1, backgroundColor: '#DFF3D8', paddingBottom: 30 },
    heroBox: { backgroundColor: '#639250', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingBottom: 30, alignItems: 'center', elevation: 5 },
    heroImage: { width: '90%', height: 160, borderRadius: 20, marginBottom: 15 },
    heroTitleText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    heroSubtitle: { color: '#E1FFE1', fontSize: 12, marginBottom: 20 },
    mainButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '90%' },
    roundBtn: { width: 110, height: 110, backgroundColor: '#5CC46A', borderRadius: 55, justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: '#fff' },
    roundIcon: { fontSize: 32 },
    roundText: { fontSize: 12, color: '#fff', fontWeight: 'bold', marginTop: 5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 25 },
    card: { width: '47%', height: 110, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, marginBottom: 20 },
    icon: { fontSize: 30, marginBottom: 5 },
    cardText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32' },
});