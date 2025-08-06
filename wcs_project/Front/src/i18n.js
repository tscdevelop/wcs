import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import thTranslation from "./locales/th/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  th: {
    translation: thTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "th", // ภาษาเริ่มต้น
  interpolation: {
    escapeValue: false, // React เองจัดการเรื่องนี้อยู่แล้ว
  },
});

export default i18n;
