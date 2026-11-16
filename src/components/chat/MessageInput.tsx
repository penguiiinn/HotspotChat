import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Image as ImageIcon, FileText, Code2, X, Mic, Radio } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import type { FileAttachment, CodeSnippet } from '../../types';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    attachment?: FileAttachment,
    codeSnippet?: CodeSnippet
  ) => void;
  activePeerName: string;
  isPeerTyping?: boolean;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  activePeerName,
  onNotify,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<FileAttachment | undefined>(undefined);
  const [pendingCodeSnippet, setPendingCodeSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activePeerName]);

  const handleSend = () => {
    if (!text.trim() && !pendingAttachment && !pendingCodeSnippet) return;

    playHotspotChime('sent');
    onSendMessage(text.trim(), pendingAttachment, pendingCodeSnippet);

    setText('');
    setPendingAttachment(undefined);
    setPendingCodeSnippet(undefined);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Attach Image preset
  const handleAttachImagePreset = () => {
    setPendingAttachment({
      name: 'network_packet_capture.png',
      size: '2.4 MB',
      type: 'image/png',
      url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=80',
      extension: 'PNG',
    });
    setShowAttachmentMenu(false);
    onNotify('Image Attached', 'network_packet_capture.png ready to send', 'info');
  };

  // Attach File preset
  const handleAttachFilePreset = () => {
    setPendingAttachment({
      name: 'hotspot_mesh_nodes.json',
      size: '64.2 KB',
      type: 'application/json',
      extension: 'JSON',
    });
    setShowAttachmentMenu(false);
    onNotify('File Attached', 'hotspot_mesh_nodes.json ready to send', 'info');
  };

  // Attach Code preset
  const handleAttachCodePreset = () => {
    setPendingCodeSnippet({
      language: 'python',
      code: `import socket\n\n# Direct HotspotChat P2P Socket Receiver\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.bind(('192.168.43.120', 4892))\ns.listen(5)\nprint("[*] Listening on local hotspot interface wlan0...")`,
    });
    setShowAttachmentMenu(false);
    onNotify('Code Snippet Attached', 'Python P2P Socket Listener ready to transmit', 'info');
  };

  // Simulate voice recording
  const handleVoiceRecord = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      onSendMessage('🎙️ Voice message (0:08) - Transmitted via raw audio frame stream');
      onNotify('Audio Transmitted', 'Voice memo delivered over hotspot', 'success');
    } else {
      setIsRecordingVoice(true);
      playHotspotChime('click');
      setTimeout(() => {
        setIsRecordingVoice(false);
        onSendMessage('🎙️ Voice message (0:05) - Transmitted via local mesh');
      }, 3500);
    }
  };

  return (
    <div className="relative p-3 sm:p-4 bg-[#0E121A] border-t border-white/[0.07] shrink-0">
      {/* Pending Attachment / Code Preview Tray */}
      {(pendingAttachment || pendingCodeSnippet) && (
        <div className="mb-2 p-2.5 rounded-xl bg-[#161B28] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {pendingAttachment?.type.startsWith('image') ? (
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                <img src={pendingAttachment.url} alt="Attachment" className="w-full h-full object-cover" />
              </div>
            ) : pendingCodeSnippet ? (
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold">
                {pendingCodeSnippet.language.toUpperCase()}
              </span>
            ) : (
              <FileText className="w-4 h-4 text-orange-400" />
            )}
            <div>
              <p className="font-semibold text-slate-200">
                {pendingAttachment?.name || `${pendingCodeSnippet?.language} snippet`}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                {pendingAttachment?.size || `${pendingCodeSnippet?.code.length} bytes`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPendingAttachment(undefined);
              setPendingCodeSnippet(undefined);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Overlay */}
      {isRecordingVoice && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>RECORDING OFFLINE VOICE BUFFER (0:03)...</span>
          </div>
          <button
            onClick={() => setIsRecordingVoice(false)}
            className="text-[11px] font-mono hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 bg-[#141923] border border-white/10 focus-within:border-orange-500/60 focus-within:ring-1 focus-within:ring-orange-500/40 rounded-2xl p-2 transition-all shadow-inner">
        {/* Attachment Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
              playHotspotChime('click');
            }}
            title="Attach file, photo, or code"
            className="p-2 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Attachment Popup Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-12 left-0 z-40 w-52 bg-[#161B28] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-xl">
              <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase tracking-wider">
                Transmit to Peer
              </div>
              <button
                type="button"
                onClick={handleAttachImagePreset}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Share Image</span>
              </button>
              <button
                type="button"
                onClick={handleAttachFilePreset}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Send Document</span>
              </button>
              <button
                type="button"
                onClick={handleAttachCodePreset}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Transmit Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Text Area */}
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Auto resize
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Type message to ${activePeerName} over local hotspot (Enter to send)...`}
          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-1.5 px-1 max-h-32 font-sans leading-normal"
        />

        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
              playHotspotChime('click');
            }}
            title="Emoji Picker"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showEmojiPicker && (
            <EmojiPicker
              onSelectEmoji={(emoji) => setText((prev) => prev + emoji)}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Voice Note Button */}
        <button
          type="button"
          onClick={handleVoiceRecord}
          title="Hold/Click to record offline voice note"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isRecordingVoice
              ? 'bg-rose-500 text-white animate-pulse'
              : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() && !pendingAttachment && !pendingCodeSnippet}
          title="Send packet (Enter)"
          className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white disabled:opacity-40 disabled:hover:bg-orange-500 transition-all cursor-pointer shadow-md shadow-orange-500/25 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Helper Hotkey Hint */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-1">
        <span>Press <kbd className="px-1 rounded bg-white/5 border border-white/10 text-slate-400">Enter</kbd> to send, <kbd className="px-1 rounded bg-white/5 border border-white/10 text-slate-400">Shift + Enter</kbd> for newline</span>
        <span className="flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 text-emerald-400" />
          <span>Local Direct Link Active</span>
        </span>
      </div>
    </div>
  );
};
