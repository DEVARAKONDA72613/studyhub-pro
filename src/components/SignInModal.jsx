import { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuth } from "../context/AuthContext";

function SignInModal({ open, message, onClose }) {
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) onClose();
  }, [open, user, onClose]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);

  if (!open) return null;

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sign in required">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in to continue</h3>
        <p>{message}</p>
        <div className="btnrow">
          <button className="btn" onClick={handleSignIn}>
            Sign in with Google
          </button>
          <button className="btn btn-alt" onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignInModal;
