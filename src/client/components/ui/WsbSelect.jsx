import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import './WsbSelect.css';

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WsbSelect = forwardRef(function WsbSelect({
  id,
  label,
  placeholder = 'Sélectionner…',
  options = [],
  value = '',
  onChange,
  required = false,
  error = '',
}, ref) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => triggerRef.current?.focus(),
  }));

  const listId = `${id}-listbox`;
  const errId = `err-${id}`;
  const hasError = Boolean(error);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      setFocusedIdx(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  const select = useCallback((val) => {
    onChange(val);
    setOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIdx >= 0) select(options[focusedIdx].value);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }, [open, focusedIdx, options, select]);

  const triggerCls = [
    'wsb-select__trigger',
    open ? 'wsb-select__trigger--open' : '',
    selected ? 'wsb-select__trigger--filled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="wsb-select" ref={containerRef}>
      {label && (
        <label className="wsb-select__label" id={`${id}-label`}>
          {label}
          {required && <span className="wsb-select__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        className={triggerCls}
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-activedescendant={open && focusedIdx >= 0 ? `${id}-opt-${focusedIdx}` : undefined}
        aria-invalid={hasError ? 'true' : undefined}
        aria-errormessage={hasError ? errId : undefined}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? 'wsb-select__value' : 'wsb-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronIcon />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="wsb-select__listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              id={`${id}-opt-${idx}`}
              role="option"
              aria-selected={opt.value === value}
              className={`wsb-select__option${opt.value === value ? ' wsb-select__option--selected' : ''}${idx === focusedIdx ? ' wsb-select__option--focused' : ''}`}
              onClick={() => select(opt.value)}
              onMouseEnter={() => setFocusedIdx(idx)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {hasError && (
        <span id={errId} className="wsb-form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
