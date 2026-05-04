import { useState, useEffect, useRef, useCallback, useId } from 'react';
import './WsbAvatarMenu.css';

export function WsbAvatarMenu({ initials = '', fullName = '', role = '' }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKey = (evt) => {
      if (evt.key === 'Escape') close();
    };
    const handleClickOutside = (evt) => {
      if (!menuRef.current?.contains(evt.target) && !btnRef.current?.contains(evt.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, close]);

  const items = [
    { label: 'Préférences utilisateur', href: '/sys_user.do?sys_id=javascript:gs.getUserID()' },
    { label: 'Impersonate user', action: () => { window.g_user?.impersonate?.(); } },
    { separator: true },
    { label: 'Se déconnecter', href: '/logout.do', danger: true },
  ];

  return (
    <div className="wsb-avatar-menu">
      <button
        ref={btnRef}
        type="button"
        className="wsb-avatar-menu__btn"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={`Menu utilisateur — ${fullName}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="wsb-avatar-menu__circle">{initials}</span>
      </button>

      {open && (
        <div ref={menuRef} id={menuId} className="wsb-avatar-menu__dropdown" role="menu">
          <div className="wsb-avatar-menu__identity">
            <span className="wsb-avatar-menu__circle wsb-avatar-menu__circle--lg">{initials}</span>
            <div>
              <div className="wsb-avatar-menu__name">{fullName}</div>
              <div className="wsb-avatar-menu__role">{role}</div>
            </div>
          </div>
          <div className="wsb-avatar-menu__divider" />
          {items.map((item, idx) =>
            item.separator ? (
              <div key={idx} className="wsb-avatar-menu__divider" role="separator" />
            ) : (
              <a
                key={idx}
                href={item.href || '#'}
                role="menuitem"
                className={`wsb-avatar-menu__item${item.danger ? ' wsb-avatar-menu__item--danger' : ''}`}
                onClick={(evt) => {
                  if (item.action) {
                    evt.preventDefault();
                    item.action();
                    close();
                  }
                }}
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}
