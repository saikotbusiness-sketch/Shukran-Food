import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="bg-slate-900 text-white p-2.5 px-3 flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white shrink-0">
            <Download size={14} />
          </div>
          <div>
            <p className="font-bold text-[11px]">Install Star Wholesale App</p>
            <p className="text-[9px] text-slate-300">Fast one-tap home screen wholesale shopping</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={install}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px] shadow-xs transition-colors"
          >
            Install
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-slate-900 text-white p-2 px-3 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm">📱</span>
            <p className="text-[11px] text-slate-300">Install app on iPhone: Tap Share then "Add to Home Screen"</p>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="text-[10px] text-teal-300 font-bold hover:underline shrink-0"
          >
            How to
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl text-slate-800 text-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Install on iPhone / iPad</h3>
              <p className="text-slate-600 space-y-1.5 mb-4 leading-relaxed">
                1. Tap the <Share size={14} className="inline mx-1 text-teal-600" /> Share button in Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Open Star Wholesale from your home screen like a native app.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-teal-700 text-white font-bold rounded-xl text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
