"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";

type NotifKey =
  | "accepted_by_sponsor"
  | "dropped_by_sponsor"
  | "points_changed"
  | "order_placed"
  | "order_issue";

const DISPLAY_NAMES: Record<NotifKey, string> = {
  accepted_by_sponsor:   "Accepted/Added by sponsor/admin",
  dropped_by_sponsor:    "Dropped by sponsor/admin",
  points_changed:        "Points added/removed",
  order_placed:          "Order placed summary",
  order_issue:           "Order issue/problem",
};

const ALWAYS_ON: NotifKey[] = [
  "accepted_by_sponsor",
  "dropped_by_sponsor",
];

export default function NotificationSetPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<NotifKey, boolean>>({
    accepted_by_sponsor: true,
    dropped_by_sponsor:  true,
    points_changed:      true,
    order_placed:        true,
    order_issue:         true,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // fetch Cognito email & then load settings from your API
  useEffect(() => {
    (async () => {
      const attrs = await fetchUserAttributes();
      const email = attrs.email ?? null;
      setUserEmail(email);
      if (!email) return;

      // GET existing settings
      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications/settings?userEmail=${encodeURIComponent(
          email
        )}`
      );
      if (!res.ok) {
        console.error("Failed to load notification settings");
      } else {
        const data: { notifName: string; enabled: boolean }[] = await res.json();
        // merge into state
        const next = { ...settings };
        data.forEach((row) => {
          if (row.notifName in next) {
            next[row.notifName as NotifKey] = row.enabled;
          }
        });
        setSettings(next);
      }

      setLoading(false);
    })();
  }, []);

  /* may need this to fix build
  useEffect(() => {
  (async () => {
    try {
      const attrs = await fetchUserAttributes();
      const email = attrs.email ?? null;
      setUserEmail(email);
      if (!email) return;

      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications/settings?userEmail=${encodeURIComponent(
          email
        )}`
      );
      if (!res.ok) {
        console.error("Failed to load notification settings");
      } else {
        const data: { notifName: string; enabled: boolean }[] = await res.json();
        const next = { ...settings };
        data.forEach((row) => {
          if (row.notifName in next) {
            next[row.notifName as NotifKey] = row.enabled;
          }
        });
        setSettings(next);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading notification settings:", err);
    }
  })();
}, []);
 */

  const toggle = async (key: NotifKey) => {
    if (!userEmail) return;
    const newVal = !settings[key];
    // PATCH right away
    await fetch(
      `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          notifName: key,
          enabled: newVal,
        }),
      }
    );
    setSettings((s) => ({ ...s, [key]: newVal }));
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <ul className="space-y-3">
              {(Object.keys(DISPLAY_NAMES) as NotifKey[]).map((key) => (
                <li key={key} className="flex items-center justify-between">
                  <label className="flex-1">{DISPLAY_NAMES[key]}</label>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    disabled={ALWAYS_ON.includes(key)}
                    onChange={() => toggle(key)}
                  />
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => {
              router.replace("/driver/home");
            }}
            className="mt-8 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Home
          </button>
          <button
            onClick={() => {
              signOut?.();
              router.replace("/");
            }}
            className="mt-8 bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      )}
    </Authenticator>
  );
}

