import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLanguage();

  return (
    <div id="language-switcher" className="inline-flex items-center bg-slate-100/90 backdrop-blur-sm p-1 rounded-full border border-slate-200/80 shadow-2xs">
      {!compact && <Globe className="w-4 h-4 text-emerald-700 ml-2 mr-1.5 hidden sm:block" />}
      <div className="flex items-center gap-1">
        {languages.map((l) => {
          const isActive = lang === l.code;
          return (
            <button
              key={l.code}
              id={`lang-btn-${l.code}`}
              onClick={() => setLang(l.code)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/50'
              }`}
              title={l.label}
            >
              <span className="mr-1">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
