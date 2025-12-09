import React from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../i18n";

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.language || "en").split("-")[0];

  const switchLanguage = (lang) => {
    if (lang !== currentLanguage) {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="hidden lg:inline-block font-medium">
        {t("common.language.toggleLabel")}
      </span>
      <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
        {supportedLanguages.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => switchLanguage(lang.value)}
            className={`px-2 py-1 rounded-full transition-all ${
              currentLanguage === lang.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageToggle;
