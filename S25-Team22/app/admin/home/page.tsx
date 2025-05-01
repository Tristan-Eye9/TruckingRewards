"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // Import profile icon

interface User {
  userID: string;
  userType: string;
  email: string;
}

export default function HomePage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Fetch all users from your API endpoint on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Adjust the endpoint below as necessary for your API.
        const res = await fetch("https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data: User[] = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
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

        // Handler for when the admin clicks "Review" on a user row.
        const handleReview = (usr: User) => {
          // Navigate to a dedicated review page with the user email as a query parameter.
          // You can adjust this URL as needed.
          router.push(`/admin/review?email=${encodeURIComponent(usr.email)}`);
        };

        return (
          <div className="flex flex-col h-screen">
            {/* Navigation Bar */}
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex space-x-4">
                <button className="bg-blue-600 px-4 py-2 rounded text-white">
                  Home
                </button>
                <Link href="/aboutpage">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    About Page
                  </button>
                </Link>
                <Link href="/admin/admin_cat">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Catalog
                  </button>
                </Link>
                <Link href="/admin/applications">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Application
                  </button>
                </Link>
                <Link href="/admin/addUsers">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Add Users
                  </button>
                </Link>
                <Link href="/admin/reports">
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
              <p className="text-lg text-center mb-8">
                Hello Admin! I hope you enjoy watching people, because that is all you do!
              </p>

              {/* New Users Table */}
              <div className="w-full max-w-4xl mx-auto p-4">
                <h2 className="text-3xl font-bold mb-4">All Users Table</h2>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">User Type</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((usr) => (
                      <tr key={usr.userID}>
                        <td className="border px-4 py-2">{usr.userType}</td>
                        <td className="border px-4 py-2">{usr.email}</td>
                        <td className="border px-4 py-2">
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={() => handleReview(usr)}
                          >
                            Review
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
