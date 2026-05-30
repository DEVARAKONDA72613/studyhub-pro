import { useEffect, useState } from "react";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  provider,
} from "../firebase";

function AuthButton() {
  const [user, setUser] =
    useState(null);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(
        auth,
        provider
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div>
        <img
          src={user.photoURL}
          alt="profile"
        />

        <span>
          {user.displayName}
        </span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin}>
      Sign in
    </button>
  );
}

export default AuthButton;