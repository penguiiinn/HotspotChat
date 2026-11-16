import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Code2,
  X,
  Mic,
  Radio,
  CornerDownRight
} from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import type { FileAttachment, CodeSnippet, ReplyMessagePreview } from '../../types';
import { playHotspotChime } from '../../hooks/useHotspotSound';
import { formatFileSize } from '../../utils/chatUtils';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    attachment?: FileAttachment,
    codeSnippet?: CodeSnippet,
    replyTo?: ReplyMessagePreview
  ) => void;
  activePeerName: string;
  replyingToMessage: ReplyMessagePreview | null;
  onCancelReply: () => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  activePeerName,
  replyingToMessage,
  onCancelReply,
  onNotify,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<FileAttachment | undefined>(undefined);
  const [pendingCodeSnippet, setPendingCodeSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when replying or switching peer
  useEffect(() => {
    inputRef.current?.focus();
  }, [activePeerName, replyingToMessage]);

  const canSend = text.trim().length > 0 || !!pendingAttachment || !!pendingCodeSnippet;

  const handleSend = () => {
    if (!canSend) return;

    playHotspotChime('sent');
    onSendMessage(
      text.trim(),
      pendingAttachment,
      pendingCodeSnippet,
      replyingToMessage || undefined
    );

    // Reset input state
    setText('');
    setPendingAttachment(undefined);
    setPendingCodeSnippet(undefined);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    onCancelReply();

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

  // 1. Real Browser Image Selection via input[type=file]
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPendingAttachment({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'image/png',
        url: result,
        extension: file.name.split('.').pop()?.toUpperCase() || 'IMG',
      });
      onNotify('Photo Selected', `${file.name} ready to send`, 'info');
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if removed
    e.target.value = '';
    setShowAttachmentMenu(false);
  };

  // 2. Real Browser Document Selection via input[type=file]
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'DOC';
    setPendingAttachment({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'application/octet-stream',
      extension: ext,
    });

    onNotify('Document Selected', `${file.name} ready to transmit`, 'info');
    e.target.value = '';
    setShowAttachmentMenu(false);
  };

  // 3. Quick preset code snippet
  const handleAttachCodePreset = () => {
    setPendingCodeSnippet({
      language: 'python',
      code: `import socket\n\n# HotspotChat P2P Packet Listener\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.bind(('192.168.43.120', 4892))\ns.listen(5)\nprint("[*] Direct socket ready on local hotspot AP...")`,
    });
    setShowAttachmentMenu(false);
    onNotify('Code Snippet Attached', 'Python P2P Socket Receiver ready', 'info');
  };

  // 4. Voice note recording simulation
  const handleVoiceRecord = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      onSendMessage(
        '🎙️ Voice message (0:07) - Transmitted via local hotspot audio frame stream'
      );
      onNotify('Audio Transmitted', 'Voice memo delivered over hotspot', 'success');
    } else {
      setIsRecordingVoice(true);
      playHotspotChime('click');
      setTimeout(() => {
        setIsRecordingVoice(false);
        onSendMessage('🎙️ Voice message (0:04) - Transmitted via local mesh');
      }, 3500);
    }
  };

  return (
    <div className="relative bg-[#0E121A] border-t border-white/[0.08] shrink-0 select-none">
      {/* Hidden native browser file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.json,.zip,.tar,.gz,.bin,.csv,.py,.ts,.tsx,.js"
        onChange={handleDocFileChange}
        className="hidden"
      />

      {/* Replying-to Preview Bar (WhatsApp Desktop style) */}
      {replyingToMessage && (
        <div className="px-4 py-2.5 bg-[#141924] border-b border-white/[0.08] flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 self-stretch rounded-full bg-orange-500 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-orange-400">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Replying to {replyingToMessage.senderName}</span>
              </div>
              <p className="text-slate-300 truncate mt-0.5 max-w-lg">
                {replyingToMessage.content || replyingToMessage.attachmentName || 'Attachment'}
              </p>
            </div>
          </div>

          <button
            onClick={onCancelReply}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Cancel reply"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Attachment / Code Preview Tray */}
      {(pendingAttachment || pendingCodeSnippet) && (
        <div className="px-4 py-2.5 bg-[#121622] border-b border-white/[0.06] flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-3 min-w-0">
            {pendingAttachment?.type.startsWith('image') ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
                <img
                  src={pendingAttachment.url}
                  alt="Selected thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : pendingCodeSnippet ? (
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {'</>'}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {pendingAttachment?.name || `${pendingCodeSnippet?.language.toUpperCase()} Snippet`}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {pendingAttachment?.size || `${pendingCodeSnippet?.code.length} bytes`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPendingAttachment(undefined);
              setPendingCodeSnippet(undefined);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Active Banner */}
      {isRecordingVoice && (
        <div className="px-4 py-2 bg-rose-500/15 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>RECORDING OFFLINE VOICE BUFFER...</span>
          </div>
          <button
            onClick={() => setIsRecordingVoice(false)}
            className="text-[11px] font-mono hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Composer Row */}
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-2 bg-[#141824] border border-white/10 focus-within:border-orange-500/60 focus-within:ring-1 focus-within:ring-orange-500/40 rounded-2xl p-2 transition-all shadow-inner">
          {/* 1. Emoji Picker Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentMenu(false);
                playHotspotChime('click');
              }}
              title="Emoji picker"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showEmojiPicker
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-white/5'
              }`}
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <EmojiPicker
                onSelectEmoji={(emoji) => setText((prev) => prev + emoji)}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

          {/* 2. Attachment Button with WhatsApp Desktop style menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu(!showAttachmentMenu);
                setShowEmojiPicker(false);
                playHotspotChime('click');
              }}
              title="Attach photos, documents or code"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showAttachmentMenu
                  ? 'text-orange-400 bg-orange-400/10'
                  : 'text-slate-400 hover:text-orange-400 hover:bg-white/5'
              }`}
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* WhatsApp Desktop Style Attachment Popover Menu */}
            {showAttachmentMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-12 left-0 z-40 w-56 bg-[#161B28]/95 border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="text-[10px] font-mono text-slate-500 px-2.5 py-1 uppercase tracking-wider">
                  Attach Local Asset
                </div>

                {/* Option 1: Choose Image from Computer */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold leading-tight">Photos & Videos</p>
                    <p className="text-[10px] text-slate-400">Pick image from disk</p>
                  </div>
                </button>

                {/* Option 2: Choose Document from Computer */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold leading-tight">Document</p>
                    <p className="text-[10px] text-slate-400">PDF, ZIP, JSON, Docs</p>
                  </div>
                </button>

                {/* Option 3: Code Payload */}
                <button
                  type="button"
                  onClick={handleAttachCodePreset}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold leading-tight">Code Snippet</p>
                    <p className="text-[10px] text-slate-400">Socket receiver snippet</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 3. Multiline Auto-Expanding Text Input */}
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Auto-resize up to max height
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activePeerName} over local hotspot (Enter to send)...`}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-1.5 px-1 max-h-32 font-sans leading-relaxed"
          />

          {/* 4. Action Button: Send or Microphone */}
          {canSend ? (
            <button
              type="button"
              onClick={handleSend}
              title="Send message (Enter)"
              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all cursor-pointer shadow-md shadow-orange-500/30 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoiceRecord}
              title="Voice message simulation"
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-1">
          <span>
            <kbd className="px-1 rounded bg-white/5 border border-white/10 text-slate-400">Enter</kbd> to send,{' '}
            <kbd className="px-1 rounded bg-white/5 border border-white/10 text-slate-400">Shift + Enter</kbd> for newline
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Radio className="w-3 h-3" />
            <span>P2P Hotspot Direct Link</span>
          </span>
        </div>
      </div>
    </div>
  );
};
