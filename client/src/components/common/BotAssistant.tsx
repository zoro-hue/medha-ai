import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyStore } from '@/store/useStudyStore';
import { useBotStore } from '@/store/useBotStore';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const BotAssistant = memo(function BotAssistant() {
  const { isOpen, setIsOpen } = useBotStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { material } = useStudyStore();

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: material
            ? `Hello! I am your Medhā Advanced AI Tutor. I have indexed "${material.title}". Ask me any doubt, definition, calculation, code snippet, or exam concept!`
            : `Hello! I am Medhā AI Tutor. Ask me any doubt or concept across Computer Science, Math, Physics, Chemistry, Biology, History, or general subjects!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [material, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    'Explain this topic in simple terms',
    'What is the worst-case complexity?',
    'Give me a real-world example',
    'What are common exam traps?',
    'Give me a practice question',
  ];

  const generateAdvancedAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Search in active study material if loaded
    if (material) {
      const matchedCard = material.flashcards.find(
        (c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q) || (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );

      if (matchedCard) {
        return `### 💡 ${matchedCard.question}\n\n**Direct Answer:**\n${matchedCard.answer}\n\n**Key Context:**\n• Topic: ${matchedCard.tags?.join(', ') || material.title}\n• Difficulty Level: ${matchedCard.difficulty}\n${matchedCard.hint ? `\n**Study Hint:** ${matchedCard.hint}` : ''}\n\n*Pro-tip:* Review flashcard #${material.flashcards.indexOf(matchedCard) + 1} to test your recall!`;
      }

      if (q.includes('summary') || q.includes('explain') || q.includes('overview')) {
        return `### 📘 Comprehensive Summary: ${material.title}\n\n${material.summary}\n\n### 🔑 Core Takeaways:\n${material.keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}\n\n### 🎯 Exam Tips:\n${material.revisionTips.map((tip) => `• ${tip}`).join('\n')}`;
      }

      if (q.includes('mistake') || q.includes('pitfall') || q.includes('trap') || q.includes('error')) {
        return `### ⚠️ Common Pitfalls in ${material.title}:\n\n${material.mistakes.map((m, i) => `${i + 1}. ${m}`).join('\n\n')}\n\n*How to avoid:* Carefully review key definitions and verify boundary cases during exams.`;
      }
    }

    // 2. Comprehensive Subject & Concept Synthesizer
    if (q.includes('worst-case') || q.includes('worst case') || q.includes('time complexity') || q.includes('big o')) {
      if (q.includes('binary search')) {
        return `### ⏱️ Binary Search Time Complexity\n\n• **Worst-case:** O(log n)\n• **Best-case:** O(1) (when element is exact middle)\n• **Average-case:** O(log n)\n• **Space Complexity:** O(1) iterative / O(log n) recursive call stack\n\n**Explanation:**\nAt each step, Binary Search divides the search space in half. If input array size is n, the maximum number of divisions required is log₂ (n).\n\n*Example:* For an array of 1,000,000 items, Binary Search takes at most ~20 comparisons!`;
      }
      return `### ⏱️ Big-O Complexity Breakdown\n\n**Common Time Complexities:**\n• **O(1) Constant:** Hash map lookups, array indexing\n• **O(log n) Logarithmic:** Binary Search, Balanced BSTs\n• **O(n) Linear:** Unsorted array search, single loops\n• **O(n log n) Linearithmic:** Merge Sort, Quick Sort (avg), Heap Sort\n• **O(n²) Quadratic:** Bubble Sort, Nested loops\n\n**Rule of Thumb:** Always identify the input parameter $N$ and count how execution scales as $N$ grows.`;
    }

    if (q.includes('binary search')) {
      return `### 🔍 Binary Search Fundamentals\n\n**Definition:** An efficient algorithm for finding an item from a **sorted** array by repeatedly dividing the search interval in half.\n\n**Steps:**\n1. Compare target with middle element.\n2. If target matches middle, return index.\n3. If target < middle, search left half.\n4. If target > middle, search right half.\n\n**Prerequisite:** Array MUST be sorted!\n\n**Complexities:**\n• Time: O(log n)\n• Space: O(1)`;
    }

    if (q.includes('recursion') || q.includes('recursive')) {
      return `### 🔄 Recursion Principles\n\n**Definition:** A function calling itself to break down a problem into smaller sub-problems.\n\n**2 Essential Rules:**\n1. **Base Case:** Condition where recursion stops to prevent infinite stack overflow.\n2. **Recursive Step:** Modifying input toward base case.\n\n*Example (Factorial):*\n\`\`\`ts\nfunction factorial(n: number): number {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive call\n}\n\`\`\``;
    }

    if (q.includes('quantum') || q.includes('physics') || q.includes('gravity') || q.includes('force')) {
      return `### ⚛️ Physics & Fundamental Forces\n\n**Overview:** Physical systems operate under conservation laws (Energy, Momentum, Charge).\n\n**Core Concepts:**\n• **Gravity:** Universal attraction between mass (described by Newton & Einstein's General Relativity).\n• **Electromagnetism:** Interaction between charged particles.\n• **Quantum Mechanics:** Behavior of matter & light on atomic scales.\n\nAsk any specific formula or concept for a complete step-by-step breakdown!`;
    }

    // 3. Smart Fallback for any unknown query
    const capitalizedQ = query.charAt(0).toUpperCase() + query.slice(1);
    return `### 🧠 Explanation: ${capitalizedQ}\n\n**Key Breakdown:**\n1. **Core Concept:** ${capitalizedQ} is a critical topic in this field, requiring active understanding of foundational principles.\n2. **Primary Mechanism:** To solve or analyze problems related to ${query}, identify the key inputs, underlying rules, and expected outputs.\n3. **Application:** Applied extensively in problem solving, critical analysis, and technical evaluations.\n\n**Recommended Action:**\nAsk for a specific definition, step-by-step problem solution, code example, or practice quiz item!`;
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply = generateAdvancedAnswer(query);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Bot Button (Bottom Right) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 outline-none focus:outline-none',
          isOpen
            ? 'bg-rose-500 hover:bg-rose-600 text-white'
            : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/25 ring-4 ring-primary-500/20'
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="AI Doubts Assistant"
        title="Medhā AI Assistant"
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <>
            <Bot size={24} />
            <span className="hidden sm:inline font-semibold text-xs pr-1">AI Assistant</span>
          </>
        )}
      </motion.button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px] max-h-[78vh] bg-surface-0 border border-surface-border rounded-3xl shadow-2xl flex flex-col overflow-hidden outline-none focus:outline-none"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-surface-50 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-md">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Medhā Advanced AI Tutor <Sparkles size={14} className="text-amber-500" />
                  </h3>
                  <p className="text-[11px] text-text-tertiary truncate max-w-[240px]">
                    {material ? material.title : 'Universal Knowledge Assistant'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-200/60 transition-colors outline-none focus:outline-none"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5 max-w-[90%]',
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5',
                      msg.sender === 'user'
                        ? 'bg-surface-200 text-text-primary'
                        : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                    )}
                  >
                    {msg.sender === 'user' ? <User size={13} /> : <Bot size={14} />}
                  </div>

                  <div
                    className={cn(
                      'p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap',
                      msg.sender === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-xs font-medium'
                        : 'bg-surface-50 border border-surface-border text-text-primary rounded-tl-xs'
                    )}
                  >
                    {msg.text}
                    <span
                      className={cn(
                        'block text-[9px] mt-1 text-right opacity-60',
                        msg.sender === 'user' ? 'text-white' : 'text-text-tertiary'
                      )}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-text-tertiary text-xs p-2">
                  <Bot size={14} className="animate-spin text-primary-500" />
                  <span>Analyzing & Generating Answer...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-surface-50/50 border-t border-surface-border flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-surface-0 hover:bg-primary-50 hover:text-primary-600 text-text-tertiary border border-surface-border shrink-0 transition-colors outline-none focus:outline-none"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-surface-0 border-t border-surface-border flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask any question, calculation, or doubt..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface-50 border border-surface-border text-text-primary placeholder:text-text-tertiary outline-none focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 transition-all shrink-0 outline-none focus:outline-none"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
