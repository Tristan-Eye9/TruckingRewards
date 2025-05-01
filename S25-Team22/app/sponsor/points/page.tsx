"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { notDeepStrictEqual } from "assert";

interface Driver {
    name: string;
    email: string;
    currPoints: number;
    pointChange: number;
    reason: string;
    newTotal: number;
}

export default function PointsSponsorPage() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [sponsorCompanyName, setSponsorCompanyName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [sponsorCompanyID, setSponsorCompanyID] = useState<number | null>(null);

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

    // Fetch connected drivers and their points
    const fetchDrivers = async (sponsorCompanyName: string) => {
        try {
            const response = await fetch(
                `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/drivers?sponsorCompanyName=${sponsorCompanyName}`
            );
            const data = await response.json();

            if (!Array.isArray(data)) {
                console.log("Expected an array but got:", data);
                return;
            }

            const enrichedDrivers = await Promise.all(

                data.map(async (driver: any) => {
                    console.log(driver);

                    const pointsRes = await fetch(
                        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/points/total?email=${driver.driverEmail}&sponsorCompanyID=${driver.sponsorCompanyID}`
                    );
                    const pointData = await pointsRes.json();

                    return {
                        name: driver.fullName,
                        email: driver.driverEmail,
                        currPoints: pointData.totalPoints ?? 0,
                        pointChange: 0,
                        reason: '',
                        newTotal: pointData.totalPoints ?? 0,
                    };
                })
            );

            setDrivers(enrichedDrivers);
        } catch (error) {
            console.error("Error fetching driver info:", error);
        }
    };

    // Initialize user info and company
    useEffect(() => {
        const fetchInfo = async () => {
            try {
                // Get Cognito user info
                const user = await getCurrentUser();
                const email = user.signInDetails?.loginId || "";
                setUserEmail(email);

                // Get sponsor company name from Cognito Attribute
                const attributes = await fetchUserAttributes();
                const companyName = attributes["custom:sponsorCompany"];
                setSponsorCompanyName(companyName || null);

                if (!companyName) {
                    throw new Error("Sponsor company name not found in user attributes.");
                }

                // Fetch all companies to get the ID from name 
                const companyIDRes = await fetch(
                    `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies`
                );
                const companies = await companyIDRes.json();

                const matchedCompany = companies.find(
                    (company: any) => company.company_name === companyName
                );

                const companyID = matchedCompany?.id;

                if (!companyID) {
                    throw new Error("Sponsor company ID not found.");
                }

                // Store both name and ID in state
                setSponsorCompanyID(companyID);

                // Fetch drivers using the sponsor company name (still needed here)
                fetchDrivers(companyName);

            } catch (err) {
                console.error("Error loading user or sponsor company info:", err);
            }
        };

        fetchInfo();
    }, []);


    const handlePointChange = async (index: number, pointDelta: number, reason: string) => {
        if (!reason.trim()) {
            alert("Please provide a reason.");
            return;
        }

        const driver = drivers[index];

        try {
            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: driver.email,
                    points: pointDelta,
                    description: reason,
                    sponsorCompanyID: sponsorCompanyID,
                }),
            });

            if (res.ok) {
                // triger notification for driver
                const notifName = pointDelta >= 0 ? "points_added" : "points_removed";
                const notifDesc = `Your account has ${pointDelta >= 0 ? "gained" : "lost"
                    } ${Math.abs(pointDelta)} points. Reason: ${reason}`;
                fetch(
                    "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/notifications",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userEmail: driver.email,
                            notifName,
                            notifDesc,
                        }),
                    }
                ).catch((error) => console.error("Notif delivery failed:", error));
                alert("Points updated successfully.");
                fetchDrivers(sponsorCompanyName!); // Refresh driver info
            } else {
                const error = await res.json();
                console.error("Point update failed:", error);
                alert("Failed to update points.");
            }
        } catch (error) {
            console.error("Error sending point update:", error);
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
                    router.push("/profile");
                };

                return (
                    <div className="flex flex-col h-screen">
                        {/* Navigation Bar */}
                        <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
                            <div className="flex gap-4">
                                <Link href="/sponsor/home">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Home
                                    </button>
                                </Link>
                                <Link href="/aboutpage">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        About Page
                                    </button>
                                </Link>
                                <Link href="/sponsor/sponsor_cat">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Catalog
                                    </button>
                                </Link>
                                <button className="bg-blue-600 px-4 py-2 rounded hover:bg-gray-600">
                                    Points
                                </button>
                                <Link href="/sponsor/sponsor_app">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Application
                                    </button>
                                </Link>
                                <Link href="/sponsor/addUsers">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Add Users
                                        </button>
                                </Link>
                                <Link href="/sponsor/sponsor_reports">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Reports
                                        </button>
                                </Link>
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="cursor-pointer text-2xl"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <FaUserCircle />
                                </div>

                                {dropdownOpen && (
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
                        </nav>

                        {/* Main Content */}
                        <main className="flex-grow flex flex-col items-center justify-center p-10">
                            <h1 className="text-5xl font-light mb-4 text-center">
                                Welcome, {user?.signInDetails?.loginId || "No email found"}
                            </h1>
                            <p>Hello Mother Trucker! Below shows your drivers and their points!</p>

                            {/* Sponsor Company Information Table */}
                            <div className="w-full max-w-4xl">
                                <h2 className="text-2xl font-semibold text-center mb-4">Sponsor Points Dashboard</h2>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-2">Driver Email</th>
                                            <th className="border border-gray-300 px-4 py-2">Current Points</th>
                                            <th className="border border-gray-300 px-4 py-2">Point Change (+/-)</th>
                                            <th className="border border-gray-300 px-4 py-2">Reason for Change</th>
                                            <th className="border border-gray-300 px-4 py-2">New Total Points</th>
                                            <th className="border border-gray-300 px-4 py-2">Apply</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map((driver, index) => (
                                            <tr key={index} className="text-center">
                                                <td className="border px-4 py-2">{driver.email}</td>
                                                <td className="border px-4 py-2">{driver.currPoints}</td>
                                                <td className="border px-4 py-2">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        className="w-20 p-1 border rounded text-center"
                                                        value={driver.pointChange}
                                                        onChange={(e) => {
                                                            const newVal = parseInt(e.target.value, 10) || 0;
                                                            setDrivers((prev) => {
                                                                const updated = [...prev];
                                                                updated[index].pointChange = newVal;
                                                                updated[index].newTotal = updated[index].currPoints + newVal;
                                                                return updated;
                                                            });
                                                        }}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <textarea
                                                        rows={1}
                                                        className="w-full p-1 border rounded resize-y overflow-hidden"
                                                        value={driver.reason}
                                                        onChange={(e) => {
                                                            const newVal = e.target.value;
                                                            setDrivers((prev) => {
                                                                const updated = [...prev];
                                                                updated[index].reason = newVal;
                                                                return updated;
                                                            });

                                                            // Auto expand textarea height
                                                            const textarea = e.target as HTMLTextAreaElement;
                                                            textarea.style.height = 'auto';
                                                            textarea.style.height = textarea.scrollHeight + 'px';
                                                        }}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {driver.pointChange >= 0
                                                        ? `${driver.currPoints}+${driver.pointChange}`
                                                        : driver.newTotal}
                                                </td>

                                                <td className="border px-4 py-2">
                                                    <button
                                                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                                                        onClick={() => handlePointChange(index, driver.pointChange, driver.reason)}
                                                    >
                                                        Apply
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
