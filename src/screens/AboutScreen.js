import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Share, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';

export default function AboutScreen() {
    const navigation = useNavigation();
    const { settings } = useContext(SettingsContext);
    const { language, themeDark } = settings;

    const t = (key) => translate(key, language);
    const isRTL = ['اردو', 'پنجابی', 'پشتو'].includes(language);
    
    const team = [
        { name: 'Umm-e-Habiba', role: 'Developer', id: '22-ARID-874' },
        { name: 'Mustafa Nasir', role: 'Developer', id: '22-ARID-3113' },
        { name: 'Muhammad Adnan', role: 'Developer', id: '22-ARID-814' },
        { name: 'Dr. Saif Ur Rahman', role: 'Supervisor', id: 'PMAS AAUR' },
    ];

    const features = ['FEAT_1', 'FEAT_2', 'FEAT_3', 'FEAT_4'];

    const shareApp = async () => {
        try {
            await Share.share({ message: `${t('APP_NAME')}\n${t('SHARE_DESC')}` });
        } catch (error) { console.log(error); }
    };

    const currentStyles = themeDark ? darkStyles : lightStyles;

    return (
        <ScrollView style={[styles.container, currentStyles.container]} contentContainerStyle={{paddingBottom: 40}}>
            {/* Header Section */}
            <View style={[styles.headerCard, { backgroundColor: themeDark ? '#1e1e1e' : '#fff' }]}>
                <Image source={require('../assets/Logo.png')} style={styles.logo} />
                <Text style={[styles.title, currentStyles.text]}>{t('APP_NAME')}</Text>
                <Text style={styles.version}>v1.0.4 (Beta)</Text>
            </View>

            {/* Detailed Mission Section */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('OUR_MISSION')}</Text>
                <View style={[styles.card, { backgroundColor: themeDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.description, currentStyles.text, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('MISSION_TEXT_LONG')}
                    </Text>
                </View>
            </View>

            {/* Key Features Section */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('KEY_FEATURES')}</Text>
                <View style={[styles.card, { backgroundColor: themeDark ? '#1e1e1e' : '#fff' }]}>
                    {features.map((feat, idx) => (
                        <View key={idx} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Text style={styles.featureBullet}>•</Text>
                            <Text style={[styles.featureText, currentStyles.text, { textAlign: isRTL ? 'right' : 'left' }]}>{t(feat)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Team Section */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('TEAM_SUPERVISOR')}</Text>
                {team.map((member, index) => (
                    <View key={index} style={[styles.teamCard, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: themeDark ? '#1e1e1e' : '#fff' }]}>
                        <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{member.name[0]}</Text></View>
                        <View style={{marginHorizontal: 12, flex: 1}}>
                            <Text style={[styles.memberName, currentStyles.text]}>{member.name}</Text>
                            <Text style={styles.memberRole}>{member.role} • {member.id}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Privacy Policy Section */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('PRIVACY_POLICY')}</Text>
                <View style={[styles.card, { backgroundColor: themeDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.privacyText, currentStyles.small, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {t('PRIVACY_DESC')}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={{paddingHorizontal: 18, marginTop: 20}}>
                <TouchableOpacity style={styles.shareBtn} onPress={shareApp}>
                    <Text style={styles.shareText}>{t('SHARE_APP')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.outlineBtn, {borderColor: themeDark ? '#444' : '#ddd'}]} 
                    onPress={() => navigation.navigate('Settings')}>
                    <Text style={[styles.outlineText, currentStyles.text]}>{t('OPEN_SETTINGS')}</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.footerText, currentStyles.small]}>© 2026 PMAS Arid Agriculture University Rawalpindi.</Text>
        </ScrollView>
    );
}

const lightStyles = StyleSheet.create({
    container: { backgroundColor: '#f4f7f6' },
    text: { color: '#2c3e50' },
    small: { color: '#7f8c8d' }
});

const darkStyles = StyleSheet.create({
    container: { backgroundColor: '#121212' },
    text: { color: '#ecf0f1' },
    small: { color: '#95a5a6' }
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerCard: { alignItems: 'center', padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3 },
    logo: { width: 90, height: 90, borderRadius: 18 },
    title: { fontSize: 22, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
    version: { color: '#27ae60', fontSize: 13, fontWeight: '700', marginTop: 4 },
    sectionContainer: { paddingHorizontal: 18, marginTop: 25 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#27ae60', marginBottom: 10, letterSpacing: 0.5 },
    card: { padding: 18, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    description: { lineHeight: 24, fontSize: 14.5, color: '#34495e' },
    featureRow: { marginBottom: 10, alignItems: 'flex-start' },
    featureBullet: { color: '#27ae60', fontSize: 18, marginRight: 8, fontWeight: 'bold' },
    featureText: { flex: 1, fontSize: 14, lineHeight: 20 },
    teamCard: { padding: 12, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
    avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#27ae60', fontWeight: 'bold', fontSize: 18 },
    memberName: { fontSize: 15, fontWeight: '700' },
    memberRole: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
    privacyText: { fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
    shareBtn: { backgroundColor: '#27ae60', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
    shareText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    outlineBtn: { padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1.5 },
    outlineText: { fontWeight: '700', fontSize: 15 },
    footerText: { textAlign: 'center', marginTop: 30, fontSize: 11, paddingHorizontal: 20 }
});