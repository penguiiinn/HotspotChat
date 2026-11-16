import React, { useState, useMemo } from 'react';
import { Smile, Sparkles, Laptop, Search, Coffee, Heart } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

interface EmojiCategory {
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    icon: <Smile className="w-3.5 h-3.5" />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
      '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    ],
  },
  {
    name: 'Gestures',
    icon: <Heart className="w-3.5 h-3.5" />,
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
      '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥',
    ],
  },
  {
    name: 'Tech & Mesh',
    icon: <Laptop className="w-3.5 h-3.5" />,
    emojis: [
      '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💽', '💾', '💿', '📀', '📱',
      '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '📡', '📶', '🛰️',
      '🔧', '🔨', '⚒️', '🛠️', '⚙️', '🔩', '⚡', '💡', '🔦', '🔒',
      '🔓', '🔑', '🗝️', '🔎', '🔍', '🛡️', '📦', '🏷️', '📊', '📈',
    ],
  },
  {
    name: 'Food & Drink',
    icon: <Coffee className="w-3.5 h-3.5" />,
    emojis: [
      '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷',
      '🥃', '🍸', '🍹', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯',
      '🥙', '🧆', '🥗', '🍲', '🍜', '🍣', '🍱', '🍛', '🍙', '🍚',
    ],
  },
  {
    name: 'Symbols',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    emojis: [
      '✅', '☑️', '✔️', '❌', '❎', '➕', '➖', '➗', '✖️', '❓',
      '❔', '❕', '❗', '⚠️', '⛔', '🚫', '🔴', '🟠', '🟡', '🟢',
      '🔵', '🟣', '⚫', '⚪', '🟩', '🟦', '🟨', '🟧', '🟥', '✨',
      '⭐', '🌟', '💫', '💥', '💢', '💦', '💨', '⏳', '⌛', '⏰',
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter emojis if search is active
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    return all.slice(0, 36); // return matching subset
  }, [searchQuery]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-2 sm:left-4 z-40 w-72 sm:w-80 bg-[#161B28]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-white/[0.08] bg-[#11151F]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#182030] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
            autoFocus
          />
        </div>
      </div>

      {/* Categories Bar */}
      {!searchQuery && (
        <div className="flex items-center px-2 py-1.5 border-b border-white/[0.06] bg-[#141824] gap-1 overflow-x-auto">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0 ${
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
      )}

      {/* Grid Content */}
      <div className="p-2.5 max-h-56 overflow-y-auto">
        {filteredEmojis ? (
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase px-1 mb-1.5">
              Search Results
            </div>
            <div className="grid grid-cols-7 gap-1">
              {filteredEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase px-1 mb-1.5">
              {EMOJI_CATEGORIES[activeTab].name}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
