import './WsbSkipLink.css';

export function WsbSkipLink({ targetId = 'main-content', label = 'Aller au contenu principal' }) {
  const handleClick = (evt) => {
    evt.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView?.({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="wsb-skip-link"
      onClick={handleClick}
    >
      {label}
    </a>
  );
}
