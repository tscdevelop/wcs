let currentLanguage = 'en'; // ค่าเริ่มต้น

export function setLanguage(language: string) {
    currentLanguage = language;
}

export function getLanguage() {
    return currentLanguage;
}
