"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { fetchUserAttributes } from "aws-amplify/auth";

export default function SponsorReportsPage() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [sponsorCompany, setSponsorCompany] = useState<string | null>(null);

    const [reportType, setReportType] = useState("driver-tracking");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [driverEmail, setDriverEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [connectedDrivers, setConnectedDrivers] = useState<string[]>([]);
    const [auditLogType, setAuditLogType] = useState("driver-applications");

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

    const handleDownload = async () => {
        setLoading(true);
        try {
            if (!sponsorCompany) {
                alert("Sponsor company not found.");
                return;
            }

            // Get sponsorCompanyID from your /companies endpoint using the name
            const companyRes = await fetch(`https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies`);
            const companies = await companyRes.json();

            const match = companies.find((c: any) => c.company_name === sponsorCompany);
            if (!match) {
                alert("Sponsor company ID not found.");
                return;
            }

            const sponsorCompanyID = match.id;
            console.log("Download Params", {
                reportType,
                sponsorCompanyID,
                startDate,
                endDate,
            });

            const query = new URLSearchParams({
                reportType,
                sponsorCompanyID: sponsorCompanyID,
                startDate,
                endDate,
                ...(reportType === "audit-log" && { auditLogType })
            });


            const res = await fetch(`https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/reports/sponsor?${query.toString()}`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            const data = await res.json();


            if (data.downloadUrl) {
                window.open(data.downloadUrl, "_blank");
            } else {
                alert("Failed to generate report.");
            }
        } catch (err) {
            alert("Error downloading report.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchConnectedDrivers = async () => {
            if (!sponsorCompany) return;

            try {
                // Fetch all companies to get the sponsorCompanyID
                const companyRes = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies");
                const companies = await companyRes.json();
                const match = companies.find((c: any) => c.company_name === sponsorCompany);

                if (!match) {
                    console.warn("Sponsor company ID not found.");
                    return;
                }

                //Fetch connected drivers
                const driverRes = await fetch(`https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/drivers?sponsorCompanyName=${encodeURIComponent(sponsorCompany)}`);
                const driverData = await driverRes.json();
                const driverEmails = driverData.map((d: any) => d.driverEmail);

                setConnectedDrivers(driverEmails);
                console.log("Updated connectedDrivers state:", driverEmails); // ← this will log actual state values!


            } catch (err) {
                console.error("Error fetching connected drivers:", err);
            }
        };

        fetchConnectedDrivers();
    }, [sponsorCompany]);

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
                                <Link href="/sponsor/home">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Home</button>
                                </Link>
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
                                <button className="bg-blue-600 px-4 py-2 rounded text-white">Reports</button>
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
                                . You can view your reports below.
                            </p>
                            <div className="mb-4">
                                <label className="block font-semibold mb-1">Report Type</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="driver-tracking">Driver Point Tracking</option>
                                    <option value="audit-log">Audit Log</option>
                                </select>
                            </div>
                            {reportType === "audit-log" && (
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Audit Log Type</label>
                                    <select
                                        value={auditLogType}
                                        onChange={(e) => setAuditLogType(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="driver-applications">Driver Applications</option>
                                        <option value="point-changes">Point Changes</option>
                                        <option value="password-changes">Password Changes</option>
                                        <option value="login-attempts">Login Attempts</option>
                                    </select>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block font-semibold mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-semibold mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>

                            {reportType === "driver-tracking" && (
                                <div className="mb-4">
                                    <label className="block font-semibold mb-1">Driver Email (optional)</label>
                                    <select
                                        value={driverEmail}
                                        onChange={(e) => setDriverEmail(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="">All Drivers</option>
                                        {connectedDrivers.map((email) => (
                                            <option key={email} value={email}>
                                                {email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                            >
                                {loading ? "Generating..." : "Download Report"}
                            </button>
                        </main>
                    </div>
                );
            }}
        </Authenticator>
    );
}
