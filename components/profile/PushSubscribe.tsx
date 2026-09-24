"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

// Push API wants the VAPID key as a Uint8Array, not the base64url string it's shipped as.
function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on";

export function PushSubscribe() {
  const showToast = useUiStore((s) => s.showToast);
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function checkSupport() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "on" : "off");
      } catch {
        setStatus("unsupported");
      }
    }
    checkSupport();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        showToast("Notifications permission was not granted", "error");
        return;
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) {
        showToast("Notifications aren't configured yet", "error");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const res = await fetch("/api/me/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("on");
      showToast("Notifications enabled", "success");
    } catch {
      showToast("Could not enable notifications", "error");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/me/push-subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("off");
      showToast("Notifications disabled", "success");
    } catch {
      showToast("Could not disable notifications", "error");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-pt-border bg-pt-black-soft p-4">
      <div>
        <p className="text-sm font-medium text-pt-cream">Push Notifications</p>
        <p className="text-xs text-pt-muted mt-0.5">
          {status === "on"
            ? "You'll get notified about new rides, birthdays, and review reminders."
            : "Turn on to get notified about new rides, birthdays, and review reminders."}
        </p>
      </div>
      <Button type="button" size="sm" variant={status === "on" ? "outline" : "primary"} disabled={busy} onClick={status === "on" ? disable : enable}>
        {status === "on" ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
