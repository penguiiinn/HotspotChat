import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Image as ImageIcon } from 'lucide-react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageTitle?: string;
  senderName?: string;
  onDownload: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle,
  senderName,
  onDownload,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-4xl max-h-[90vh] bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#161B28]/80">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-xs font-semibold text-slate-100">{imageTitle || 'Shared Image'}</p>
                {senderName && <p className="text-[10px] text-slate-400">Transmitted by {senderName}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Disk</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full Image */}
          <div className="p-4 flex items-center justify-center bg-black/60 overflow-auto">
            <img
              src={imageUrl}
              alt={imageTitle || 'Preview'}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/5"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
