import React from 'react';

export const INPUT_BASE =
  'w-full rounded-lg p-3 text-sm border transition-all outline-none focus:border-l-4';

export const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-container-low)',
  borderColor:     'var(--color-outline-variant)',
  color:           'var(--color-on-surface)',
};

export const inputDisabledStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-container)',
  borderColor:     'var(--color-outline-variant)',
  color:           'var(--color-on-surface)',
  opacity:         0.65,
  cursor:          'not-allowed',
};

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label
    className="block text-xs font-bold uppercase tracking-widest mb-1"
    style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-on-surface-variant)' }}
  >
    {children}
  </label>
);
