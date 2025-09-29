
import React from 'react';
import { Book, Lightbulb, Settings, History, Repeat } from 'lucide-react';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-3 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-br from-brand-start to-brand-mid">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold">Lê Thành Image Editor</h1>
          <p className="text-xs text-gray-400">Chúc các bạn có những bức ảnh đẹp!</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-gray-300">
        <button className="p-2 rounded-full hover:bg-dark-surface hover:text-neon-cyan transition-colors" title="Tài liệu/Hướng dẫn">
          <Book size={18} />
        </button>
        <button className="p-2 rounded-full hover:bg-dark-surface hover:text-neon-cyan transition-colors" title="Mẹo nhanh">
          <Lightbulb size={18} />
        </button>
        <div className="w-px h-6 bg-dark-border mx-2"></div>
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-full hover:bg-dark-surface hover:text-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300 disabled:hover:bg-dark-surface" 
          title="Hoàn tác"
        >
          <History size={18} />
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-full hover:bg-dark-surface hover:text-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-300 disabled:hover:bg-dark-surface" 
          title="Làm lại"
        >
          <Repeat size={18} />
        </button>
        <div className="w-px h-6 bg-dark-border mx-2"></div>
        <button className="p-2 rounded-full hover:bg-dark-surface hover:text-neon-cyan transition-colors" title="Cài đặt">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
