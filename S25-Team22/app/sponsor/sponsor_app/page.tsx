"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { FaUserCircle } from "react-icons/fa";

interface Application {
    appID: number;
    fullName: string;
    driverEmail: string;
    submitted_at: string;
    status: string;
}

const SponsorApplication = () => {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [sponsorCompanyID, setSponsorCompanyID] = useState<number | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        const fetchSponsorCompanyIDFromCognito = async () => {
          try {
            const user = await getCurrentUser();
            const email = user.signInDetails?.loginId ?? "";
            setUserEmail(email);
      
            const attributes = await fetchUserAttributes();
            const sponsorCompanyName = attributes["custom:sponsorCompany"] || "";
      
            if (sponsorCompanyName) {
              const res = await fetch(`https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies`);
              const companies = await res.json();
      
              const matchedCompany = companies.find(
                (company: { company_name: string }) =>
                  company.company_name === sponsorCompanyName
              );
      
              if (matchedCompany?.id) {
                setSponsorCompanyID(matchedCompany.id);
                console.log("Matched Sponsor Company ID:", matchedCompany.id);
              } else {
                console.error("Sponsor company not found in DB");
              }
            } else {
              console.log("Sponsor company name not found in Cognito attributes");
            }
          } catch (err) {
            console.error("Error fetching sponsor company ID from Cognito", err);
          }
        };
        fetchSponsorCompanyIDFromCognito();
      }, []);   


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
        const fetchUserRole = async () => {
            try {
                const attributes = await fetchUserAttributes();
                const role = attributes?.["custom:role"] || null;
                setUserRole(role);
            } catch (error) {
                console.error("Error fetching user role:", error);
            } finally {
                setRoleLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    const fetchApplications = async (companyID: number) => {
        try {
            const res = await fetch(
                `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/sponsor?sponsorCompanyID=${companyID}`
            );
            const data = await res.json();
    
            if (Array.isArray(data)) {
                setApplications(data);
            } else {
                console.error("Expected array of applications but got:", data);
                setApplications([]);
            }
        } catch (err) {
            console.error("Failed to fetch applications:", err);
            setApplications([]);
        }
    };
    

    const handleStatusChange = async (appID: number, newStatus: string) => {
        try {
            const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appID, newStatus }),
            });
            console.log("Sending PATCH:", { appID, newStatus });

            if (res.ok) {
                setApplications((prev) =>
                    prev.map((app) =>
                        app.appID === appID ? { ...app, status: newStatus } : app
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const fetchSponsorCompanyID = async (email: string) => {
        const res = await fetch(
            `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/${email}`
        );
        const userData = await res.json();
        if (userData && userData[0]?.userType === "sponsor") {
            const sponsorID = userData[0].sponsorCompanyID;
            setSponsorCompanyID(sponsorID);
            console.log("Sponsor Company ID:", sponsorID);
        }
    };
    

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const user = await getCurrentUser();
                const email = user.signInDetails?.loginId;
                setUserEmail(email ?? "");
                await fetchSponsorCompanyID(email ?? "");
            } catch (err) {
                console.error("Error fetching user info", err);
            }
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (sponsorCompanyID !== null && !isNaN(sponsorCompanyID)) {
            fetchApplications(sponsorCompanyID);
        }
    }, [sponsorCompanyID]);
    

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const attributes = await fetchUserAttributes();
                const role = attributes["custom:role"];
                setUserRole(role ?? null);
            } catch (error) {
                console.error("Error fetching role", error);
            }
        };
        fetchRole();
    }, []);

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
                            <div className="flex space-x-4">
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
                                <Link href="/sponsor/points">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Points
                                    </button>
                                </Link>
                                <button className="bg-blue-600 px-4 py-2 rounded hover:bg-gray-600">
                                    Application
                                </button>
                                <Link href="/sponsor/addUsers">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Add Users</button>
                                </Link>
                                <Link href="/sponsor/sponsor_reports">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        Reports
                                    </button>
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

                        {/* Application Table */}
                        <div className="flex flex-col items-center justify-center p-10">
                            <h2 className="text-2xl font-bold mb-4">Driver Applications</h2>
                            <table className="w-full max-w-3xl border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border px-4 py-2">Name</th>
                                        <th className="border px-4 py-2">Email</th>
                                        <th className="border px-4 py-2">Submitted</th>
                                        <th className="border px-4 py-2">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.appID} className="text-center">
                                            <td className="border px-4 py-2">{app.fullName}</td>
                                            <td className="border px-4 py-2">{app.driverEmail}</td>
                                            <td className="border px-4 py-2">{new Date(app.submitted_at).toLocaleDateString()}</td>
                                            <td className="border px-4 py-2">
                                                {app.status === "submitted" || app.status === "pending" ? (
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleStatusChange(app.appID, e.target.value)}
                                                        className="p-1 border rounded"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="accepted">Accepted</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded ${
                                                        app.status === "accepted"
                                                          ? "bg-green-400"
                                                          : app.status === "rejected"
                                                          ? "bg-red-400"
                                                          : "bg-gray-400"
                                                      } text-white`}>
                                                      {app.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }}
        </Authenticator>
    );
};

export default SponsorApplication;
