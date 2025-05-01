"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { fetchUserAttributes } from "aws-amplify/auth";
import { appendFile } from "fs";

export default function AdminApplicationsPage() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [reasons, setReasons] = useState<{ [key: number]: string }>({});
    const [selectedStatuses, setSelectedStatuses] = useState<{ [key: number]: string }>({});

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/admin/applications");
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            console.log("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appID: number) => {
        const newStatus = selectedStatuses[appID];
        const reason = reasons[appID] || "";

        if (!newStatus) {
            alert("Please select a status.");
            return;
        }

        console.log("Sending update:", { appID, newStatus, reason });

        try {
            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appID, newStatus, reason }),
            });

            const text = await res.text();
            console.log("Response:", res.status, text);

            if (res.ok) {
                await fetchApplications();
            } else {
                alert("Failed to update. Please check the console for details.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Error submitting update.");
        }
    };

    useEffect(() => {
        fetchApplications();
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
                                <Link href="/admin/home">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Home</button>
                                </Link>
                                <Link href="/aboutpage">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">About Page</button>
                                </Link>
                                <Link href="/admin/admin_cat">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Catalog</button>
                                </Link>
                                <button className="bg-blue-600 px-4 py-2 rounded text-white">Application</button>
                                <Link href="/admin/addUsers">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Add Users</button>
                                </Link>
                                <Link href="/admin/reports">
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
                                Hello Admin, {user?.signInDetails?.loginId || "No email found"}
                            </h1>
                            <p className="text-lg text-center mb-8">
                                Please review all incoming applications below as you please!
                            </p>
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <table className="min-w-full border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border px-4 py-2">Full Name</th>
                                            <th className="border px-4 py-2">Email</th>
                                            <th className="border px-4 py-2">Date Submitted</th>
                                            <th className="border px-4 py-2">Status</th>
                                            <th className="border px-4 py-2">Actions</th>
                                            <th className="border px-4 py-2">Reason</th>
                                            <th className="border px-4 py-2">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app: any) => (
                                            <tr key={app.appID}>
                                                <td className="border px-4 py-2">{app.fullName}</td>
                                                <td className="border px-4 py-2">{app.driverEmail}</td>
                                                <td className="border px-4 py-2">{new Date(app.submitted_at).toLocaleDateString()}</td>
                                                <td className="border px-4 py-2">{app.status}</td>
                                                <td className="border px-4 py-2">
                                                    {app.status === 'submitted' ? (
                                                        <>
                                                            <select
                                                                value={selectedStatuses[app.appID] || ""}
                                                                onChange={(e) =>
                                                                    setSelectedStatuses((prev) => ({
                                                                        ...prev,
                                                                        [app.appID]: e.target.value,
                                                                    }))
                                                                }
                                                                className="border rounded px-2 py-1 mr-2"
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="accepted">Accept</option>
                                                                <option value="rejected">Reject</option>
                                                            </select>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500 italic capitalize">{app.status}</span>
                                                    )}
                                                </td>

                                                <td className="border px-4 py-2">
                                                    {app.status === 'submitted' ? (
                                                        <input
                                                            type="text"
                                                            placeholder="Enter reason"
                                                            value={reasons[app.appID] || ""}
                                                            onChange={(e) =>
                                                                setReasons((prev) => ({ ...prev, [app.appID]: e.target.value }))
                                                            }
                                                            className="border p-1 rounded w-full"

                                                        />
                                                    ) : (
                                                        app.reason || "-"
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {app.status === 'submitted' ? (
                                                        <button
                                                            onClick={() => updateStatus(app.appID)}
                                                            disabled={!selectedStatuses[app.appID]}
                                                            className={`px-3 py-1 rounded ${selectedStatuses[app.appID]
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            Submit
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-500 italic capitalize">{app.status}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </main>
                    </div>
                );
            }}
        </Authenticator>
    );
}
