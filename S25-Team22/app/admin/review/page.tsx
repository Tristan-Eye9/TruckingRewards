"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";

// Interfaces
interface User {
  userID?: number;
  userType: string;
  email: string;
  name: string;
  "custom:phoneNumber"?: string;
  "custom:zipCode"?: string;
  "custom:sponsorCompany"?: string;
  sponsorCompanyID?: number;
}

interface DriverSponsor {
  sponsorCompanyID: number;
  sponsorCompanyName?: string;
}

interface SponsorDriver {
  driverEmail: string;
}

export default function ReviewUserPage() {
  const router = useRouter();

  const [emailParam, setEmailParam] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [sponsorCompany, setSponsorCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [driverSponsors, setDriverSponsors] = useState<DriverSponsor[]>([]);
  const [sponsorDrivers, setSponsorDrivers] = useState<SponsorDriver[]>([]);
  const [newSponsorID, setNewSponsorID] = useState("");
  const [newDriverEmail, setNewDriverEmail] = useState("");

  const [companiesMap, setCompaniesMap] = useState<Record<number, string>>({});

  // --- Get email from URL query ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) {
      setEmailParam(email);
    } else {
      setError("Email parameter not found in URL.");
      setLoading(false);
    }
  }, []);

  // --- Fetch Cognito User Attributes ---
  useEffect(() => {
    if (!emailParam) return;

    const fetchCognito = async () => {
      try {
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/admin/cognito-user?email=${encodeURIComponent(emailParam)}`
        );
        const data = await res.json();
        const attrs = data.attributes;

        setName(attrs.name || "");
        setPhoneNumber(attrs["custom:phoneNumber"] || "");
        setZipCode(attrs["custom:zipCode"] || "");
        setUserType(attrs["custom:role"] || "");
        setSponsorCompany(attrs["custom:sponsorCompany"] || "");
      } catch (err) {
        console.error("Cognito fetch error:", err);
        setError("Failed to fetch Cognito attributes");
      }
    };

    fetchCognito();
  }, [emailParam]);

  // --- Fetch DB User Info ---
  useEffect(() => {
    if (!emailParam) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/${encodeURIComponent(emailParam)}`
        );
        const data = await res.json();
        if (data.length > 0) {
          setUserData(data[0]);
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("DB fetch error:", err);
        setError("Failed to fetch DB user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [emailParam]);

  // --- Fetch Companies Map ---
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/companies");
        const companies = await res.json();
        const map: Record<number, string> = {};
        companies.forEach((c: any) => {
          map[c.id] = c.company_name;
        });
        setCompaniesMap(map);
      } catch (err) {
        console.error("Companies fetch error:", err);
      }
    };

    fetchCompanies();
  }, []);

  // --- Fetch Sponsor/Driver Relationships ---
  useEffect(() => {
    const fetchRelationships = async () => {
      if (!emailParam || !userData) return;
  
      console.log(emailParam);
      console.log(userData);
      console.log(userType);
      if (userData.userType === "driver") {
        try {
          const res = await fetch(
            `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/relation?driverEmail=${encodeURIComponent(emailParam)}`
          );
          if (!res.ok) throw new Error("Failed to fetch sponsor relationships");
  
          const data = await res.json();
          const sponsors: DriverSponsor[] = data.map((s: any) => ({
            sponsorCompanyID: s.sponsorCompanyID,
            sponsorCompanyName: s.sponsorCompanyName || "Unknown",
          }));
          setDriverSponsors(sponsors);
        } catch (err) {
          console.error("Error fetching driver_sponsors:", err);
          setError("Failed to fetch sponsor relationships.");
        }
      }
    };
  
    fetchRelationships();
  }, [emailParam, userData]);  

  // --- Update User (Cognito + DB) ---
  const handleUpdate = async () => {
    if (!emailParam) return;
    console.log(emailParam);
    try {
      const cognitoRes = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/admin/cognito-user`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailParam,
            attributes: {
              "custom:phoneNumber": phoneNumber,
              "custom:zipCode": zipCode,
              "custom:role": userType,
              ...(userType === "Sponsor" ? { "custom:sponsorCompany": sponsorCompany } : {}),
            },
          }),
        }
      );

      if (!cognitoRes.ok) throw new Error(await cognitoRes.text());

      const dbRes = await fetch(`https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, userType }),
      });

      if (!dbRes.ok) throw new Error(await dbRes.text());

      alert("User updated successfully.");
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  // --- Delete User ---
  const handleDelete = async () => {
    if (!emailParam) return;
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/${encodeURIComponent(emailParam)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      alert("User deleted.");
      router.push("/admin/home");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleRemoveSponsorFromDriver = async (sponsorCompanyID: number) => {
    if (!emailParam) return;

    if (!confirm("Are you sure you want to remove this sponsor company from the driver?")) return;

    try {
      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/relation?driverEmail=${encodeURIComponent(emailParam)}&sponsorCompanyID=${sponsorCompanyID}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to remove sponsor: ${errorText}`);
      }

      alert("Sponsor company removed successfully.");

      // Update the list
      setDriverSponsors((prev) =>
        prev.filter((s) => s.sponsorCompanyID !== sponsorCompanyID)
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSponsorConnection = async () => {
    if (!emailParam || !newSponsorID) return;
  
    try {
      const res = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/relation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverEmail: emailParam,
            sponsorCompanyID: Number(newSponsorID),
          }),
        }
      );
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add sponsor connection: ${errorText}`);
      }
  
      const addedSponsor = {
        sponsorCompanyID: Number(newSponsorID),
        sponsorCompanyName: companiesMap[Number(newSponsorID)] || "Unknown",
      };
  
      setDriverSponsors((prev) => [...prev, addedSponsor]);
      setNewSponsorID(""); // reset dropdown
      alert("Sponsor added successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };  

  return (
    <Authenticator>
      {() => (
        <div className="p-10 overflow-y-auto">
          <h1 className="text-4xl font-bold mb-4">Review User</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : userData ? (
            <div className="space-y-6">
              <div>
                <label className="block font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  readOnly
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-semibold">User Type</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Role</option>
                  <option value="Driver">Driver</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Zip Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Update
                </button>
                </div>
              {userType === "Sponsor" && (
                <div>
                  <label className="block font-semibold">Sponsor Company</label>
                  <select
                    value={sponsorCompany}
                    onChange={(e) => setSponsorCompany(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Sponsor</option>
                    {Object.entries(companiesMap).map(([id, name]) => (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {userType === "Driver" && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Sponsor Companies</h2>

                  {driverSponsors.length > 0 ? (
                    <ul className="space-y-2">
                      {driverSponsors.map((sponsor) => (
                        <li key={sponsor.sponsorCompanyID} className="flex items-center justify-between border p-2 rounded">
                          <span>
                            {sponsor.sponsorCompanyName} (ID: {sponsor.sponsorCompanyID})
                          </span>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleRemoveSponsorFromDriver(sponsor.sponsorCompanyID)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sponsor companies assigned.</p>
                  )}
                <div className="mt-6">
                <h3 className="font-semibold mb-2">Add Sponsor Connection</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={newSponsorID}
                    onChange={(e) => setNewSponsorID(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Sponsor</option>
                    {Object.entries(companiesMap)
                      .filter(([id]) => !driverSponsors.some(ds => ds.sponsorCompanyID === Number(id)))
                      .map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddSponsorConnection}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={!newSponsorID}
                  >
                    Add
                  </button>
                </div>
              </div>
              </div>
              
              )}

              <div className="flex gap-4">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                  Delete User
                </button>
              </div>
            </div>
          ) : null}
          <button onClick={() => router.push("/admin/home")} className="mt-6 text-blue-700 underline">
            Back to Admin Home
          </button>
        </div>
      )}
    </Authenticator>
  );
}
