import React from 'react';

interface ActionButtonsProps {
    onDownloadPDF: () => void;
    onNavigateHome: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onDownloadPDF, onNavigateHome }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <button 
                onClick={onDownloadPDF}
                className="px-8 py-4 rounded-xl border border-primary text-primary font-bold hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2 cursor-pointer bg-transparent text-base"
            >
                <span className="material-symbols-outlined">download</span>
                Tải vé PDF
            </button>
            <button 
                onClick={onNavigateHome}
                className="px-8 py-4 rounded-xl bg-primary text-on-primary font-bold hover:bg-[#c84d04] transition-colors shadow-[0_4px_12px_rgba(161,59,0,0.3)] flex items-center justify-center gap-2 cursor-pointer border-none text-base"
            >
                <span className="material-symbols-outlined">home</span>
                Về trang chủ
            </button>
        </div>
    );
};
