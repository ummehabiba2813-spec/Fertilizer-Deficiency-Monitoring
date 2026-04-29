import translations from './translations.json';

export const translate = (key, language) => {
    // Language names ko codes mein convert karein
    const langMap = {
        'English': 'en',
        'اردو': 'ur',
        'پنجابی': 'pa',
        'پشتو': 'ps'
    };

    const langCode = langMap[language] || 'en';

    try {
        // 1. Check karein ke key us language mein hai?
        if (translations[langCode] && translations[langCode][key]) {
            return translations[langCode][key];
        }

        // 2. Fallback: Agar nahi mili to English wala word uthayen
        if (translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }

        // 3. Agar kuch bhi nahi mila to asli "key" wapis kar dein taake khali jagah na rahe
        return key;
    } catch (error) {
        return key; 
    }
};

export const supportedLanguages = ['English', 'اردو', 'پنجابی', 'پشتو'];