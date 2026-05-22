import React, { useState } from 'react';
import { Contrast, Loader2, Copy, Check, Book, FileDown } from 'lucide-react';
import { askGemini } from '@/services/gemini';
import { cn, exportToPDF } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { saveHistory } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function AntonymFinderPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    
    const prompt = `Find antonyms (opposite words/lawan kata) for the English word: "${text}". 

Output Format:
### Common Antonyms:
[list common antonyms with Indonesian translation in brackets if applicable]

### Contextual Antonyms:
**[Context Name]**: [list antonyms for this specific context] - *Brief explanation of why it is the opposite in this context*.

### Usage nuances of Opposites:
[Briefly explain differences and guidelines when choosing which opposite word to use]`;

    const systemPrompt = "You are an expert linguist and thesaurus specializing in opposites and antonyms. Help users find perfect antonyms with context, clear explanations, and precise nuances.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);

    // Save to history
    if (user && output) {
      saveHistory({
        user_id: user.id,
        feature_type: 'antonym-finder',
        query_text: text,
        result_text: output
      });
    }
  };

  const handleExport = () => {
    if (result) {
      exportToPDF('result-content', `antonyms-${text.toLowerCase()}`);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-maroon/5 rounded-[24px] flex items-center justify-center text-maroon">
          <Contrast className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Antonym Finder</h1>
          <p className="text-clay/50 text-sm">Find the perfect opposite word (lawan kata) for any context</p>
        </div>
      </header>

      <div className="relative group">
        <div className="relative">
          <Contrast className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-clay/30 group-focus-within:text-maroon transition-colors" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="Search antonym (e.g., 'Generous')"
            className="w-full pl-16 pr-24 py-6 bg-cream/30 rounded-full border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all font-serif text-2xl"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-maroon text-cream px-8 py-3 rounded-full shadow-lg shadow-maroon/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Search"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] border border-clay/5 shadow-xl relative"
          >
            <div className="absolute top-8 right-8 flex gap-2">
              <button
                onClick={handleExport}
                className="p-3 rounded-xl hover:bg-clay/5 transition-colors text-clay/40 group relative"
                title="Export as PDF"
              >
                <FileDown className="w-5 h-5 group-hover:text-maroon transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-clay text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export PDF</span>
              </button>
              <button 
                onClick={copyToClipboard}
                className="p-3 rounded-xl hover:bg-clay/5 transition-colors text-clay/40 group font-sans"
                title="Copy result"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 group-hover:text-maroon transition-colors" />}
              </button>
            </div>
            
            <div id="result-content">
              <h2 className="text-5xl font-serif text-maroon mb-12 border-b border-maroon/5 pb-6">"{text}"</h2>
              
              <div className="markdown-body">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!result && !loading && (
        <div className="text-center py-20 opacity-20">
           <Book className="w-20 h-20 mx-auto mb-4" />
           <p className="font-serif italic text-xl">Opposites attract, and clarify.</p>
        </div>
      )}
    </div>
  );
}
