/**
 * ChatbotScreen.js — GROQ + NATIVE ANDROID SPEECH (NO LIBRARY NEEDED)
 * FYP: AI Based Model for Fertilizer Deficiency Monitoring
 * PMAS-Arid Agriculture University, Rawalpindi
 */

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';

import axios from 'axios';
import { SettingsContext } from '../context/SettingsContext';

// =============================================================================
// GROQ API CONFIG
// =============================================================================
const GROQ_API_KEY = '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';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

// =============================================================================
// SAFE TTS WRAPPER
// =============================================================================
let _tts = null;
const getTts = () => {
  if (_tts) return _tts;
  try {
    const m = require('react-native-tts').default;
    if (m && typeof m.speak === 'function') _tts = m;
  } catch (e) {}
  return _tts;
};

const SafeTts = {
  init:        ()    => { try { getTts()?.setDefaultRate(0.48); getTts()?.setDefaultPitch(1.0); } catch (e) {} },
  setLanguage: (l)   => { try { getTts()?.setDefaultLanguage(l); } catch (e) {} },
  speak:       (t)   => { try { getTts()?.stop(); getTts()?.speak(t); } catch (e) {} },
  stop:        ()    => { try { getTts()?.stop(); } catch (e) {} },
  addListener: (e,c) => { try { return getTts()?.addEventListener(e,c) ?? null; } catch (_) { return null; } },
};

// =============================================================================
// LANGUAGE CONFIG
// =============================================================================
const VOICE_LOCALE = {
  'English': 'en-US',
  'اردو':    'ur-PK',
  'پنجابی':  'pa-IN',
  'پشتو':    'ps-AF',
};

const TTS_LOCALE = {
  'English': 'en-US',
  'اردو':    'ur-PK',
  'پنجابی':  'pa-IN',
  'پشتو':    'ps-AF',
};

// =============================================================================
// WELCOME MESSAGES
// =============================================================================
const WELCOME = {
  'English': '👋 Assalam-o-Alaikum!\nI am your Fertilizer AI Assistant.\n\nAsk me about:\n🌱 Fertilizer deficiency\n🌾 Crop diseases\n💧 Soil health\n🔬 Farming tips\n\n🎙️ Mic for voice  •  ⌨️ Type below',
  'اردو':    '👋 السلام علیکم!\nمیں آپ کا کھاد AI معاون ہوں۔\n\nمجھ سے پوچھیں:\n🌱 کھاد کی کمی\n🌾 فصلوں کی بیماریاں\n💧 مٹی کی صحت\n🔬 زراعت کی تجاویز\n\n🎙️ آواز کے لیے مائیک  •  ⌨️ نیچے لکھیں',
  'پنجابی':  '👋 السلام علیکم!\nمیں تہاڈا کھاد AI معاون ہاں۔\n\nمینوں پچھو:\n🌱 کھاد دی کمی\n🌾 فصلاں دیاں بیماریاں\n💧 مٹی دی صحت\n🔬 کاشتکاری دیاں صلاحاں\n\n🎙️ آواز لئی مائیک  •  ⌨️ تھلے لکھو',
  'پشتو':    '👋 السلام علیکم!\nزه ستاسو د سرو AI مرستندویه یم۔\n\nله ما پوښتنه وکړئ:\n🌱 د سرو کمښت\n🌾 د فصل ناروغۍ\n💧 د خاورو روغتیا\n🔬 د کرنې لارښوونې\n\n🎙️ د غږ لپاره مایک  •  ⌨️ لاندې ولیکئ',
};

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================
const SYSTEM_PROMPTS = {
  'English': `You are an expert agricultural AI assistant for Pakistani farmers.
IMPORTANT: Always reply ONLY in English. Never switch languages.
Specialize in: fertilizer deficiency, crop diseases, soil health, farming tips for Pakistan.
Be concise and practical. Keep answers under 150 words.`,

  'اردو': `آپ پاکستانی کسانوں کے لیے ایک ماہر زرعی AI معاون ہیں۔
اہم: ہمیشہ صرف اردو زبان میں جواب دیں۔
مہارت: کھاد کی کمی، فصلوں کی بیماریاں، مٹی کی صحت، زراعت کی تجاویز۔
مختصر اور عملی رہیں۔`,

  'پنجابی': `تسیں پاکستانی کسانوں لئی اک ماہر زرعی AI معاون ہو۔
ضروری: ہمیشہ صرف پنجابی وچ جواب دیو۔
مہارت: کھاد دی کمی، فصلاں دیاں بیماریاں، مٹی دی صحت۔`,

  'پشتو': `تاسې د پاکستاني بزګرانو لپاره یو متخصص زرعي AI مرستندویه یاست.
مهم: تل یوازې پښتو ژبه کې ځواب ورکړئ.
تخصص: د سرې کمښت، د فصل ناروغۍ، د خاورو روغتیا.`,
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================
const ERROR_MSGS = {
  'English': '⚠️ Could not get response.\nPlease check internet and try again.',
  'اردو':    '⚠️ جواب نہیں ملا۔\nانٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔',
  'پنجابی':  '⚠️ جواب نہیں ملیا۔\nانٹرنیٹ چیک کرو تے دوبارہ کوشش کرو۔',
  'پشتو':    '⚠️ ځواب ونه موندل شو۔\nانټرنیټ وګورئ او بیا هڅه وکړئ۔',
};

// =============================================================================
// GROQ API CALL
// =============================================================================
const fetchGroqResponse = async (userMessage, language) => {
  const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS['English'];
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model:    GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage   },
        ],
        temperature: 0.7,
        max_tokens:  400,
        stream:      false,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type':  'application/json',
        },
        timeout: 60000,
      },
    );
    const text = response?.data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (apiError) {
    const status = apiError?.response?.status;
    const code   = apiError?.code;
    if (status === 401) throw new Error('API_KEY_INVALID');
    if (status === 429) throw new Error('RATE_LIMIT');
    if (status === 400) throw new Error('BAD_REQUEST');
    if (code === 'ECONNABORTED') throw new Error('TIMEOUT');
    if (code === 'ERR_NETWORK' || code === 'ENOTFOUND') throw new Error('NO_INTERNET');
    throw apiError;
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function ChatbotScreen() {
  const { settings } = useContext(SettingsContext);
  const language     = settings?.language || 'English';
  const isRTL        = language !== 'English';

  const [messages,       setMessages]       = useState([{
    id: 'init', text: WELCOME[language] || WELCOME['English'], sender: 'bot',
  }]);
  const [input,          setInput]          = useState('');
  const [isRecording,    setIsRecording]    = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isSpeaking,     setIsSpeaking]     = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef    = useRef(null);
  const sendMessageRef = useRef(null);

  // ── KEYBOARD LISTENER ─────────────────────────────────────────────────────
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── TTS INIT ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      SafeTts.init();
      SafeTts.setLanguage(TTS_LOCALE[language] || 'en-US');
    }, 800);
    const l1 = SafeTts.addListener('tts-start',  () => setIsSpeaking(true));
    const l2 = SafeTts.addListener('tts-finish', () => setIsSpeaking(false));
    const l3 = SafeTts.addListener('tts-cancel', () => setIsSpeaking(false));
    const l4 = SafeTts.addListener('tts-error',  () => setIsSpeaking(false));
    return () => {
      clearTimeout(t);
      l1?.remove?.(); l2?.remove?.(); l3?.remove?.(); l4?.remove?.();
      SafeTts.stop();
    };
  }, [language]);

  // ── SPEECH RECOGNITION via DeviceEventEmitter ─────────────────────────────
  useEffect(() => {
    const resultSub = DeviceEventEmitter.addListener('SpeechRecognitionResult', (event) => {
      setIsRecording(false);
      if (event?.text?.trim()) {
        const spoken = event.text.trim();
        setInput(spoken);
        sendMessageRef.current?.(spoken, true);
      }
    });
    const errorSub = DeviceEventEmitter.addListener('SpeechRecognitionError', (event) => {
      setIsRecording(false);
      console.log('[Speech] Error:', event?.error);
    });
    return () => { resultSub.remove(); errorSub.remove(); };
  }, []);

  // ── MIC PERMISSION ────────────────────────────────────────────────────────
  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        { title: 'Mic Permission', message: 'Needed for voice input.', buttonPositive: 'Allow' },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  // ── START RECORDING ───────────────────────────────────────────────────────
  const startRecording = async () => {
    if (isLoading) return;
    const granted = await requestMicPermission();
    if (!granted) {
      Alert.alert('Permission Required', 'Allow microphone in Settings → Apps → Permissions → Microphone');
      return;
    }
    try {
      SafeTts.stop();
      setIsSpeaking(false);
      setInput('');
      setIsRecording(true);

      const SpeechModule = NativeModules.SpeechRecognitionModule;
      const locale = VOICE_LOCALE[language] || 'en-US';

      if (SpeechModule?.startSpeechRecognition) {
        SpeechModule.startSpeechRecognition(locale);
      } else {
        // Fallback: use Android Intent via NativeModules
        NativeModules.SpeechIntent?.startListening?.(locale);
        setTimeout(() => {
          if (isRecording) setIsRecording(false);
        }, 10000);
      }
    } catch (e) {
      setIsRecording(false);
      Alert.alert('Mic Error', `${e?.message || 'Unknown error'}\n\nPlease type your question.`);
    }
  };

  // ── STOP RECORDING ────────────────────────────────────────────────────────
  const stopRecording = () => {
    try {
      NativeModules.SpeechRecognitionModule?.stopSpeechRecognition?.();
      NativeModules.SpeechIntent?.stopListening?.();
    } catch (_) {}
    setIsRecording(false);
  };

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (msgText = null, isVoiceInput = false) => {
    const text = (msgText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, {
      id:      `u_${Date.now()}`,
      text:    isVoiceInput ? `🎙️ ${text}` : text,
      sender:  'user',
      isVoice: isVoiceInput,
    }]);
    setIsLoading(true);

    try {
      const reply = await fetchGroqResponse(text, language);
      setMessages(prev => [...prev, {
        id:      `b_${Date.now()}`,
        text:    reply,
        sender:  'bot',
        isVoice: isVoiceInput,
      }]);

      if (isVoiceInput) {
        SafeTts.setLanguage(TTS_LOCALE[language] || 'en-US');
        SafeTts.speak(reply);
      }

    } catch (apiError) {
      const errMsg = apiError?.message || '';
      let errorText = ERROR_MSGS[language] || ERROR_MSGS['English'];
      if (errMsg === 'API_KEY_INVALID') errorText = '❌ API Key Invalid. Get new key from console.groq.com';
      else if (errMsg === 'RATE_LIMIT')  errorText = '⏳ Rate limit. Wait 1 minute and try again.';
      else if (errMsg === 'TIMEOUT')     errorText = '⏱️ Timeout. Check internet speed.';
      else if (errMsg === 'NO_INTERNET') errorText = '📵 No internet. Connect WiFi or mobile data.';

      setMessages(prev => [...prev, {
        id: `e_${Date.now()}`, text: errorText, sender: 'bot', isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, language]);

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  // ── AUTO SCROLL ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    return () => clearTimeout(t);
  }, [messages]);

  // ── RENDER BUBBLE ─────────────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[S.row, isBot ? S.rowL : S.rowR]}>
        {isBot && <View style={S.avBot}><Text style={S.avEmoji}>🌿</Text></View>}
        <View style={[S.bubble, isBot ? S.bBot : S.bUser, item.isError && S.bErr]}>
          {item.isVoice && isBot && (
            <View style={S.voiceTag}>
              <Text style={S.voiceTagTxt}>🔊 {language === 'English' ? 'Voice Reply' : 'آواز جواب'}</Text>
            </View>
          )}
          <Text style={[S.bTxt, isBot ? S.tBot : S.tUser, isRTL && S.tRTL]}>{item.text}</Text>
        </View>
        {!isBot && <View style={S.avUser}><Text style={S.avEmoji}>👨‍🌾</Text></View>}
      </View>
    );
  };

  const renderTyping = () => (
    <View style={[S.row, S.rowL]}>
      <View style={S.avBot}><Text style={S.avEmoji}>🌿</Text></View>
      <View style={[S.bubble, S.bBot, { flexDirection: 'row', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color="#fff" />
        <Text style={[S.tBot, { marginLeft: 8, fontSize: 13 }]}>
          {language === 'English' ? 'Thinking...' : language === 'اردو' ? 'سوچ رہا ہوں...' : 'سوچ رہا ہاں...'}
        </Text>
      </View>
    </View>
  );

  const placeholder =
    language === 'English' ? 'Type your question...'
    : language === 'اردو'  ? 'سوال لکھیں...'
    : language === 'پنجابی'? 'سوال لکھو...'
    :                         'پوښتنه ولیکئ...';

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.safe}>
      <View style={[S.container, { paddingBottom: keyboardHeight }]}>

        <View style={S.header}>
          <View style={S.hRow}>
            <Text style={S.hIcon}>🌾</Text>
            <Text style={S.hTitle}>
              {language === 'English' ? 'Fertilizer AI Assistant'
                : language === 'اردو' ? 'کھاد AI معاون'
                : language === 'پنجابی' ? 'کھاد AI معاون'
                : 'د سرو AI مرستندویه'}
            </Text>
          </View>
          <Text style={S.hSub}>
            {language === 'English' ? '🎙️ Voice  •  ⌨️ Text  •  4 Languages'
              : language === 'اردو' ? '🎙️ آواز  •  ⌨️ متن  •  4 زبانیں'
              : language === 'پنجابی' ? '🎙️ آواز  •  ⌨️ لکھت  •  4 بولیاں'
              : '🎙️ غږ  •  ⌨️ متن  •  4 ژبې'}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={i => i.id}
          renderItem={renderMessage}
          contentContainerStyle={S.list}
          ListFooterComponent={isLoading ? renderTyping : null}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        {isSpeaking && (
          <TouchableOpacity style={S.speakBar} onPress={() => { SafeTts.stop(); setIsSpeaking(false); }} activeOpacity={0.8}>
            <Text style={S.speakTxt}>🔊 {language === 'English' ? 'Speaking... Tap to stop' : 'بول رہا ہوں... روکنے کے لیے ٹپ کریں'}</Text>
          </TouchableOpacity>
        )}

        {isRecording && (
          <View style={S.recBar}>
            <View style={S.recDot} />
            <Text style={S.recTxt}>
              {language === 'English' ? '🎙️ Listening... Tap stop when done'
                : language === 'اردو' ? '🎙️ سن رہا ہوں... بات کریں'
                : language === 'پنجابی' ? '🎙️ سن رہا ہاں... ہُن بولو'
                : '🎙️ اوریدل کوم... اوس وغږیږئ'}
            </Text>
          </View>
        )}

        <View style={[S.inputRow, isRTL && S.inputRowRTL]}>
          <TextInput
            style={[S.input, isRTL && S.inputRTL]}
            value={input}
            onChangeText={setInput}
            placeholder={placeholder}
            placeholderTextColor="#888"
            onSubmitEditing={() => sendMessage(null, false)}
            returnKeyType="send"
            editable={!isLoading && !isRecording}
            textAlign={isRTL ? 'right' : 'left'}
            autoCorrect={false}
            blurOnSubmit={false}
          />

          {input.trim().length > 0 && !isRecording && (
            <TouchableOpacity style={[S.btnSend, isLoading && S.btnOff]} onPress={() => sendMessage(null, false)} disabled={isLoading} activeOpacity={0.8}>
              <Text style={S.btnIco}>➤</Text>
            </TouchableOpacity>
          )}

          {isRecording ? (
            <TouchableOpacity style={S.btnStop} onPress={stopRecording} activeOpacity={0.8}>
              <Text style={S.btnIco}>⏹</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[S.btnMic, isLoading && S.btnOff]} onPress={startRecording} disabled={isLoading} activeOpacity={0.8}>
              <Text style={{ fontSize: 22 }}>🎙️</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================
const C = {
  green: '#2e7d32', gDark: '#1b5e20', gLight: '#e8f5e9',
  gBorder: '#c8e6c9', gText: '#a5d6a7', accent: '#66bb6a',
  white: '#ffffff', bg: '#f1f8e9', dark: '#1a1a1a',
  red: '#f44336', rDark: '#c62828', cream: '#fff8e1',
};

const S = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.gDark },
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.gDark, paddingTop: 14, paddingBottom: 12,
    paddingHorizontal: 20, alignItems: 'center', elevation: 6,
  },
  hRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hIcon:  { fontSize: 22, marginRight: 8 },
  hTitle: { color: C.white, fontSize: 18, fontWeight: '700' },
  hSub:   { color: C.gText, fontSize: 12 },
  list:   { paddingVertical: 14, paddingHorizontal: 10, paddingBottom: 8 },
  row:    { flexDirection: 'row', marginVertical: 5, alignItems: 'flex-end', paddingHorizontal: 2 },
  rowL:   { alignSelf: 'flex-start' },
  rowR:   { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avBot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.gLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2, borderWidth: 1.5, borderColor: C.gBorder,
  },
  avUser: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.cream,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8, marginBottom: 2, borderWidth: 1.5, borderColor: '#ffe082',
  },
  avEmoji: { fontSize: 18 },
  bubble: {
    maxWidth: '75%', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 20, elevation: 2,
  },
  bBot:  { backgroundColor: C.green, borderBottomLeftRadius: 4 },
  bUser: { backgroundColor: C.white, borderBottomRightRadius: 4, borderWidth: 1, borderColor: C.gBorder },
  bErr:  { backgroundColor: C.rDark, borderBottomLeftRadius: 4 },
  bTxt:  { fontSize: 14.5, lineHeight: 23 },
  tBot:  { color: C.white },
  tUser: { color: '#111111' },
  tRTL:  { textAlign: 'right', writingDirection: 'rtl' },
  voiceTag:    { marginBottom: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.25)' },
  voiceTagTxt: { color: '#c8e6c9', fontSize: 11, fontWeight: '600' },
  speakBar: { backgroundColor: C.accent, paddingVertical: 10, alignItems: 'center' },
  speakTxt: { color: C.white, fontSize: 13, fontWeight: '600' },
  recBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffebee', paddingVertical: 9,
    borderTopWidth: 1, borderTopColor: '#ffcdd2',
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red, marginRight: 8 },
  recTxt: { color: C.rDark, fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: C.white, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: C.gBorder, elevation: 8,
  },
  inputRowRTL: { flexDirection: 'row-reverse' },
  input: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15, color: '#111111',
    borderWidth: 1.5, borderColor: C.gBorder,
  },
  inputRTL: { textAlign: 'right' },
  btnSend: {
    marginLeft: 8, backgroundColor: C.green,
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  btnMic: {
    marginLeft: 8, backgroundColor: C.green,
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.gDark, elevation: 4,
  },
  btnStop: {
    marginLeft: 8, backgroundColor: C.red,
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  btnIco: { color: C.white, fontSize: 18 },
  btnOff: { opacity: 0.4 },
});