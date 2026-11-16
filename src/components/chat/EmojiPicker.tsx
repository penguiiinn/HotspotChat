import React, { useState } from 'react';
import { Smile, Sparkles, Laptop } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Reactions',
    icon: <Smile className="w-3.5 h-3.5" />,
    emojis: ['👍', '🔥', '⚡', '❤️', '🚀', '🎉', '👏', '🙌', '💯', '✨', '👌', '🤝'],
  },
  {
    name: 'Smileys',
    icon: <Smile className="w-3.5 h-3.5" />,
    emojis: ['😀', '😎', '🤓', '🤖', '🫡', '🤔', '😅', '😇', '🥳', '🤩', '😴', '🧐'],
  },
  {
    name: 'Tech & Mesh',
    icon: <Laptop className="w-3.5 h-3.5" />,
    emojis: ['💻', '📡', '📶', '🔋', '🔌', '💾', '🖥️', '📟', '🛰️', '🛠️', '🔒', '🔑'],
  },
  {
    name: 'Symbols',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    emojis: ['✅', '⚠️', '❌', '🟢', '🔴', '🟡', '⏳', '💡', '📌', '📎', '📊', '🌐'],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="absolute bottom-14 left-0 z-40 w-72 bg-[#161B28] border border-white/10 rounded-2xl shadow-2xl shadow-black/70 p-3 backdrop-blur-xl">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 pb-2 border-b border-white/[0.08] mb-2">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === idx
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-white/10 hover:scale-120 active:scale-95 transition-transform cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
