import React, { useState } from 'react';
import { Search, Book } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Resource } from '../types';

// Deterministic transliteration of Sinhala unicode characters directly to standard Singlish text representation
export function sinhalaToSinglish(text: string): string {
  const consonantMap: { [key: string]: string } = {
    'ක': 'k', 'ඛ': 'k', 'ග': 'g', 'ඝ': 'g', 'ඞ': 'n', 'ඟ': 'ng',
    'ච': 'ch', 'ඡ': 'ch', 'ජ': 'j', 'ඣ': 'j', 'ඤ': 'n', 'ඥ': 'gn',
    'ට': 't', 'ඨ': 't', 'ඩ': 'd', 'ඪ': 'd', 'ණ': 'n', 'ඬ': 'nd',
    'ත': 't', 'ථ': 'th', 'ද': 'd', 'ධ': 'dh', 'න': 'n', 'ඳ': 'nd',
    'ප': 'p', 'ඵ': 'p', 'බ': 'b', 'භ': 'b', 'ම': 'm', 'ඹ': 'mb',
    'ය': 'y', 'ර': 'r', 'ල': 'l', 'ළ': 'l', 'ව': 'w', 'ශ': 'sh', 
    'ෂ': 'sh', 'ස': 's', 'හ': 'h', 'ෆ': 'f'
  };

  const vowelStrokeMap: { [key: string]: string } = {
    'ා': 'a', 'ැ': 'ae', 'ෑ': 'ae', 'ි': 'i', 'ී': 'i', 'ු': 'u', 'ූ': 'u',
    'ෘ': 'ru', 'ෙ': 'e', 'ේ': 'e', 'ෛ': 'ei', 'ො': 'o', 'ෝ': 'o', 'ෞ': 'ou'
  };

  const independentVowelMap: { [key: string]: string } = {
    'අ': 'a', 'ආ': 'a', 'ඇ': 'ae', 'ඈ': 'ae', 'ඉ': 'i', 'ඊ': 'i',
    'උ': 'u', 'ඌ': 'u', 'එ': 'e', 'ඒ': 'e', 'ඓ': 'ei', 'ඔ': 'o', 'ඕ': 'o', 'ඖ': 'ou'
  };

  let result = '';
  const len = text.length;
  
  for (let i = 0; i < len; i++) {
    const char = text[i];
    
    // Check if it's an independent vowel
    if (independentVowelMap[char]) {
      result += independentVowelMap[char];
      continue;
    }
    
    // Check if it's a consonant
    if (consonantMap[char]) {
      let mapped = consonantMap[char];
      
      let hasModifier = false;
      let isSuppressed = false;
      
      let nextIdx = i + 1;
      // Skip zero-width joiner characters
      while (nextIdx < len && (text[nextIdx] === '\u200D' || text[nextIdx] === '\u200C')) {
        nextIdx++;
      }
      
      if (nextIdx < len) {
        const nextChar = text[nextIdx];
        if (nextChar === '්') {
          isSuppressed = true;
          i = nextIdx; // advance past hal kirima
        } else if (vowelStrokeMap[nextChar]) {
          mapped += vowelStrokeMap[nextChar];
          i = nextIdx; // advance past vowel stroke
          hasModifier = true;
        }
      }
      
      // If no modifier and not suppressed, add inherent 'a' sound
      if (!hasModifier && !isSuppressed) {
        mapped += 'a';
      }
      
      result += mapped;
      continue;
    }
    
    // Ignore standalone modifier/joining characters directly
    if (char === '්' || char === '\u200D' || char === '\u200C' || vowelStrokeMap[char]) {
      continue;
    }
    
    // Pass other letters through directly
    result += char;
  }
  
  return result;
}

// Normalize Singlish & English terms phonetically to maximize lookup robustness
export function normalizePhonetic(input: string): string {
  // Translate Sinhala characters to raw representation first
  let str = sinhalaToSinglish(input).toLowerCase();
  
  // Standardize common phonetic digraphs to single base characters
  str = str
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/ph/g, 'f')
    .replace(/bh/g, 'b')
    .replace(/gh/g, 'g')
    .replace(/ch/g, 'c')
    .replace(/jh/g, 'j')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ae/g, 'a')
    .replace(/ks/g, 'x')
    .replace(/v/g, 'w')
    .replace(/y/g, 'i')
    .replace(/o/g, 'u')
    // Remove non-alphanumeric details
    .replace(/[^a-z0-9\s]/g, '')
    // Deduplicate letters (e.g., 'dd' -> 'd', 'tt' -> 't')
    .replace(/([a-z])\1+/g, '$1');
    
  return str.trim();
}

export function renderHighlightedText(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery.trim()) return text;
  
  const rawTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
  if (rawTerms.length === 0) return text;
  
  const normalizedTerms = rawTerms.map(t => normalizePhonetic(t));

  // Regex to split text into words and keep delimiters (spaces, punctuation, etc.)
  // We match sequences of Sinhala/alphanumeric characters as words, and others as delimiters
  const tokens = text.split(/([\u0D80-\u0DFFa-zA-Z0-9]+)/g);

  return (
    <>
      {tokens.map((token, idx) => {
        if (!token) return null;
        
        // Check if the token is a word/character sequence (not just spaces/punctuation)
        const isWord = /[\u0D80-\u0DFFa-zA-Z0-9]/.test(token);
        if (!isWord) {
          return token;
        }

        const tokenLower = token.toLowerCase();
        const tokenPhonetic = normalizePhonetic(token);

        // Check if token matches any search terms (either raw substring or phonetically)
        const isMatched = rawTerms.some(term => tokenLower.includes(term)) || 
                          normalizedTerms.some(nTerm => tokenPhonetic.includes(nTerm) || nTerm.includes(tokenPhonetic));

        if (isMatched) {
          return (
            <mark 
              key={idx} 
              className="bg-yellow-400/40 text-white font-semibold px-0.5 py-px rounded"
            >
              {token}
            </mark>
          );
        }

        return token;
      })}
    </>
  );
}

export default function ResourceBookSearch() {
  const { resources } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Resource[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const rawQuery = searchQuery.toLowerCase().trim();
    const queryNormalized = normalizePhonetic(rawQuery);
    const queryTerms = queryNormalized.split(/\s+/).filter(t => t.length > 0);

    const filteredResults = resources.filter(item => {
      // 1. Exact or clear substring matching on raw/Sinhala script
      const matchRawText = item.textContent.toLowerCase().includes(rawQuery);
      const matchRawUnit = item.unit.toLowerCase().includes(rawQuery);
      const matchRawTopic = item.topic && item.topic.toLowerCase().includes(rawQuery);
      const matchRawSubtopic = item.subtopic && item.subtopic.toLowerCase().includes(rawQuery);
      const matchRawTags = item.searchTags && item.searchTags.toLowerCase().includes(rawQuery);

      if (matchRawText || matchRawUnit || matchRawTopic || matchRawSubtopic || matchRawTags) {
         return true;
      }

      // 2. High performance phonetic / Singlish match
      const contentPhonetic = normalizePhonetic(item.textContent);
      const unitPhonetic = normalizePhonetic(item.unit);
      const topicPhonetic = item.topic ? normalizePhonetic(item.topic) : '';
      const subtopicPhonetic = item.subtopic ? normalizePhonetic(item.subtopic) : '';
      const tagsPhonetic = item.searchTags ? normalizePhonetic(item.searchTags) : '';

      // Check if all query terms are matched in any of the resource's phonetic forms
      const matchPhoneticCombined = queryTerms.every(term => 
          contentPhonetic.includes(term) ||
          unitPhonetic.includes(term) ||
          topicPhonetic.includes(term) ||
          subtopicPhonetic.includes(term) ||
          tagsPhonetic.includes(term)
      );

      return matchPhoneticCombined;
    });
    
    setResults(filteredResults);
    setHasSearched(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Book className="w-6 h-6 text-[#00a2ff]" /> Resource Book Search
        </h2>
        <p className="text-slate-400 font-medium">Search through the uploaded PDF &amp; Resources in English, Sinhala, or Singlish</p>
      </div>

      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sinhala, English or සිංග්ලිෂ් (e.g. pataka, paddhatiya) වලින් සොයන්න..."
          className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a2ff] focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 px-6 py-2 bg-[#00a2ff] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {hasSearched && (
        <div className="mt-8 space-y-4">
          {results.length > 0 ? (
            results.map((item) => (
              <div key={item.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span className="bg-white/5 px-2 py-1 rounded text-blue-400">{item.subject}</span>
                  <span className="bg-white/5 px-2 py-1 rounded text-purple-400">{renderHighlightedText(item.unit, searchQuery)}</span>
                  {item.topic && <span className="bg-white/5 px-2 py-1 rounded text-green-400">{renderHighlightedText(item.topic, searchQuery)}</span>}
                  {item.subtopic && <span className="bg-white/5 px-2 py-1 rounded text-yellow-400">{renderHighlightedText(item.subtopic, searchQuery)}</span>}
                </div>
                <p className="text-slate-200 leading-relaxed text-lg whitespace-pre-wrap">{renderHighlightedText(item.textContent, searchQuery)}</p>
                {item.page && (
                  <div className="text-sm font-medium text-slate-500 pt-2 border-t border-white/5">
                    Page {item.page}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-12 glass-panel rounded-2xl border border-white/10">
              <Book className="w-16 h-16 mx-auto mb-4 text-slate-600 opacity-50" />
              <p className="text-xl font-medium text-red-400">මේක Resource Book එකේ සඳහන් වෙලා නෑ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
