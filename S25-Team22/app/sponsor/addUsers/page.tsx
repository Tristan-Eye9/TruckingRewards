"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import { fetchUserAttributes, signOut, signUp } from "aws-amplify/auth";
import { FaUserCircle } from "react-icons/fa";

export default function SponsorAddPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"sponsor" | "driver">("sponsor");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [sponsorCompany, setSponsorCompany] = useState<string | null>(null); // Sponsor's company
    const [sponsorCompanyID, setSponsorCompanyID] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const attrs = await fetchUserAttributes();
                const r = attrs["custom:role"] ?? null;
                const c = attrs["custom:sponsorCompany"] ?? null;
                setUserRole(r);
                setSponsorCompany(c);
                if (r !== "Sponsor") {
                    alert("Access Denied");
                    router.replace("/");
                }
                if (c) {
                    const response = await fetch(
                        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies`
                    );
                    const all = await response.json();
                    const found = all.find((company: any) => company.company_name === c);
                    if (found?.id) {
                        setSponsorCompanyID(found.id);
                    } else {
                        console.error("Could not find sponsor company ID");
                    }
                }
            } catch (err) {
                console.error(err);
                router.replace("/");
            }
        })();
    }, [router]);

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

    async function signUpUser(userRole: "Sponsor" | "Driver") {
        try {
            await signUp({
                username: email,
                password: "TempPass!123",
                options: {
                    userAttributes: {
                        email, name,
                        "custom:role": userRole,
                        "custom:sponsorCompany": sponsorCompany!
                    }
                }
            });
            return true;
        } catch (err: any) {
            setMessage("Cognito error: " + err.message);
            return false;
        }
    }

    async function addToDB(userRole: "Sponsor" | "Driver") {
        if (sponsorCompanyID == null) {
            setMessage("Cannot add to DB: missing sponsor company ID");
            return false;
        }
        try {
            const res = await fetch(
                "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    userType: userRole,
                }),
            });
            return res.ok;
        } catch (err) {
            setMessage("DB error: " + err);
        }
    }

    /** Handle Form Submission */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage(null);
        if (!name || !email) { setMessage("Name & email required"); return; }
        const userRole = mode === "sponsor" ? "Sponsor" : "Driver";
        if (!(await signUpUser(userRole))) return;
        await addToDB(userRole);
    }

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
                            <div className="flex space-x-4">
                                <Link href="/sponsor/home">
                                    <button className="bg-gray-700 px-4 py-2 rounded text-white">
                                        Home</button>
                                </Link>
                                <Link href="/aboutpage">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        About Page</button>
                                </Link>

                                <Link href="/sponsor/sponsor_cat">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Catalog</button>
                                </Link>
                                <Link href="/sponsor/points">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Points</button>
                                </Link>
                                <Link href="/sponsor/sponsor_app">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Application</button>
                                </Link>
                                <button className="bg-blue-600 px-4 py-2 rounded hover:bg-gray-600">
                                    Add Users</button>
                                <Link href="/sponsor/sponsor_reports">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Reports</button>
                                </Link>
                            </div>
                            {/* Profile Dropdown */}
                            <div className="space-x-4">
                                <button
                                    className={`px-3 py-1 rounded ${mode === "sponsor" ? "bg-blue-600" : "bg-gray-700"}`}
                                    onClick={() => setMode("sponsor")}
                                >Add Sponsor</button>
                                <button
                                    className={`px-3 py-1 rounded ${mode === "driver" ? "bg-blue-600" : "bg-gray-700"}`}
                                    onClick={() => setMode("driver")}
                                >Add Driver</button>
                            </div>
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

                        {/* New User Add Panel */}
                        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                            <h1 className="text-3xl font-bold mb-6">Add Sponsors/Drivers to Your Sponsor Company</h1>
                            <h2 className="text-2xl mb-4"> Add {mode === "sponsor" ? "Sponsor" : "Driver"} to your company.</h2>
                            {/* New User Addition Form */}
                            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                                {message && <div className="mb-3 text-red-600">{message}</div>}
                                <label className="block text-lg font-semibold mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded mb-4"
                                />

                                <label className="block text-lg font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter user's email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded mb-4"
                                />

                                <label className="block text-lg font-semibold mb-2">Sponsor Company</label>
                                <input
                                    type="text"
                                    value={sponsorCompany || ""}
                                    readOnly // Auto-filled, read-only
                                    className="w-full p-2 border bg-gray-300 rounded mb-4 cursor-not-allowed"
                                />

                                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Create {mode === "sponsor" ? "Sponsor" : "Driver"}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            }}
        </Authenticator>
    );

}

