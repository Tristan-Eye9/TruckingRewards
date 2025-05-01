"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth"; // Fetch user attributes
import { FaUserCircle } from "react-icons/fa";

interface AboutSection {
  section_name: string;
  content: string;
  last_updated: string;
}

const API_URL =
  "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/about";

const AboutPage = () => {
  const router = useRouter();
  const [aboutData, setAboutData] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<AboutSection[]>([]);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch about page content
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: AboutSection[] = await response.json();
        setAboutData(data);
        setEditedData(data); // Initialize editedData with existing content
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch User Role on Page Load
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const role = attributes?.["custom:role"] || null;
        setUserRole(role);
        console.log("User Role:", role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Handle content change in edit mode
  const handleContentChange = (index: number, newContent: string) => {
    const updatedData = [...editedData];
    updatedData[index].content = newContent;
    setEditedData(updatedData);
  };

  // Save changes to the database
  const handleSaveChanges = async () => {
    setSaving(true);
    console.log("🚀 Sending data to API:", editedData); // Log data before sending

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),  // Make sure this is valid JSON
      });

      console.log("API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save changes. Status: ${response.status}, Error: ${errorText}`);
      }

      setAboutData(editedData);
      setEditMode(false);
      console.log("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  // Determine Home Page Route Based on Role
  const getHomePage = () => {
    if (userRole === "Admin") return "/admin/home";
    if (userRole === "Driver") return "/driver/home";
    if (userRole === "Sponsor") return "/sponsor/home";
    return null; // No navigation if role isn't determined
  };

  // Handle Application Button Click
  const handleApplicationClick = () => {
    if (userRole === "Driver") {
      router.push("/driver/driver_app");
    } else if (userRole === "Sponsor") {
      router.push("/sponsor/sponsor_app");
    } else if (userRole === "Admin") { 
      router.push("/admin/applications"); 
    } else {
      console.error("User role is not eligible for applications.");
    }
  };

  // Handle Points Button Click
  const handlePointsClick = () => {
    if (userRole === "Driver") {
      router.push("/driver/points");
    } else if (userRole === "Sponsor") {
      router.push("/sponsor/points");
    } else {
      console.error("User role is not eligible for applications.");
    }
  };

  const handleCatClick = () => {
    if (userRole === "Driver") {
      router.push("/driver/driver_cat");
    } else if (userRole === "Sponsor") {
      router.push("/sponsor/sponsor_cat");
    } else if (userRole === "Admin") {
      router.push("/admin/admin_cat");
    } else {
      console.error("User role is not eligible for applications.");
    }
  }

  const handleAddUsersClick = () => {
    if (userRole === "Admin") {
      router.push("/admin/addUsers");
    } else {
      console.error("User role is not eligible for applications.");
    }
  }


  const handleAddSponsorsClick = () => {
    if (userRole === "Sponsor") {
      router.push("/sponsor/addUsers");
    } else {
      console.error("User role is not eligible for applications.");
    }
  }

  // Hanlde Reports Button click
  const handleReportsClick = () => {
    if (userRole === "Sponsor") {
        router.push("/sponsor/sponsor_reports");
    } else if (userRole === "Admin") {
        router.push("/admin/reports");
    } else {
        console.error("User role is not eligible for reports.");
    }
}

  // Close profiledropdown when clicking outside
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

  // Check for impersonation: if localStorage has an impersonated driver email
  const impersonatedEmail =
    typeof window !== "undefined" ? localStorage.getItem("impersonatedDriverEmail") : null;

  return (
    <Authenticator>
      {({ signOut, user }) => {
        const handleSignOut = () => {
          signOut?.();
          router.replace("/");
        };

        // Handle Home Button Click (Prevent Navigation if Role is Unknown)
        const handleHomeClick = () => {
          const homePage = getHomePage();
          if (homePage) {
            router.push(homePage);
          } else {
            console.error("User role is not set, cannot navigate.");
          }
        };

        const handleProfileClick = () => {
          router.push("/profile"); // Navigate to the profile page
        };

        return (
          <div className="flex flex-col h-screen">

            {/* Navigation Bar */}
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex space-x-4">
                {/* Home button now waits for role to load */}
                <button
                  onClick={handleHomeClick}
                  disabled={roleLoading} // Disable until role is loaded
                  className={`px-4 py-2 rounded ${roleLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                  {roleLoading ? "Loading..." : "Home"}
                </button>
                <button className="bg-blue-600 px-4 py-2 rounded text-white">
                  About Page
                </button>

                {(userRole === "Driver" || userRole === "Sponsor" || userRole == "Admin") && (
                  <button
                    onClick={handleCatClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Catalog
                  </button>
                )}
                {/* Show Points button for Drivers and Sponsors */}
                {(userRole === "Driver" || userRole === "Sponsor") && (
                  <button
                    onClick={handlePointsClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Points
                  </button>
                )}

                {/* Show Application button for Drivers and Sponsors */}
                {(userRole === "Driver" || userRole === "Sponsor" || userRole == "Admin") && (
                  <button
                    onClick={handleApplicationClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Application
                  </button>
                )}

                {/* Show Add Sponsors button for Sponsors */}
                {(userRole === "Sponsor") && (
                  <button
                    onClick={handleAddSponsorsClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Add Users
                  </button>
                )}

                {/* Show Add Users button for Admin */}
                {(userRole === "Admin") && (
                  <button
                    onClick={handleAddUsersClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Add Users
                  </button>
                )}

                {/* Show Reports button for Sponsors & Admin*/}
                {(userRole === "Sponsor" || userRole === "Admin") && (
                  <button
                    onClick={handleReportsClick}
                    className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Reports
                  </button>
                )}

                {userRole === "Admin" && (
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {editMode ? "Cancel Edit" : "Edit Page"}
                  </button>
                )}
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
            <div className="flex flex-col items-center justify-start min-h-screen text-center p-6 w-full max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-4 text-center w-full">Welcome to Our About Page</h1>

              {loading && <p className="text-gray-600 text-center">Loading...</p>}
              {error && <p className="text-red-500 text-center">Error: {error}</p>}

              {!loading && !error && aboutData.length > 0 ? (
                <div className="space-y-6 w-full">
                  {editedData.map((section, index) => (
                    <div key={index} className="border-b pb-4 w-full text-center">
                      <h2 className="text-xl font-semibold capitalize text-center w-full">{section.section_name.replace(/_/g, " ")}</h2>

                      {/* Centering all text and inputs */}
                      <div className="relative w-full flex flex-col items-center">
                        {editMode ? (
                          <textarea
                            className="w-full max-w-xl p-2 border rounded resize-none bg-white text-center"
                            value={section.content}
                            onChange={(e) => handleContentChange(index, e.target.value)}
                            style={{ minHeight: "120px", maxHeight: "300px" }}
                          />
                        ) : (
                          <p className="text-gray-700 text-center w-full">{section.content || "No content available"}</p>
                        )}
                      </div>

                      <small className="text-gray-500 text-center w-full block">
                        Last updated:{" "}
                        {section.last_updated
                          ? new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(section.last_updated))
                          : "No update available"}
                      </small>
                    </div>
                  ))}

                  {/* Centered Buttons for Edit Mode */}
                  {editMode && (
                    <div className="flex justify-center space-x-4 mt-4">
                      <button
                        onClick={handleSaveChanges}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !loading && <p className="text-gray-600 text-center w-full">No data available.</p>
              )}
            </div>
          </div>
        );
      }}
    </Authenticator>
  );
};

export default AboutPage;
