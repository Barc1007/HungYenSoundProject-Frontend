"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', label: 'English (US)' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', label: 'Tiếng Việt (VN)' },
];

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Get from localStorage or default to 'vi'
        if (typeof window !== 'undefined') {
            return localStorage.getItem('language') || 'vi';
        }
        return 'vi';
    });

    // Save to localStorage when language changes
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Translation function
    const t = (key) => {
        const translation = translations[language]?.[key];
        if (!translation) {
            console.warn(`Translation missing for key: ${key} in language: ${language}`);
            return translations['en']?.[key] || key;
        }
        return translation;
    };

    // Change language
    const changeLanguage = (langCode) => {
        if (LANGUAGES.find(l => l.code === langCode)) {
            setLanguage(langCode);
        }
    };

    // Get current language info
    const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[1];

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: changeLanguage,
            t,
            currentLanguage,
            languages: LANGUAGES
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
