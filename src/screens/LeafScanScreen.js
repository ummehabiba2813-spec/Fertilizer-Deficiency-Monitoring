// src/screens/LeafScanScreen.js
import React, { useState, useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { translate } from '../utils/lang.js';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, Dimensions,
    Platform, Alert, PermissionsAndroid
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const GREEN = '#2e7d32';

export default function LeafScanScreen({ navigation }) {
    // --- Context aur Language Setup ---
    const { settings } = useContext(SettingsContext);
    const language = settings.language;
    
    // --- RTL Check ---
    const isRTL = language === 'اردو' || language === 'پنجابی' || language === 'پشتو';
    const textAlignmentStyle = isRTL ? { textAlign: 'right', writingDirection: 'rtl' } : { textAlign: 'left', writingDirection: 'ltr' };
    const btnTextDirectionStyle = isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' }; // For icon + text button

    const [photo, setPhoto] = useState(null);

    // Unified Android permission for Camera + Storage
    const requestCameraAndStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const cameraGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    { title: translate("Camera Permission", language), message: translate("Camera access required", language), buttonPositive: translate("OK", language) }
                );

                const storageGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    { title: translate("Storage Permission", language), message: translate("Storage access required", language), buttonPositive: translate("OK", language) }
                );

                return cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
                       storageGranted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; 
    };

    // Open Camera
    const openCamera = async () => {
        const hasPerm = await requestCameraAndStoragePermission();
        if (!hasPerm) return;

        try {
            const response = await launchCamera({
                mediaType: 'photo',
                includeBase64: false,
                saveToPhotos: true,
                quality: 0.7,
            });

            if (!response || response.didCancel) return;

            if (response.errorCode) {
                return Alert.alert(translate("Camera Error", language), response.errorMessage || response.errorCode);
            }

            const asset = response.assets?.[0];
            if (!asset || !asset.uri) return Alert.alert(translate("Error", language), translate("No image captured.", language));

            setPhoto(asset);

        } catch (e) {
            console.log("Camera crash:", e);
            Alert.alert(translate("Camera crashed", language), String(e));
        }
    };

    // Pick image from Gallery
    const pickFromGallery = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
            }

            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.7,
                maxWidth: 1024,
                maxHeight: 1024,
                includeBase64: false,
            });

            if (!result || result.didCancel) return;

            const asset = result.assets?.[0];
            if (!asset || !asset.uri) return Alert.alert(translate('Error', language), translate('No image selected', language));

            let uri = asset.uri;
            if (Platform.OS === 'android' && !uri.startsWith('file://')) uri = 'file://' + uri;

            setPhoto({ ...asset, uri }); 

        } catch (e) {
            console.log('Gallery crash:', e);
            Alert.alert(translate('Gallery crashed', language), String(e));
        }
    };

    // Use Photo → navigate to Result (dummy)
    const usePhoto = () => {
        if (!photo) return;
        navigation.navigate('Result', { photoUri: photo.uri });
    };

    // Retake Photo → open gallery again
    const retakePhoto = () => {
        setPhoto(null);
        pickFromGallery(); // Retake button ab gallery/camera kholta hai
    };

    return (
        <View style={[styles.container, { paddingTop: 40 }]}>
            <View style={[styles.topText, textAlignmentStyle]}>
                <Text style={styles.header}>{translate("Leaf Scan", language)}</Text>
                <Text style={styles.small}>{translate("Place leaf clearly & choose capture or gallery", language)}</Text>
            </View>

            {!photo ? (
                <View style={styles.centerArea}>
                    <TouchableOpacity style={styles.openBtn} onPress={openCamera}>
                        <Text style={styles.openBtnText}>{translate("OPEN CAMERA", language)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.openBtn, { marginTop: 12 }]} onPress={pickFromGallery}>
                        <Text style={styles.openBtnText}>{translate("PICK FROM GALLERY", language)}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    {/* Show image picked from gallery */}
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                    <View style={styles.previewActions}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2e7d32' }]} onPress={retakePhoto}>
                            <Text style={{ color: '#fff' }}>{translate("Retake", language)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2e7d32' }, btnTextDirectionStyle]} onPress={usePhoto}>
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={{ color: '#fff', marginLeft: 8, marginRight: 8 }}>{translate("Show Result", language)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center' },
    topText: { position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center' },

    header: { fontSize: 26, fontWeight: '700' },
    small: { fontSize: 12, color: '#666' },

    centerArea: { alignItems: 'center' },
    openBtn: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8, marginBottom: 14, elevation: 3 },
    openBtnText: { color: '#fff', fontWeight: '700' },

    previewContainer: { alignItems: 'center' },
    previewImage: { width: width * 0.9, height: width * 0.6, borderRadius: 10, resizeMode: 'cover' },
    previewActions: { flexDirection: 'row', marginTop: 16, width: '80%', justifyContent: 'space-between' },
    actionBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row' },
});