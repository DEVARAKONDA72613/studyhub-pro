import { useState, useEffect } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from "../utils/notifications";

function NotificationPrompt() {
  const [permission, setPermission] = useState("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  if (!isNotificationSupported() || dismissed) return null;

  if (permission === "denied") {
    return (
      <div className="notice">
        <span className="muted small">
          Notifications are blocked. To turn them on, open your browser's site settings for this
          page and allow notifications, then refresh.
        </span>
        <button className="btn btn-alt btn-sm" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    );
  }

  if (permission !== "default") return null;

  const handleEnable = async () => {
    setPermission(await requestNotificationPermission());
  };

  return (
    <div className="notice">
      <span className="l">Get notified about new messages and note updates when this tab isn't focused.</span>
      <span className="btnrow">
        <button className="btn btn-sm" onClick={handleEnable}>
          Enable notifications
        </button>
        <button className="btn btn-alt btn-sm" onClick={() => setDismissed(true)}>
          Not now
        </button>
      </span>
    </div>
  );
}

export default NotificationPrompt;
