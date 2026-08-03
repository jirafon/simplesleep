import React from 'react';

function ModalShell({
  isOpen,
  title,
  description,
  icon,
  children,
  footer,
  onClose,
  widthClassName = 'max-w-md',
  iconClassName = 'bg-slate-100 text-slate-700'
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl p-6 w-full ${widthClassName} max-h-[calc(100vh-2rem)] shadow-2xl border border-slate-100 flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center min-w-0">
            {icon && (
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${iconClassName}`}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{title}</h3>
              {description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>}
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {children}
        </div>

        {footer && <div className="mt-6 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export default ModalShell;
