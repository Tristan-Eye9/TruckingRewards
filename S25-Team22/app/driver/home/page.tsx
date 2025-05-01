"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { fetchUserAttributes } from "aws-amplify/auth";

interface Notification {
  id:string;
  message: string;
  isRead: boolean;
}

export default function HomePage() {
  const router = useRouter();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sponsorData, setSponsorData] = useState<
    { sponsorCompanyName: string; totalPoints: number }[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When the page mounts, check if impersonation is active via localStorage.
  useEffect(() => {
    const impersonatedEmail = localStorage.getItem("impersonatedDriverEmail");
    if (impersonatedEmail) {
      setUserEmail(impersonatedEmail);
    } else {
      // Otherwise get email from Cognito.
      const getUserAttributes = async () => {
        try {
          const attributes = await fetchUserAttributes();
          const email = attributes.email;
          setUserEmail(email || null);
        } catch (err) {
          console.error("Error fetching user attributes:", err);
        }
      };
      getUserAttributes();
    }
  }, []);
  
  // Close icon dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (profileOpen && profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false);
      }
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(t)) {
        setNotificationsOpen(false);
      }
    };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      }
  }, [profileOpen, notificationsOpen]);

  // Fetch sponsor data using userEmail (which might be impersonated)
  useEffect(() => {
    const getSponsorData = async () => {
      try {
        if (!userEmail) {
          return;
        }
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/points?email=${userEmail}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch sponsor data");
        }
        const data: any[] = await res.json();
        console.log("Data returned from API:", data);
        if (!data || data.length === 0) {
          setSponsorData(null);
        } else {
          const groupedData = data.reduce<Record<string, number>>((acc, record) => {
            const sponsorName = record.sponsorCompanyName;
            const points = Number(record.totalPoints ?? record.points);
            if (acc[sponsorName] !== undefined) {
              acc[sponsorName] += points;
            } else {
              acc[sponsorName] = points;
            }
            return acc;
          }, {});
          const sponsorArray = Object.entries(groupedData).map(([sponsorCompanyName, points]) => ({
            sponsorCompanyName,
            totalPoints: points,
          }));
          setSponsorData(sponsorArray);
        }
      } catch (err) {
        console.error("Error fetching sponsor info:", err);
        setError("Could not load sponsor info.");
      } finally {
        setLoading(false);
      }
    };

    getSponsorData();
  }, [userEmail]);

  // fetch notifications for driver user
  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications?userEmail=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Array<{
          notifID: number;
          notifDesc: string;
          is_read: 0 | 1;
        }> = await res.json();
        setNotifications(
          data.map(n => ({
            id: String(n.notifID),
            message: n.notifDesc,
            isRead: n.is_read === 1
          }))
        );
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    })();
  }, [userEmail]);

  // helper to mark a single notification as read
 const markAsRead = async (notifID: string) => {
     try {
       const res = await fetch(
         `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications/${notifID}/read`,
         { method: "PATCH" }
       );
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       // update local state
       setNotifications((prev) =>
         prev.map((n) =>
           n.id === notifID
             ? { ...n, isRead: true }
             : n
         )
       );
     } catch (err) {
       console.error("Failed to mark read:", err);
     }
   };

  // Handler for "Stop Impersonation" button: clear localStorage and reload page.
  const handleStopImpersonation = () => {
    localStorage.removeItem("impersonatedDriverEmail");
    router.replace("/sponsor/home");
  };

  return (
    <Authenticator>
      {({ signOut, user }) => {
        const handleSignOut = () => {
          signOut?.();
          router.replace("/");
        };

        const handleProfileClick = () => {
          router.push("/profile"); // Navigate to the profile page
        };

        const handleSettingsClick = () => {
          router.push("/driver/notifications_set"); // Navigate to the notification settings page
        };

        return (
          <div className="flex flex-col h-screen">
            {/* Impersonation Banner */}
            {localStorage.getItem("impersonatedDriverEmail") && (
              <div className="bg-yellow-200 p-4 text-center">
                <p className="text-lg font-semibold">
                  You are impersonating{" "}
                  <span className="underline">{localStorage.getItem("impersonatedDriverEmail")}</span>.
                </p>
                <button onClick={handleStopImpersonation} className="mt-2 bg-red-500 text-white px-4 py-1 rounded">
                  Stop Impersonation
                </button>
              </div>
            )}

            {/* Navigation Bar */}
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex gap-4">
                <button className="bg-blue-600 px-4 py-2 rounded text-white">
                  Home
                </button>
                <Link href="/aboutpage">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    About Page
                  </button>
                </Link>
                <Link href="/driver/driver_cat">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Catalog
                  </button>
                </Link>
                <Link href="/driver/points">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Points
                  </button>
                </Link>
                <Link href="/driver/driver_app">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Application
                  </button>
                </Link>
              </div>

              {/* Icons */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <FaBell
                    className="cursor-pointer text-2xl"
                    onClick={() => setNotificationsOpen(o => !o)}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-lg max-h-60 overflow-y-auto z-50">
                      <button
                      onClick={handleSettingsClick}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Notification Settings
                      </button>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-2">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`border-b px-4 py-2 cursor-pointer ${n.isRead ? "opacity-50" : "bg-gray-100 hover:bg-gray-200"}`}
                            onClick={() => markAsRead(n.id)}
                          >
                            <p className="text-sm">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile*/}
              <div className="relative" ref={profileRef}>
                <FaUserCircle
                  className="cursor-pointer text-2xl"
                  onClick={() => setProfileOpen(o => !o)}
                />

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                    <button
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-10">
              <h1 className="text-5xl font-light mb-4 text-center">
                Welcome, {userEmail || user?.signInDetails?.loginId || "No email found"}
              </h1>
              <p className="text-lg text-center mb-8">
                You are logged in as a driver, a true Mother Trucker! You can view your sponsor(s) below.
                Don't have a sponsor yet? Click the 'Application' tab to fill out your application.
              </p>

              {/* Sponsor Company Information Table */}
              {loading ? (
                <p className="text-center text-lg">Loading sponsor information...</p>
              ) : error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : sponsorData && sponsorData.length > 0 ? (
                <div className="w-full max-w-lg">
                  <h2 className="text-2xl font-semibold text-center mb-4">Sponsor Info</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Sponsor Company</th>
                        <th className="border border-gray-300 px-4 py-2">Total Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorData.map((sponsor, idx) => (
                        <tr key={idx} className="text-center">
                          <td className="border border-gray-300 px-4 py-2">{sponsor.sponsorCompanyName}</td>
                          <td className="border border-gray-300 px-4 py-2">{sponsor.totalPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-lg">
                  You are not currently connected to a sponsor company. Please click the “Application” tab above to apply.
                </p>
              )}

            </main>
          </div>
        );
      }}
    </Authenticator>
  );
}
