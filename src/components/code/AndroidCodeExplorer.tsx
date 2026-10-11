import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  ArrowLeft,
  FolderTree,
  Terminal,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '../glass/GlassCard';
import { GlassButton } from '../glass/GlassButton';
import { ANDROID_CODEBASE, AndroidCodeFile } from '../../data/androidSourceCode';

interface AndroidCodeExplorerProps {
  onBack: () => void;
}

export const AndroidCodeExplorer: React.FC<AndroidCodeExplorerProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_CODEBASE[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-4xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Application
        </button>
        <span className="text-xs font-bold text-pink-400 font-mono">
          Kotlin · Jetpack Compose · Material 3
        </span>
      </div>

      <div>
        <h1 className="text-xl font-extrabold text-white">Native Android Codebase & Architecture</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete production-grade Kotlin files for the SURAKSHA MESH Android client
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* File Navigator Column */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
            Source Tree Files
          </span>
          <div className="space-y-1.5">
            {ANDROID_CODEBASE.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2 ${
                    isSelected
                      ? 'bg-blue-950/70 border-pink-400/50 text-white shadow-md'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">
                      {file.path.split('/').pop()}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {file.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer Column */}
        <div className="md:col-span-8 space-y-2">
          <GlassCard glow="none" className="p-4 bg-slate-950/90 border-blue-400/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold text-pink-300">
                  {selectedFile.path}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 max-h-[500px] overflow-y-auto rounded-xl bg-black/70 p-3.5 font-mono text-[11px] text-slate-200 leading-relaxed border border-white/5 select-text">
              <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
