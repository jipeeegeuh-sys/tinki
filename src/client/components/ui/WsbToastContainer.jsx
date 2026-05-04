import { useToast } from '../../lib/useToast.js';
import { WsbToast } from './WsbToast.jsx';

export function WsbToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="wsb-toast-container"
      aria-live="assertive"
      aria-relevant="additions"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <WsbToast key={t.id} {...t} onClose={removeToast} />
      ))}
    </div>
  );
}
