import { lazy, Suspense, useState } from "react";

const AuthProvider = lazy(() =>
  import("../context/AuthContext").then((module) => ({
    default: module.AuthProvider,
  }))
);

const AuthButton = lazy(() => import("./AuthButton"));

function DeferredAuth() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return (
      <button
        type="button"
        className="sh-deferred-auth"
        onClick={() => setEnabled(true)}
      >
        Sign in
      </button>
    );
  }

  return (
    <Suspense
      fallback={
        <button
          type="button"
          className="sh-deferred-auth"
          disabled
        >
          Loading...
        </button>
      }
    >
      <AuthProvider>
        <AuthButton />
      </AuthProvider>
    </Suspense>
  );
}

export default DeferredAuth;
