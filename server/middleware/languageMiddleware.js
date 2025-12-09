import { supportedLanguages, translate } from "../utils/translator.js";

const normalizeLanguage = (header = "") => {
  const lang = header.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  return supportedLanguages.includes(lang) ? lang : "en";
};

export const languageMiddleware = (req, res, next) => {
  const headerLang = req.headers["accept-language"];
  const lang = normalizeLanguage(headerLang);
  req.language = lang;
  req.t = (key, vars) => translate(lang, key, vars);
  next();
};
