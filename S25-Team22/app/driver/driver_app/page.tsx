"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { FaUserCircle } from "react-icons/fa";
import { getCurrentUser } from "aws-amplify/auth";

interface SponsorCompany {
  id: number;
  company_name: string;
}

interface Application {
  appID: number;
  sponsorCompanyID: number;
  driverEmail: string;
  submitted_at: string;
  status: string;
  sponsor_name: string;
}

const DriverAppPage = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userEmail, setUserEmail] = useState("");
  const [sponsorCompanies, setSponsorCompanies] = useState<SponsorCompany[]>([]);
  const [selectedSponsorID, setSelectedSponsorID] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [applications, setApplications] = useState<Application[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    sponsor_company_id: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "sponsor_company_id" ? Number(value) : value,  // cast to number
    }));
  };

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

  const [impersonatedEmail, setImpersonatedEmail] = useState<string | null>(null);

  // Use useEffect to safely access localStorage on the client side.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("impersonatedDriverEmail");
      if (storedEmail) {
        setImpersonatedEmail(storedEmail);
        setUserEmail(storedEmail);
        setFormData(f => ({
          ...f, email: storedEmail}))
      } else {
        // If not impersonating, fetch user email from Cognito.
        const getUserEmail = async () => {
          try {
            const attributes = await fetchUserAttributes();
            const email = attributes.email;
            setUserEmail(email || "");
            setFormData(f => ({ ...f, email: email || "" }));
          } catch (err) {
            console.error("Error fetching user attributes:", err);
          }
        };
        getUserEmail();
      }
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/driver?email=${encodeURIComponent(userEmail)}`
        );
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch driver applications:", err);
      }
    };

    fetchApplications();
  }, [userEmail]);

  /** Fetch existing sponsor companies */
  useEffect(() => {
    const fetchSponsorCompanies = async () => {
      try {
        const response = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies");

        if (!response.ok) throw new Error("Failed to fetch sponsors");

        const data: SponsorCompany[] = await response.json();
        console.log("Fetched Sponsor Companies:", data); // Debugging log

        setSponsorCompanies(data);
      } catch (error) {
        console.error("Error fetching sponsor companies:", error);
      }
    };

    fetchSponsorCompanies();
  }, []);

  // Fetch past applications for logged-in driver
  useEffect(() => {
    if (!userEmail) return;
    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/driver?email=${encodeURIComponent(userEmail)}`
        );
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch driver applications:", err);
      }
    };
    fetchApplications();
  }, [userEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { first_name, last_name, email, sponsor_company_id } = formData;

    // Validate fields
    if (!first_name || !last_name || !email || !sponsor_company_id) {
      alert("Please complete all fields before submitting.");
      return;
    }

    const driverEmail = userEmail;

    try {
      // Submit application to the backend
      const response = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverEmail,
          sponsorCompanyID: Number(formData.sponsor_company_id),
          fullName: `${formData.first_name} ${formData.last_name}`
        }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");

        // Clear the form
        setFormData((prev) => ({
          ...prev,
          first_name: "",
          last_name: "",
          sponsor_company_id: "",
        }));

        // Re-fetch applications for the user
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/application/driver?email=${encodeURIComponent(email)}`
        );
        const data: Application[] = await res.json();
        setApplications(data);
      } else {
        const error = await response.text();
        console.log("Application failed:", error);
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Something went wrong. Please try again.");
    }
  };

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
          router.push("/profile");
        };

        return (
          <div className="flex flex-col h-screen">
            {/* Impersonation Banner */}
            {localStorage.getItem("impersonatedDriverEmail") && (
              <div className="bg-yellow-200 p-4 text-center">
                <p className="text-lg font-semibold">
                  You are impersonating{" "}
                  <span className="underline">{localStorage.getItem("impersonatedDriverEmail")}</span>. Go to Home Page to stop impersonation.
                </p>
              </div>
            )}

            {/* Navigation Bar */}
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex space-x-4">
                <Link href="/driver/home">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Home
                  </button>
                </Link>
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
                <button className="bg-blue-600 px-4 py-2 rounded hover:bg-gray-600">
                  Application
                </button>
              </div>

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

            {/* Driver Application Form */}
            <div className="flex flex-col items-center justify-center py-10">
              <h2 className="text-2xl font-bold mb-4">Driver Application</h2>
              <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-md w-3/5 max-w-2xl min-w-[400px]">
                <label htmlFor="first-name">First Name:</label>
                <input
                  type="text"
                  id="first-name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="border p-2 w-full mb-2"
                />
                <label htmlFor="last-name">Last Name:</label>
                <input
                  type="text"
                  id="last-name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="border p-2 w-full mb-2"
                />
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userEmail || user?.signInDetails?.loginId || "No email found"}
                  disabled
                  className="border p-2 w-full bg-gray-100 cursor-not-allowed"
                />

                <label htmlFor="sponsor">Select a Sponsor Company:</label>
                <select
                  id="sponsorDropdown"
                  name="sponsor_company_id"
                  value={formData.sponsor_company_id}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                >
                  <option value="">Please Select a Sponsor Company</option>
                  {sponsorCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>

                <button type="submit" className="p-2 w-full mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Submit
                </button>
              </form>

              {/* Past Applications */}
              <h2 className="text-2xl font-bold mt-10">Your Submitted Applications</h2>
              <table className="w-full max-w-2xl border mt-4 border-collapse border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Sponsor Company</th>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.appID} className="text-center">
                      <td className="border px-4 py-2">{app.sponsor_name}</td>
                      <td className="border px-4 py-2">{new Date(app.submitted_at).toLocaleDateString()}</td>
                      <td className={`border px-4 py-2 font-semibold text-white ${app.status === "accepted"
                        ? "bg-green-500"
                        : app.status === "submitted"
                          ? "bg-yellow-500"
                          : "bg-red-500"}`}>
                        {app.status}
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

export default DriverAppPage;
