
import React, { useState, useRef } from 'react';
import type { EditingCategory, EditingTask, ImagePaletteItem, HistoryItem } from '../types';
import { ChevronUp, UploadCloud, X, Wand, RefreshCw, Trash2, Undo2, Camera } from 'lucide-react';

interface ControlsPanelProps {
  onImageUpload: (files: FileList) => void;
  imagePalette: ImagePaletteItem[];
  onImageSelect: (image: ImagePaletteItem) => void;
  onImageRemove: (id: string) => void;
  activeImageId: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  categories: EditingCategory[];
  activeTask: EditingTask | null;
  onTaskSelect: (task: EditingTask) => void;
  canGenerate: boolean;
  history: HistoryItem[];
  currentHistoryIndex: number;
  onRevert: (index: number) => void;
  onClearHistory: () => void;
  faceSwapSourceId: string | null;
  faceSwapTargetId: string | null;
  onFaceSwapImageSelect: (image: ImagePaletteItem) => void;
  onOpenCamera: () => void;
}

interface ImageUploaderProps {
  onImageUpload: (files: FileList) => void;
  imagePalette: ImagePaletteItem[];
  onImageSelect: (image: ImagePaletteItem) => void;
  onImageRemove: (id: string) => void;
  activeImageId: string | null;
  activeTask: EditingTask | null;
  faceSwapSourceId: string | null;
  faceSwapTargetId: string | null;
  onFaceSwapImageSelect: (image: ImagePaletteItem) => void;
  onOpenCamera: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, imagePalette, onImageSelect, onImageRemove, activeImageId,
  activeTask, faceSwapSourceId, faceSwapTargetId, onFaceSwapImageSelect, onOpenCamera 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFaceSwapMode = activeTask?.id === 'TREND_FACE_SWAP_MV';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files);
      if (e.target) {
        e.target.value = ''; // Allow re-uploading the same file
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-dark-surface rounded-lg p-3 border border-dark-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-base">Kho ảnh (Tối đa 4)</h3>
        <button
          onClick={onOpenCamera}
          disabled={imagePalette.length >= 4}
          className="flex items-center gap-1.5 text-sm px-3 py-1 bg-dark-border rounded-md hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Chụp ảnh bằng camera"
        >
          <Camera size={16} />
          <span>Chụp ảnh</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => {
          const image = imagePalette[index];
          if (image) {
            let borderClasses = 'border-2 border-transparent hover:border-gray-500';
            let badge = null;

            if (isFaceSwapMode) {
                if (faceSwapSourceId === image.id) {
                    borderClasses = 'border-2 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]';
                    badge = <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">GỐC</div>;
                } else if (faceSwapTargetId === image.id) {
                    borderClasses = 'border-2 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]';
                    badge = <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">ĐÍCH</div>;
                }
            } else if (activeImageId === image.id) {
                borderClasses = 'border-2 border-neon-cyan shadow-neon';
            }

            return (
              <div key={image.id} className="relative aspect-square group">
                <button 
                  onClick={() => isFaceSwapMode ? onFaceSwapImageSelect(image) : onImageSelect(image)}
                  className={`w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${borderClasses}`}
                  aria-label={`Select image ${index + 1}`}
                >
                  <img src={image.dataUrl} alt={`upload preview ${index + 1}`} className="w-full h-full object-cover" />
                </button>
                {badge}
                <button
                  onClick={() => onImageRemove(image.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-20"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          }
          return (
            <button
              key={`empty-${index}`}
              onClick={handleUploadClick}
              disabled={imagePalette.length >= 4}
              className="aspect-square flex flex-col items-center justify-center text-center cursor-pointer w-full h-full bg-dark-bg rounded-lg border-2 border-dashed border-dark-border hover:border-neon-cyan transition-colors p-2 text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Upload new image"
            >
              <UploadCloud className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Tải ảnh</span>
            </button>
          );
        })}
      </div>
      <input 
        ref={fileInputRef} 
        id="file-upload" 
        type="file" 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp" 
        multiple
        onChange={handleFileChange} 
      />
    </div>
  );
};

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 font-semibold text-left">
        {title}
        <ChevronUp className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      {isOpen && <div className="p-3 border-t border-dark-border">{children}</div>}
    </div>
  );
};

const HistoryPanel: React.FC<Pick<ControlsPanelProps, 'history' | 'currentHistoryIndex' | 'onRevert' | 'onClearHistory'>> = ({ history, currentHistoryIndex, onRevert, onClearHistory }) => {
  if (history.length <= 1) {
    return <p className="text-sm text-gray-400 text-center">Chưa có lịch sử chỉnh sửa.</p>;
  }

  const reversedHistory = [...history].reverse();

  return (
    <div className="space-y-2">
      <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
        {reversedHistory.map((item, reversedIndex) => {
          const originalIndex = history.length - 1 - reversedIndex;
          const isActive = originalIndex === currentHistoryIndex;
          return (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isActive ? 'bg-neon-cyan/10 border border-neon-cyan/50' : 'bg-dark-bg'}`}
            >
              <img src={item.imageDataUrl} alt={item.action} className="w-10 h-10 rounded-md object-cover flex-shrink-0"/>
              <span className="text-sm flex-grow truncate">{item.action}</span>
              <button 
                onClick={() => onRevert(originalIndex)} 
                disabled={isActive}
                className="p-1.5 rounded-md hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                title="Hoàn tác về bước này"
              >
                <Undo2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={onClearHistory}
        className="w-full flex items-center justify-center gap-2 text-sm py-2 bg-red-900/50 text-red-300 rounded-md hover:bg-red-900/80 transition-colors"
      >
        <Trash2 size={14} />
        Xoá lịch sử (về ảnh gốc)
      </button>
    </div>
  );
};


const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
  onImageUpload, imagePalette, onImageSelect, onImageRemove, activeImageId, prompt, setPrompt, onGenerate, isLoading, categories, activeTask, onTaskSelect, canGenerate, history, currentHistoryIndex, onRevert, onClearHistory, faceSwapSourceId, faceSwapTargetId, onFaceSwapImageSelect, onOpenCamera
}) => {
  
  const promptPlaceholder = 
    activeTask?.id === 'IMAGE_COLLAGE'
      ? "Mô tả kiểu khung, ví dụ: 'khung polaroid trên nền gỗ', 'dải phim điện ảnh', 'ghép kiểu trang truyện tranh'..."
      : activeTask?.id === 'EDIT_NANO_BANANA'
        ? "Hãy nhập yêu cầu của bạn tại đây - còn lại để tôi lo ^.^"
        : "AI sẽ tự động tạo gợi ý dựa trên tính năng bạn chọn...";
    
  return (
    <div className="space-y-4">
      {activeTask?.id === 'TREND_FACE_SWAP_MV' && (
          <div className="bg-dark-surface rounded-lg p-3 border border-blue-400/50 text-center text-sm text-blue-200">
              <p className="font-semibold">Chế độ Face Swap</p>
              <p>1. Chọn <span className="text-green-300 font-bold">Ảnh Gốc</span> (chứa khuôn mặt cần ghép).</p>
              <p>2. Chọn <span className="text-blue-300 font-bold">Ảnh Đích</span> (khung cảnh/người mẫu).</p>
          </div>
      )}
      <ImageUploader 
        onImageUpload={onImageUpload}
        imagePalette={imagePalette}
        onImageSelect={onImageSelect}
        onImageRemove={onImageRemove}
        activeImageId={activeImageId}
        activeTask={activeTask}
        faceSwapSourceId={faceSwapSourceId}
        faceSwapTargetId={faceSwapTargetId}
        onFaceSwapImageSelect={onFaceSwapImageSelect}
        onOpenCamera={onOpenCamera}
      />
      
      {activeImageId && (
        <AccordionSection title="Lịch sử chỉnh sửa">
            <HistoryPanel 
                history={history}
                currentHistoryIndex={currentHistoryIndex}
                onRevert={onRevert}
                onClearHistory={onClearHistory}
            />
        </AccordionSection>
      )}

      {categories.map((category) => (
        <AccordionSection key={category.name} title={category.name} defaultOpen={category.name.includes("Sáng tạo")}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {category.tasks.map((task) => (
              <button 
                key={task.id} 
                onClick={() => onTaskSelect(task)}
                className={`p-2 flex flex-col items-center justify-center text-center rounded-md transition-all duration-200 text-sm h-20 ${activeTask?.id === task.id ? 'bg-neon-cyan text-black shadow-neon' : 'bg-dark-border hover:bg-dark-border/70'}`}
              >
                <task.icon className="w-6 h-6 mb-1" />
                <span>{task.name}</span>
              </button>
            ))}
          </div>
        </AccordionSection>
      ))}

      <div className="bg-dark-surface rounded-lg p-4 border border-dark-border space-y-3">
        <h3 className="font-semibold text-lg">Mô tả yêu cầu (Prompt)</h3>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 p-2 bg-dark-bg border border-dark-border rounded-md focus:ring-2 focus:ring-neon-cyan focus:outline-none resize-none"
          placeholder={promptPlaceholder}
        />
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-dark-border rounded-md hover:bg-gray-600 transition-colors">
              <RefreshCw size={14} /> Tạo gợi ý ngẫu nhiên
            </button>
            <button 
              onClick={() => setPrompt('')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-dark-border rounded-md hover:bg-red-500/50 transition-colors"
            >
              <X size={14} /> Xoá bỏ
            </button>
          </div>
          <button 
            onClick={onGenerate} 
            disabled={isLoading || !canGenerate}
            className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-black font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-cyan/20"
          >
            <Wand size={18} />
            {isLoading ? 'Đang tạo...' : 'Tạo Ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
