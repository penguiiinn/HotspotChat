import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { SHARED_MEDIA_ITEMS, SHARED_DOCUMENTS } from '../../data/dummyData';

interface SharedMediaListProps {
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
}

export const SharedMediaList: React.FC<SharedMediaListProps> = ({
  onOpenImage,
  onDownloadFile,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'docs'>('media');

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'media'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Shared Media ({SHARED_MEDIA_ITEMS.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Documents ({SHARED_DOCUMENTS.length})
        </button>
      </div>

      {/* Media Grid */}
      {activeTab === 'media' ? (
        <div className="grid grid-cols-2 gap-2">
          {SHARED_MEDIA_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenImage(item.url, item.title, item.senderName)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer bg-slate-900"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                <p className="text-[10px] font-semibold truncate">{item.title}</p>
                <p className="text-[9px] font-mono text-slate-300">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Documents List */
        <div className="space-y-2">
          {SHARED_DOCUMENTS.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-white/[0.06] hover:border-white/15 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{doc.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {doc.size} • {doc.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDownloadFile(doc.name)}
                title="Download file"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
