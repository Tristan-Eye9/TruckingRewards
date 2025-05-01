"use client";

import { useEffect, useState, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { fetchUserAttributes, updateUserAttributes, resetPassword, confirmResetPassword, confirmUserAttribute, signOut, deleteUser } from "aws-amplify/auth";

export default function ProfilePage() {
    const router = useRouter();
    const [userAttributes, setUserAttributes] = useState({
        name: "",
        email: "",
    });

    const [phoneNumber, setPhoneNumber] = useState("");
    const [zipCode, setZipCode] = useState("");

    const [sponsorCompany, setSponsorCompany] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [passwordResetRequested, setPasswordResetRequested] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [emailChanged, setEmailChanged] = useState(false);
    const [emailVerificationCode, setEmailVerificationCode] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        const getUserAttributes = async () => {
            try {
                const attributes = await fetchUserAttributes();
                if (attributes) {
                    setUserAttributes({
                        name: attributes.name || "",
                        email: attributes.email || "",
                    });

                    setUserRole(attributes["custom:role"] || null);

                    if (attributes["custom:sponsorCompany"]) {
                        setSponsorCompany(attributes["custom:sponsorCompany"]);
                    }
                }
            } catch (error) {
                console.error("Error fetching user attributes:", error);
                alert("Session expired. Please log in again.");
                await signOut();
                router.push("/"); // Redirect to login
            } finally {
                setLoading(false);
                setRoleLoading(false);
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

    // Delete Account Function
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            if (!userAttributes.email) {
                alert("No user email found. Please log in again.");
                return;
            }

            const apiUrl = `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user/${userAttributes.email}`;

            console.log("Attempting to DELETE user:", apiUrl);

            const response = await fetch(apiUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            console.log("API Response Status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", errorText);
                alert(`Error deleting account: ${errorText}`);

                // If user is not found (404), don't proceed with Cognito deletion
                if (response.status === 404) {
                    alert("User not found in database. No changes made.");
                    return;
                }

                return;
            }

            const result = await response.json();
            console.log("API Response Body:", result);
            alert("Your account has been deleted successfully from the system.");

            // Now delete from AWS Cognito
            await deleteUser();
            alert("Your AWS Cognito account has been deleted.");

            await signOut();
            router.replace("/");

        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete the account. Please try again later.");
        }
    };

    // Fetch user attributes from Cognito on mount.
    useEffect(() => {
        const getUserAttributes = async () => {
            try {
                const attributes = await fetchUserAttributes();
                if (attributes) {
                    // Set built-in attributes
                    setUserAttributes({
                        name: attributes.name || "",
                        email: attributes.email || "",
                    });
                    // Set custom attributes if available (they might be missing if not set)
                    setPhoneNumber(attributes["custom:phoneNumber"] || "");
                    setZipCode(attributes["custom:zipCode"] || "");

                    setUserRole(attributes["custom:role"] || null);
                    if (attributes["custom:sponsorCompany"]) {
                        setSponsorCompany(attributes["custom:sponsorCompany"]);
                    }
                }
            } catch (error) {
                console.error("Error fetching user attributes:", error);
                alert("Session expired. Please log in again.");
                await signOut();
                router.push("/"); // Redirect to login
            } finally {
                setLoading(false);
                setRoleLoading(false);
            }
        };

        getUserAttributes();
    }, [router]);

    // Handler for updating custom attributes (phone number and zip code).
    const handleCustomAttributesUpdate = async () => {
        if (!phoneNumber.trim() || !zipCode.trim()) {
            alert("Phone number and zip code cannot be empty.");
            return;
        }
        try {
            await updateUserAttributes({
                userAttributes: {
                    "custom:phoneNumber": phoneNumber,
                    "custom:zipCode": zipCode,
                },
            });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating custom attributes:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

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
                setRoleLoading(false); // Stop role loading
            }
        };

        fetchUserRole();
    }, []);

    // Determine Home Page Route Based on Role
    const getHomePage = () => {
        if (userRole === "Admin") return "/admin/home";
        if (userRole === "Driver") return "/driver/home";
        if (userRole === "Sponsor") return "/sponsor/home";
        return null; // No navigation if role isn't determined
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

    // Handle Points Button Click
    const handlePointsClick = () => {
        if (userRole === "Driver") {
            router.push("/driver/points");
        } else if (userRole === "Sponsor") {
            router.push("/sponsor/points");
        } else {
            console.error("User role is not eligible for points.");
        }
    };

    // Handle Catalog Button Click
    const handleCatalogClick = () => {
        if (userRole === "Driver") {
            router.push("/driver/driver_cat");
        } else if (userRole === "Sponsor") {
            router.push("/sponsor/sponsor_cat");
        } else if (userRole === "Admin") {
            router.push("/admin/admin_cat");
        } else {
            console.error("User role is not eligible for catalog access.");
        }
    };

    // Handle Add Users Button Click
    const handleAddUsersClick = () => {
        if (userRole === "Admin") {
            router.push("/admin/addUsers");
        } else {
            console.error("User role is not eligible for adding users.");
        }
    };

    // Handle Add Sponsors Button Click
    const handleAddSponsorsClick = () => {
        if (userRole === "Sponsor") {
            router.push("/sponsor/addUsers");
        } else {
            console.error("User role is not eligible for adding users.");
        }
    };

    const handleVerifyEmail = async () => {
        try {
            await confirmUserAttribute({
                userAttributeKey: "email",
                confirmationCode: emailVerificationCode,
            });

            alert("Email verified successfully!");
            setEmailChanged(false);
            setEmailVerificationCode("");

            const updatedAttributes = await fetchUserAttributes();
            setUserAttributes((prev) => ({
                ...prev,
                email: updatedAttributes.email || prev.email,
            }));
        } catch (error) {
            console.error("Error verifying email:", error);
            alert("Invalid verification code. Please try again.");
        }
    };

    // Handle Application Button Click
    const handleApplicationClick = () => {
        if (userRole === "Driver") {
            router.push("/driver/driver_app");
        } else if (userRole === "Sponsor") {
            router.push("/sponsor/sponsor_app");
        } else if (userRole === "Admin") {
            router.push("/admin/applications");
        }
        else {
            console.error("User role is not eligible for applications.");
        }
    };

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

    const handlePasswordResetRequest = async () => {
        try {
            await resetPassword({ username: userAttributes.email });
            setPasswordResetRequested(true);
            alert("A verification code has been sent to your email.");
        } catch (error) {
            console.error("Error requesting password reset:", error);
            alert("Error requesting password reset. Please try again.");
        }
    };

    const handlePasswordResetConfirm = async () => {
        if (!newPassword || !confirmNewPassword) {
            alert("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await confirmResetPassword({
                username: userAttributes.email,
                confirmationCode: resetCode,
                newPassword: newPassword,
            });

            // Audit Log to Lambda
            await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/audit/password-change", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userAttributes.email }),
            });

            alert("Password successfully reset! You will now be signed out.");

            await signOut(); // Sign out the user completely
            router.push("/"); // Redirect to login page

        } catch (error) {
            console.error("Error confirming password reset:", error);
            alert("Error resetting password. Please check the code and try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        );
    }

    return (
        <Authenticator>
            {({ signOut, user }) => {
                const handleSignOut = () => {
                    signOut?.();
                    router.replace("/");
                };

                return (
                    <div className="flex flex-col h-screen">
                        <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
                            <div className="flex gap-4">
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
                                <Link href="/aboutpage">
                                    <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                                        About Page
                                    </button>
                                </Link>
                                {(userRole === "Driver" || userRole === "Sponsor") && (
                                    <button
                                        onClick={handlePointsClick}
                                        className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Points
                                    </button>
                                )}
                                {/* Show Catalog button for Drivers and Sponsors */}
                                {(userRole === "Driver" || userRole === "Sponsor" || userRole === "Admin") && (
                                    <button
                                        onClick={handleCatalogClick}
                                        className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Catalog
                                    </button>
                                )}
                                {/* Show Application button for Drivers and Sponsors */}
                                {(userRole === "Driver" || userRole === "Sponsor" || userRole === "Admin") && (
                                    <button
                                        onClick={handleApplicationClick}
                                        className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Application
                                    </button>
                                )}
                                {/* Show Add User button for Admin */}
                                {(userRole === "Admin") && (
                                    <button
                                        onClick={handleAddUsersClick}
                                        className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Add Users
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

                                {/* Show Reports button for Sponsors & Admins*/}
                                {(userRole === "Sponsor" || userRole === "Admin") && (
                                    <button
                                        onClick={handleReportsClick}
                                        className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Reports
                                    </button>
                                )}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <div className="cursor-pointer text-2xl" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <FaUserCircle />
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>

                        <div className="flex flex-col items-center justify-center h-screen p-10">
                            <h1 className="text-4xl font-semibold mb-6">My Profile</h1>
                            <div className="w-full max-w-md space-y-4">
                                <input type="text" className="w-full p-2 border bg-gray-300 rounded cursor-not-allowed" value={userAttributes.name} readOnly placeholder="Name (Cannot be changed)" />
                                <input type="email" className="w-full p-2 border bg-gray-300 rounded cursor-not-allowed" value={userAttributes.email} readOnly placeholder="Email (Cannot be changed)" />

                                {/* Custom Attributes: Phone Number */}
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Phone Number"
                                />

                                {/* Custom Attributes: Zip Code */}
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Zip Code"
                                />
                                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCustomAttributesUpdate}>
                                    Update Profile
                                </button>

                                {emailChanged && (
                                    <div className="space-y-4">
                                        <input type="text" className="w-full p-2 border rounded" value={emailVerificationCode} onChange={(e) => setEmailVerificationCode(e.target.value)} placeholder="Enter verification code" />
                                        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleVerifyEmail}>
                                            Verify Email
                                        </button>
                                    </div>
                                )}

                                {!passwordResetRequested ? (
                                    <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={handlePasswordResetRequest}>
                                        Reset Password
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <input type="text" className="w-full p-2 border rounded" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="Enter code" />
                                        <input type="password" className="w-full p-2 border rounded" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                                        <input type="password" className="w-full p-2 border rounded" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" />
                                        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handlePasswordResetConfirm}>
                                            Confirm Password Reset
                                        </button>
                                    </div>
                                )}
                                <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDeleteAccount}>
                                    Delete Account
                                </button>
                                {/* Sponsor Company Section - Visible Only for Sponsors */}
                                {userRole === "Sponsor" && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h2 className="text-lg font-semibold">Sponsor Company Information</h2>
                                        <input
                                            type="text"
                                            className="w-full p-2 border bg-gray-300 rounded cursor-not-allowed"
                                            readOnly placeholder="Sponsor Company Name (Cannot be changed)"
                                            value={sponsorCompany}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            }
        </Authenticator>
    );
}
