import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    // Check google translate cookie
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match && match[2] === '/fr/en') {
      setLang('en');
    } else {
      setLang('fr');
    }
  }, []);

  const changeLanguage = (lng: string) => {
    if (lng === 'en') {
      document.cookie = 'googtrans=/fr/en; path=/';
      document.cookie = 'googtrans=/fr/en; domain=' + window.location.hostname + '; path=/';
    } else {
      document.cookie = 'googtrans=/fr/fr; path=/';
      document.cookie = 'googtrans=/fr/fr; domain=' + window.location.hostname + '; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
    }
    window.location.reload();
  };

  return (
    <div className="relative group z-50">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-light text-sm font-medium hover:bg-surface transition-colors">
        <Globe className="w-4 h-4" />
        {lang === 'fr' ? 'FR' : 'EN'}
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-border-light py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button 
          onClick={() => changeLanguage('fr')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-surface ${lang === 'fr' ? 'font-bold text-accent' : 'text-text-primary'}`}
        >
          Français (FR)
        </button>
        <button 
          onClick={() => changeLanguage('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-surface ${lang === 'en' ? 'font-bold text-accent' : 'text-text-primary'}`}
        >
          English (EN)
        </button>
      </div>
    </div>
  );
}
