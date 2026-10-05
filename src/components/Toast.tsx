import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 border shadow-sm flex items-start gap-3 transition-all duration-200 text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-[#F4F8F5] border-[#A8C8B0] text-[#2C5237]'
                : toast.type === 'error'
                ? 'bg-[#FDF4F2] border-[#F2B8AC] text-[#93301B]'
                : 'bg-[#FAF8F5] border-[#E5DFD4] text-[#191817]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                toast.type === 'success'
                  ? 'bg-[#476150]'
                  : toast.type === 'error'
                  ? 'bg-[#C85A32]'
                  : 'bg-[#847E76]'
              }`}
            />
            <p className="flex-1 leading-snug">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
