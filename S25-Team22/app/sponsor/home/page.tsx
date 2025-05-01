"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { fetchUserAttributes } from "aws-amplify/auth";

interface Driver {
  email: string;
  points: number;
  sponsorCompanyID: number;
}

export default function HomePage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sponsorCompany, setSponsorCompany] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Fetch user email & sponsor company on component mount
  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          setUserEmail(attributes.email);
        }
        if (attributes["custom:sponsorCompany"]) {
          setSponsorCompany(attributes["custom:sponsorCompany"]);
        }
      } catch (error) {
        console.error("Error fetching user attributes:", error);
      }
    };

    getUserAttributes();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const fetchSponsorDriverData = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || null;
        const sponsorCompanyName = attributes["custom:sponsorCompany"] || null;

        setUserEmail(email);
        setSponsorCompany(sponsorCompanyName);

        if (!sponsorCompanyName) {
          throw new Error("Sponsor company not found in user attributes.");
        }

        // Get list of connected drivers
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/drivers?sponsorCompanyName=${encodeURIComponent(
            sponsorCompanyName
          )}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch drivers");
        }

        const driverList = await res.json();

        // For each driver, get total points from the new endpoint
        const enrichedDrivers = await Promise.all(
          driverList.map(async (driver: any) => {
            const pointsRes = await fetch(
              `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/points/total?email=${driver.driverEmail}&sponsorCompanyID=${driver.sponsorCompanyID}`
            );
            const pointData = await pointsRes.json();

            return {
              email: driver.driverEmail,
              points: pointData.totalPoints ?? 0,
              sponsorCompanyID: driver.sponsorCompanyID,
            };
          })
        );

        setDrivers(enrichedDrivers);
      } catch (err) {
        console.error("Error fetching sponsor driver info:", err);
      }
    };

    fetchSponsorDriverData();
  }, []);

  // Handler for impersonation button
  const handleImpersonate = (driverEmail: string) => {
    // Store impersonation in localStorage.
    localStorage.setItem("impersonatedDriverEmail", driverEmail);
    alert(`You are now impersonating ${driverEmail}. You will see the site as that driver.`);
    // Redirect to the driver home page.
    router.push("/driver/home");
  };

  const handleRemoveDriver = async (driverEmail: string, sponsorCompanyID: number) => {
    if (
      !confirm(
        `Remove ${driverEmail} from sponsor "${sponsorCompany}"?`
      )
    )
      return;

    try {
      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/relation?driverEmail=${encodeURIComponent(
          driverEmail
        )}&sponsorCompanyID=${sponsorCompanyID}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.text();
        throw Error(err);
      }
      // notification sent for driver notifications
      await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: driverEmail,
            notifName: "dropped_by_sponsor",
            notifDesc: `You have been removed from sponsor "${sponsorCompany}".`
          }),
        }
      );
      // remove from UI
      setDrivers((ds) => ds.filter((d) => d.email !== driverEmail));
    } catch (err: any) {
      console.error("Failed to remove driver:", err);
      alert(`Error: ${err.message}`);
    }
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

        return (
          <div className="flex flex-col h-screen">
            {/* Navigation Bar */}
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex gap-4">
                <button className="bg-blue-600 px-4 py-2 rounded text-white">Home</button>
                <Link href="/aboutpage">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">About Page</button>
                </Link>
                <Link href="/sponsor/sponsor_cat">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Catalog</button>
                </Link>
                <Link href="/sponsor/points">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Points</button>
                </Link>
                <Link href="/sponsor/sponsor_app">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Application</button>
                </Link>
                <Link href="/sponsor/addUsers">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Add Users</button>
                </Link>
                <Link href="/sponsor/sponsor_reports">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Reports</button>
                </Link>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="cursor-pointer text-2xl" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FaUserCircle />
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                    <button onClick={handleProfileClick} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                      My Profile
                    </button>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-10">
              <h1 className="text-5xl font-light mb-4 text-center">
                Welcome, {userEmail || user?.signInDetails?.loginId || "No email found"}
              </h1>
              <p className="text-lg text-center mb-8">
                You are logged in as a sponsor for{" "}
                <span className="font-semibold">
                  {sponsorCompany ? sponsorCompany : "an unknown company"}
                </span>
                . You can view your company's information below.
              </p>

              {/* Driver Information Table */}
              <div className="w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-center mb-4">Your Company's Drivers</h2>
                <p className="mb-4 text-center text-sm italic">
                  Click "Impersonate" to see the site as that driver. The sponsor will assume the driver's view
                  and be able to perform any operations available to them.
                </p>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Driver Email</th>
                      <th className="border border-gray-300 px-4 py-2">Points</th>
                      <th className="border border-gray-300 px-4 py-2">Impersonate</th>
                      <th className="border border-gray-300 px-4 py-2">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver, index) => (
                      <tr key={index} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">{driver.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{driver.points}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleImpersonate(driver.email)}
                          >
                            Impersonate
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                            onClick={() => handleRemoveDriver(driver.email, driver.sponsorCompanyID)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        );
      }}
    </Authenticator>
  );
}
