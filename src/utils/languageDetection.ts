// A simplified, mock language detection utility for demonstration purposes.
// A real-world application would use a more robust library or a server-side API.

const languageKeywords: { [key: string]: RegExp } = {
    ne: /कहाँ|कसरी|जाने|हो/, // Nepali: Where|How|Go|Is
    es: /dónde|cómo|ir|es|a la/, // Spanish: Where|How|Go|Is|To the
    zh: /哪里|怎么|去|是/, // Chinese: Where|How|To go|Is
    ja: /どこ|どうやって|行く|ですか/, // Japanese: Where|How|Go|Is?
    hi: /कहाँ|कैसे|जाना|है/, // Hindi: Where|How|To go|Is
    fr: /où|comment|aller|est/, // French
    de: /wo|wie|gehen|ist/, // German
    ru: /где|как|идти|есть/, // Russian
};

// List of supported languages for detection to avoid false positives on unsupported ones
const supportedDetectionLangs = ['ne', 'es', 'zh', 'ja', 'hi', 'fr', 'de', 'ru', 'en'];

export const detectSpokenLanguage = (text: string): string | null => {
    for (const lang in languageKeywords) {
        if (languageKeywords[lang].test(text)) {
            if(supportedDetectionLangs.includes(lang)) {
                return lang;
            }
        }
    }
    // Basic check for common English words
    if (/\b(where|how|go|is|to|the)\b/i.test(text)) {
        return 'en';
    }
    return null;
};