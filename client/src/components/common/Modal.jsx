import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in border border-surface-100">
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="text-lg font-bold text-surface-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
