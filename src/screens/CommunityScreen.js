import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import { launchImageLibrary } from 'react-native-image-picker'; // Image Picker Import

const RecordingIndicator = ({ time, language }) => { 
    const blinkAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
        ).start();
    }, [blinkAnim]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };
    
    const isRTL = language === 'ur' || language === 'pa' || language === 'ps';

    return (
        <View style={[recordingStyles.indicatorContainer, isRTL && { flexDirection: 'row-reverse' }]}>
            <Animated.View style={[recordingStyles.redDot, { opacity: blinkAnim }]} />
            <Text style={[recordingStyles.recordingText, isRTL && { textAlign: 'right' }]}>
                {translate('RECORDING...', language)} {formatTime(time)}
            </Text>
        </View>
    );
};

export default function CommunityScreen() {
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    const themeDark = settings.themeDark;
    
    const isRTL = language === 'ur' || language === 'pa' || language === 'ps';
    const textAlignmentStyle = { textAlign: isRTL ? 'right' : 'left' };

    const [messages, setMessages] = useState([
        { id: '1', textKey: 'Farmer_Ali_Msg', sender: 'other', usernameKey: 'Farmer Ali' },
        { id: '2', textKey: 'Farmer_Ahmed_Msg', sender: 'user', usernameKey: 'You' }
    ]);
    
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const intervalRef = useRef(null);

    // --- Image Picker Logic ---
    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        
        if (result.assets && result.assets.length > 0) {
            const newImgMsg = {
                id: Date.now().toString(),
                imageUri: result.assets[0].uri,
                sender: 'user',
                usernameKey: 'You',
                isImage: true
            };
            setMessages([newImgMsg, ...messages]);
        }
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([{ 
            id: Date.now().toString(), 
            text: input, 
            sender: 'user', 
            usernameKey: 'You' 
        }, ...messages]);
        setInput('');
    };

    const renderMessageItem = ({ item }) => {
        const isUser = item.sender === 'user';
        const username = item.usernameKey ? translate(item.usernameKey, language) : item.username;

        return (
            <View style={[
                styles.bubbleContainer, 
                { alignSelf: isUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start') }
            ]}>
                <View style={[
                    styles.bubble, 
                    isUser ? styles.userBubble : styles.otherBubble, 
                    { backgroundColor: isUser ? '#2e7d32' : (themeDark ? '#333' : '#fff') }
                ]}>
                    {!isUser && <Text style={[styles.usernameText, textAlignmentStyle]}>{username}</Text>}
                    
                    {item.isImage ? (
                        <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
                    ) : (
                        <Text style={[{ color: isUser ? '#fff' : (themeDark ? '#fff' : '#000') }, textAlignmentStyle]}>
                            {item.isVoice ? `${translate('Voice Note', language)} (${item.voiceDuration}s)` : (item.textKey ? translate(item.textKey, language) : item.text)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeDark ? '#121212' : '#f7f7f7' }]}>
            <FlatList
                inverted
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessageItem}
                contentContainerStyle={{ padding: 10 }}
            />

            <View style={[
                styles.inputRow, 
                { backgroundColor: themeDark ? '#1e1e1e' : '#fff', flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}>
                
                {/* Plus Button for Image */}
                {!isRecording && (
                    <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                        <Text style={styles.attachIcon}>+</Text>
                    </TouchableOpacity>
                )}

                {isRecording ? (
                    <RecordingIndicator time={recordingTime} language={language} />
                ) : (
                    <View style={[styles.textBox, { backgroundColor: themeDark ? '#333' : '#f6f6f6' }]}>
                        <TextInput
                            style={[styles.input, textAlignmentStyle, { color: themeDark ? '#fff' : '#000' }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder={translate('Type message...', language)}
                            placeholderTextColor="#777"
                        />
                    </View>
                )}

                {input.trim() ? (
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                        <Text style={styles.sendText}>{translate('SEND', language)}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.micBtn, isRecording && {backgroundColor: '#ffcdd2'}]} 
                        onLongPress={() => setIsRecording(true)} 
                        onPressOut={() => setIsRecording(false)}
                    >
                        <Text style={styles.micIconText}>{isRecording ? '⏹️' : '🎙️'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bubbleContainer: { marginVertical: 5, maxWidth: '85%' },
    bubble: { padding: 10, borderRadius: 15, minWidth: 60 },
    otherBubble: { borderWidth: 1, borderColor: '#ddd' },
    userBubble: { backgroundColor: '#2e7d32' },
    messageImage: { width: 200, height: 200, borderRadius: 10, marginTop: 5 },
    usernameText: { fontWeight: 'bold', marginBottom: 3, color: '#008CFF', fontSize: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderColor: '#ddd' },
    attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    attachIcon: { fontSize: 28, color: '#2e7d32', fontWeight: 'bold' },
    textBox: { flex: 1, borderRadius: 25, paddingHorizontal: 15, marginHorizontal: 5, height: 45, justifyContent: 'center' },
    input: { height: 40, fontSize: 15 },
    sendBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 20, height: 45, borderRadius: 22, justifyContent: 'center' },
    sendText: { color: '#fff', fontWeight: 'bold' },
    micBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center' },
    micIconText: { fontSize: 22 }
});

const recordingStyles = StyleSheet.create({
    indicatorContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE0E0', borderRadius: 25, paddingHorizontal: 15, height: 45 },
    redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F', marginHorizontal: 5 },
    recordingText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 13 }
});