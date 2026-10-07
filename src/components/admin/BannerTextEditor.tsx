import React, { useState, useRef, useEffect } from 'react';
import { Banner, BannerTextProps } from '../../types';
import { Move, Eye, EyeOff, Save, Check, RefreshCw, X } from 'lucide-react';

interface BannerTextEditorProps {
  banner: Banner;
  onSave: (updatedBanner: Banner) => Promise<void>;
  onClose: () => void;
}

export const BannerTextEditor: React.FC<BannerTextEditorProps> = ({ banner, onSave, onClose }) => {
  const [editedBanner, setEditedBanner] = useState<Banner>({ ...banner });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentProps: BannerTextProps = editedBanner.textPositions?.[deviceMode] || {
    x: 10,
    y: 25,
    fontSize: 48,
    lineHeight: 1.15,
    alignment: 'left',
    color: '#ffffff',
    maxWidth: 580,
    visible: true,
  };

  const updateProp = <K extends keyof BannerTextProps>(key: K, value: BannerTextProps[K]) => {
    setEditedBanner((prev) => ({
      ...prev,
      textPositions: {
        ...prev.textPositions,
        [deviceMode]: {
          ...(prev.textPositions?.[deviceMode] || currentProps),
          [key]: value,
        },
      },
    }));
  };

  // Drag and drop handler over live banner preview
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      const boundedX = Math.min(Math.max(xPercent, 2), 75);
      const boundedY = Math.min(Math.max(yPercent, 5), 75);

      updateProp('x', boundedX);
      updateProp('y', boundedY);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onSave(editedBanner);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-[#140e0b] border border-[#3d2b1e] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b1f16]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
              Live Banner Composition & Drag Editor
            </span>
            <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
              {editedBanner.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
              {saveStatus === 'idle' && <Save className="w-3.5 h-3.5" />}
              <span>
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                  ? 'Saved ✓'
                  : saveStatus === 'error'
                  ? 'Save Failed - Retry'
                  : 'Save Position'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#251b14] text-[#8e7c6d] hover:text-[#f5f0eb] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Interactive Drag-and-Drop Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a49180]">
            <span className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-[#c89b63]" />
              <span>Click and drag the text block anywhere over the banner image:</span>
            </span>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-[#1d1510] p-1 rounded-lg border border-[#35251a]">
              {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  className={`px-2.5 py-1 rounded text-[11px] capitalize font-medium transition-colors ${
                    deviceMode === mode
                      ? 'bg-[#c89b63] text-[#100c08]'
                      : 'text-[#9e8b7c] hover:text-[#f5f0eb]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#0d0a08] border border-[#3f2b1d] select-none flex items-center justify-center"
          >
            {/* Ambient Background glow matching customer website */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-2xl scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${editedBanner.image})` }}
            />

            {/* Actual Full Image (NEVER CROPPED) */}
            <img
              src={editedBanner.image}
              alt={editedBanner.name}
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-contain max-h-[420px] pointer-events-none"
            />

            {/* Subtle Vignette */}
            <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

            {/* Draggable Text Overlay */}
            {currentProps.visible !== false && (
              <div
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  left: `${currentProps.x}%`,
                  top: `${currentProps.y}%`,
                  textAlign: currentProps.alignment || 'left',
                  color: currentProps.color || '#ffffff',
                  maxWidth: currentProps.maxWidth ? `${currentProps.maxWidth}px` : '460px',
                }}
                className={`z-30 cursor-grab active:cursor-grabbing p-3 rounded-xl border-2 transition-shadow duration-150 ${
                  isDragging
                    ? 'border-[#c89b63] bg-black/60 shadow-2xl scale-[1.02]'
                    : 'border-dashed border-[#c89b63]/60 hover:border-[#c89b63] bg-black/40 hover:bg-black/50'
                }`}
              >
                <div className="flex items-center gap-1.5 pb-1 text-[9px] uppercase tracking-wider text-[#dfb780] font-bold">
                  <Move className="w-3 h-3" />
                  <span>Drag To Position ({currentProps.x}%, {currentProps.y}%)</span>
                </div>

                {editedBanner.subtitle && (
                  <p className="text-[10px] tracking-[0.2em] font-semibold uppercase text-[#e0bb87] drop-shadow">
                    {editedBanner.subtitle}
                  </p>
                )}

                <h3
                  className="font-serif font-medium whitespace-pre-line drop-shadow"
                  style={{
                    fontSize: `${Math.min(currentProps.fontSize || 42, 38)}px`,
                    lineHeight: currentProps.lineHeight || 1.15,
                  }}
                >
                  {editedBanner.heading}
                </h3>

                {editedBanner.description && (
                  <p className="text-[11px] font-light text-[#e0dad2] mt-1 line-clamp-2 drop-shadow">
                    {editedBanner.description}
                  </p>
                )}

                {editedBanner.ctaText && (
                  <div className="pt-2">
                    <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#f5f0eb] text-[#120d09] text-[10px] font-semibold shadow">
                      {editedBanner.ctaText} →
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fine Tuning Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-[#1b140f] border border-[#2e2016] text-xs">
          <div>
            <label className="block text-[#a49180] mb-1">X Position (%)</label>
            <input
              type="number"
              min={0}
              max={85}
              value={currentProps.x}
              onChange={(e) => updateProp('x', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded bg-[#130d09] border border-[#3c2a1c] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
            />
          </div>

          <div>
            <label className="block text-[#a49180] mb-1">Y Position (%)</label>
            <input
              type="number"
              min={0}
              max={85}
              value={currentProps.y}
              onChange={(e) => updateProp('y', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded bg-[#130d09] border border-[#3c2a1c] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
            />
          </div>

          <div>
            <label className="block text-[#a49180] mb-1">Font Size (px)</label>
            <input
              type="number"
              min={18}
              max={80}
              value={currentProps.fontSize}
              onChange={(e) => updateProp('fontSize', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded bg-[#130d09] border border-[#3c2a1c] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
            />
          </div>

          <div>
            <label className="block text-[#a49180] mb-1">Text Alignment</label>
            <select
              value={currentProps.alignment}
              onChange={(e) => updateProp('alignment', e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded bg-[#130d09] border border-[#3c2a1c] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-[#a49180] mb-1">Text Color</label>
            <input
              type="color"
              value={currentProps.color || '#ffffff'}
              onChange={(e) => updateProp('color', e.target.value)}
              className="w-full h-8 px-1 py-0.5 rounded bg-[#130d09] border border-[#3c2a1c] cursor-pointer"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => updateProp('visible', !currentProps.visible)}
              className={`w-full py-1.5 px-2 rounded border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                currentProps.visible !== false
                  ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                  : 'border-[#443123] bg-[#221710] text-[#8e7c6d]'
              }`}
            >
              {currentProps.visible !== false ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hidden</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Content Inputs */}
        <div className="space-y-3 pt-2 border-t border-[#2b1f16] text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#a49180] mb-1">Banner Heading</label>
              <textarea
                rows={2}
                value={editedBanner.heading}
                onChange={(e) => setEditedBanner((prev) => ({ ...prev, heading: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#19110b] border border-[#3a281a] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[#a49180] mb-1">Subtitle / Kicker</label>
              <input
                type="text"
                value={editedBanner.subtitle}
                onChange={(e) => setEditedBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#19110b] border border-[#3a281a] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none mb-2"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#a49180] mb-0.5">CTA Button Text</label>
                  <input
                    type="text"
                    value={editedBanner.ctaText}
                    onChange={(e) => setEditedBanner((prev) => ({ ...prev, ctaText: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#19110b] border border-[#3a281a] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#a49180] mb-0.5">CTA Button Link</label>
                  <input
                    type="text"
                    value={editedBanner.ctaLink}
                    onChange={(e) => setEditedBanner((prev) => ({ ...prev, ctaLink: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#19110b] border border-[#3a281a] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
