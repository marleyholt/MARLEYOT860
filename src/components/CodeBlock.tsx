import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  downloadable?: boolean;
  maxHeight?: string;
  id?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  filename,
  downloadable = false,
  maxHeight = 'max-h-96',
  id,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'script.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id={id} className="rounded-lg border border-neutral-800 bg-[#0d1117] overflow-hidden text-sm my-3 shadow-md">
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-neutral-800 text-xs font-mono text-neutral-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70 inline-block"></span>
            {filename && <span className="font-semibold text-neutral-200 ml-2">{filename}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <span className="uppercase tracking-wider text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
              {language}
            </span>
            {downloadable && filename && (
              <button
                type="button"
                onClick={handleDownload}
                title={`Baixar ${filename}`}
                className="flex items-center space-x-1 hover:text-emerald-400 p-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              title="Copiar código"
              className="flex items-center space-x-1 hover:text-white p-1 transition-colors ml-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-sans">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs font-sans">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <pre className={`p-4 overflow-x-auto ${maxHeight} font-mono text-neutral-300 leading-relaxed text-xs`}>
        <code>{code}</code>
      </pre>
    </div>
  );
};
