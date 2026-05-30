import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col z-10`}>
        {title && (
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800 font-display">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};