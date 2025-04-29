import axios from 'axios';

export const translateText = async (text: string, targetLanguage: string) => {
  try {
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: 'en',
      target: targetLanguage,
      format: 'text'
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // fallback to original text if translation fails
  }
};
