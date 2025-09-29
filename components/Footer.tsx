
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center p-3 text-xs text-gray-400 border-t border-dark-border bg-dark-bg">
      <p>Copyright 2025 © Developing by Lê Thành</p>
      <div className="flex justify-center gap-4 mt-1">
        <a href="#" className="hover:text-neon-cyan transition-colors">Version 1.0.0</a>
        <a href="#" className="hover:text-neon-cyan transition-colors">Báo cáo lỗi</a>
        <a href="#" className="hover:text-neon-cyan transition-colors">Góp ý</a>
      </div>
    </footer>
  );
};

export default Footer;
