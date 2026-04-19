import { DEFAULT_LANGUAGE } from "../enums/language";

export const translate = (translations: Record<string, string> | null, language: string): string => {
    if (!translations) {
        return '';
    }
    if (translations[language]) {
        return translations[language];
    } else if (translations[DEFAULT_LANGUAGE]) {
        return translations[DEFAULT_LANGUAGE];
    } else {
        return '';
    }
}