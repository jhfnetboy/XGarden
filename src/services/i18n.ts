import enMessages from '../locales/en.json';
import zhMessages from '../locales/zh.json';
import thMessages from '../locales/th.json';

export type Language = 'en' | 'zh' | 'th';

interface Messages {
  [key: string]: any;
}

const messages: Record<Language, Messages> = {
  en: enMessages,
  zh: zhMessages,
  th: thMessages
};

class I18nService {
  private currentLanguage: Language = 'en';

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    const saved = localStorage.getItem('xgarden-language') as Language;
    if (saved && messages[saved]) {
      this.currentLanguage = saved;
    } else {
      // 根据浏览器语言自动设置
      const browserLang = navigator.language.split('-')[0] as Language;
      if (messages[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
  }

  setLanguage(lang: Language) {
    if (messages[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('xgarden-language', lang);
    }
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  getAvailableLanguages(): Language[] {
    return Object.keys(messages) as Language[];
  }

  t(key: string, defaultValue: string = key): string {
    const keys = key.split('.');
    let value: any = messages[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  }
}

export const i18nService = new I18nService();
