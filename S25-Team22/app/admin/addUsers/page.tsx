"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import { fetchUserAttributes, signUp } from "aws-amplify/auth";
import { FaUserCircle } from "react-icons/fa";

interface SponsorCompany {
    company_name: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [selectedRole, setSelectedRole] = useState("Driver");
    const [sponsorCompany, setSponsorCompany] = useState("");
    const [newSponsorCompany, setNewSponsorCompany] = useState("");
    const [sponsorCompanies, setSponsorCompanies] = useState<SponsorCompany[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false);

    // Role check
    useEffect(() => {
        (async () => {
            try {
                const attrs = await fetchUserAttributes();
                const role = attrs["custom:role"] || null;
                setUserRole(role);
                if (role !== "Admin") {
                    alert("Access Denied");
                    router.replace("/");
                }
            } catch {
                router.replace("/");
            }
        })();
    }, [router]);

    // Sponsor dropdown close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    useEffect(() => {
        const fetchSponsorCompanies = async () => {
            try {
                const response = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies");
                const data: SponsorCompany[] = await response.json();
                setSponsorCompanies(data);
            } catch (err) {
                console.error("Error fetching sponsor companies:", err);
            }
        };
        fetchSponsorCompanies();
    }, []);

    const addNewSponsorCompany = async () => {
        try {
            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_name: newSponsorCompany }),
            });

            if (!res.ok) throw new Error("Failed to add new sponsor company");

            setSponsorCompanies([...sponsorCompanies, { company_name: newSponsorCompany }]);
            setSponsorCompany(newSponsorCompany);
            setNewSponsorCompany("");
            setIsCreatingNewCompany(false);
        } catch (err) {
            console.error("Sponsor creation error:", err);
            setMessage("Error creating sponsor company.");
        }
    };

    const createUserInCognito = async (name: string, email: string, userType: string) => {
        try {
            const userAttributes: Record<string, string> = {
                email,
                name,
                "custom:role": userType,
            };
            if (userType === "Sponsor") {
                userAttributes["custom:sponsorCompany"] = sponsorCompany;
            }

            await signUp({
                username: email,
                password: "Temp123!",
                options: { userAttributes },
            });

            return true;
        } catch (err: any) {
            console.error("Cognito error:", err);
            setMessage("Error creating user in Cognito: " + err.message);
            return false;
        }
    };

    const addUserToDatabase = async (email: string, userType: string) => {
        try {
            const userPayload: any = {
                email,
                userType,
            };

            if (userType === "Sponsor") {
                userPayload.sponsorCompany = sponsorCompany;
            }

            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userPayload),
            });

            if (!res.ok) throw new Error("Failed to add user to database");

            // If Driver has a selected sponsor company, create connection
            if (userType === "Driver" && sponsorCompany) {
                try {
                    console.log("Fetching sponsor companies to match name:", sponsorCompany);
                    const getCompanyRes = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies");
                    const allCompanies: { id: string; company_name: string }[] = await getCompanyRes.json();
                    const match = allCompanies.find((c) => c.company_name === sponsorCompany);

                    if (match?.id) {
                        console.log("Matched sponsorCompanyID:", match.id);

                        const payload = {
                            driverEmail: email,
                            sponsorCompanyID: match.id,
                        };

                        console.log("Sending relation payload:", payload);

                        const connectRes = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/relation", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });

                        console.log("Relation response status:", connectRes.status);
                        if (!connectRes.ok) {
                            const errText = await connectRes.text();
                            console.error("Sponsor connection failed:", errText);
                            setMessage("User added, but sponsor connection failed.");
                        }
                    } else {
                        console.warn("Sponsor company not found in DB:", sponsorCompany);
                    }
                } catch (err) {
                    console.error("Error during sponsor-driver connection:", err);
                    setMessage("User added, but failed to link driver to sponsor.");
                }
            }


            setMessage(`${email} added as ${userType}`);
        } catch (err: any) {
            console.error("DB error:", err);
            setMessage("Database error: " + err.message);
        }
    };

    const handleAddUser = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!email || !name) return setMessage("Name and email are required.");

        const cognitoSuccess = await createUserInCognito(name, email, selectedRole);
        if (cognitoSuccess) await addUserToDatabase(email, selectedRole);
    };

    const handleSponsorCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "new") {
            setIsCreatingNewCompany(true);
            setSponsorCompany("");
        } else {
            setIsCreatingNewCompany(false);
            setSponsorCompany(value);
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
                        <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
                            <div className="flex gap-4">
                                <Link href="/admin/home"><button className="bg-gray-700 px-4 py-2 rounded">Home</button></Link>
                                <Link href="/aboutpage"><button className="bg-gray-700 px-4 py-2 rounded">About Page</button></Link>
                                <Link href="/admin/admin_cat"><button className="bg-gray-700 px-4 py-2 rounded">Catalog</button></Link>
                                <Link href="/admin/applications">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Application</button>
                                </Link>
                                <button className="bg-blue-600 px-4 py-2 rounded">Add Users</button>
                                <Link href="/admin/reports"><button className="bg-gray-700 px-4 py-2 rounded">Reports</button></Link>
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

                        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                            <h1 className="text-3xl font-bold mb-6">Admin - Add Users</h1>
                            {message && <p className="mb-4 text-lg">{message}</p>}

                            <form onSubmit={handleAddUser} className="bg-white p-6 rounded shadow-md">
                                <label className="block mb-1 font-semibold">Full Name</label>
                                <input type="text" className="w-full p-2 border rounded mb-4" value={name} onChange={(e) => setName(e.target.value)} />

                                <label className="block mb-1 font-semibold">Email</label>
                                <input type="email" className="w-full p-2 border rounded mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />

                                <label className="block mb-1 font-semibold">Role</label>
                                <select className="w-full p-2 border rounded mb-4" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                    <option value="Driver">Driver</option>
                                    <option value="Sponsor">Sponsor</option>
                                    <option value="Admin">Admin</option>
                                </select>

                                {selectedRole === "Sponsor" && (
                                    <div>
                                        <label className="block mb-1 font-semibold">Sponsor Company</label>
                                        <select className="w-full p-2 border rounded mb-2" value={sponsorCompany} onChange={handleSponsorCompanyChange}>
                                            <option value="">Select an existing company</option>
                                            {sponsorCompanies.map((c, i) => (
                                                <option key={i} value={c.company_name}>{c.company_name}</option>
                                            ))}
                                            <option value="new">Create New Company</option>
                                        </select>

                                        {isCreatingNewCompany && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    value={newSponsorCompany}
                                                    onChange={(e) => setNewSponsorCompany(e.target.value)}
                                                    className="w-full p-2 border rounded mb-2"
                                                    placeholder="Enter new company name"
                                                />
                                                <button type="button" onClick={addNewSponsorCompany} className="bg-green-500 px-4 py-2 text-white rounded hover:bg-green-600">
                                                    Add New Company
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedRole === "Driver" && (
                                    <div>
                                        <label className="block mb-1 font-semibold">Optional Sponsor Company</label>
                                        <select className="w-full p-2 border rounded mb-4" value={sponsorCompany} onChange={(e) => setSponsorCompany(e.target.value)}>
                                            <option value="">No sponsor company</option>
                                            {sponsorCompanies.map((c, i) => (
                                                <option key={i} value={c.company_name}>{c.company_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4">
                                    Add User
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }}
        </Authenticator>
    );
};
