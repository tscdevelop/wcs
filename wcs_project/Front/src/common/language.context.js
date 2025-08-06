import i18n from "i18next";
import { GlobalVar } from "common/GlobalVar";

//let currentLanguage = 'en'; // ค่าเริ่มต้น
export function setLanguage(language) {
    //currentLanguage = language;
    GlobalVar.setLanguage(language);
    i18n.changeLanguage(language); // เปลี่ยนภาษาของ i18n
}

export function getLanguage() {
    return GlobalVar.getLanguage();
    //return currentLanguage;
}
