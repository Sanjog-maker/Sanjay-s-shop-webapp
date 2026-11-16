import { StoreDb } from '../data/store';
import { VoiceParseResponse, ParsedVoiceItem, Product } from '../../src/types/index';
import { parseVoiceBilling } from './gemini';

export const voiceService = {
  /**
   * Service interface for parsing speech-to-text inputs into structured cart items.
   * Eventual pipeline: Speech -> Speech-to-text -> Product/quantity extraction -> Catalog matching -> Cart.
   */
  async parseVoiceBillingInput(transcript: string, language: string = 'en-IN'): Promise<VoiceParseResponse> {
    const products = StoreDb.getProducts();

    // If Gemini is available, use LLM-based smart parser
    if (process.env.GEMINI_API_KEY) {
      try {
        return await parseVoiceBilling(transcript, language, products);
      } catch (err) {
        console.warn('Gemini voice parsing failed, using deterministic Kirana fuzzy matcher:', err);
      }
    }

    // Deterministic rule-based multilingual parser for Kirana groceries
    const parsedItems: ParsedVoiceItem[] = [];
    const unrecognizedPhrases: string[] = [];

    // Tamil & English number dictionaries
    const numWords: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'ஒரு': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5, 'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
    };

    // Split transcript by common conjunctions (and, comma, மற்றும், +, plus)
    const clauses = transcript.split(/,|\band\b|\bமற்றும்\b|\bplus\b|\+/i);

    for (const clause of clauses) {
      const clean = clause.trim();
      if (!clean) continue;

      let extractedQty = 1;
      let matchedProduct: Product | undefined = undefined;

      // Extract number if present
      const tokens = clean.toLowerCase().split(/\s+/);
      for (const token of tokens) {
        if (numWords[token] !== undefined) {
          extractedQty = numWords[token];
          break;
        } else {
          const parsedNum = parseInt(token, 10);
          if (!isNaN(parsedNum) && parsedNum > 0) {
            extractedQty = parsedNum;
            break;
          }
        }
      }

      // Check for matching product in catalog
      for (const prod of products) {
        const prodNameLower = prod.name.toLowerCase();
        const brandLower = prod.brand.toLowerCase();
        const regionalLower = (prod.regionalName || '').toLowerCase();
        const searchPhrase = clean.toLowerCase();

        if (
          searchPhrase.includes(prodNameLower) ||
          prodNameLower.split(' ').some((w) => w.length > 3 && searchPhrase.includes(w)) ||
          searchPhrase.includes(brandLower) ||
          (regionalLower && regionalLower.split(' ').some((rw) => rw.length > 3 && searchPhrase.includes(rw)))
        ) {
          matchedProduct = prod;
          break;
        }
      }

      if (matchedProduct) {
        parsedItems.push({
          rawText: clean,
          matchedProductId: matchedProduct.id,
          matchedProduct,
          productName: matchedProduct.name,
          quantity: extractedQty,
          unit: matchedProduct.unit,
          confidence: 0.95,
          isCustomItem: false
        });
      } else {
        // Create custom item placeholder
        parsedItems.push({
          rawText: clean,
          productName: clean.replace(/^[0-9]+(\s*kg|\s*g|\s*l)?\s*/i, '').trim(),
          quantity: extractedQty,
          unit: 'packet',
          confidence: 0.7,
          isCustomItem: true
        });
      }
    }

    return {
      success: true,
      transcript,
      language,
      parsedItems,
      unrecognizedPhrases,
      suggestedAction: 'Review items and click Add to Bill'
    };
  }
};
