"use client";

import { useState, useEffect, useCallback } from "react";
import { Authenticator, TextField } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { fetchUserAttributes } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../../amplify_outputs.json";
import { useRouter } from "next/navigation";

Amplify.configure(outputs);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  /** Sends user info to the API upon signup */
  const handleNewUserSignup = async (email: string, userType: string) => {
    console.log("handleNewUserSignup Called:", { email, userType });
  
    try {
      const apiUrl = "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/user";
  
      console.log("Sending API Request:", apiUrl, { email, userType });
  
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType }),
      });
  
      console.log("API Response Status:", response.status);
  
      if (response.status === 201) {
        const data = await response.json();
        console.log("User successfully added to database:", data);
      } else {
        const errorText = await response.text();
        console.log("API Response Error:", response.status, errorText);
      }
    } catch (error) {
      console.error("API Request Failed:", error);
    }
  };
  
  
  /** Fetches user role & email when user is authenticated */
  const fetchUserRole = useCallback(async (authUser: any) => {
    if (!authUser) return;
  
    try {
      setIsLoading(true);
      const attributes = await fetchUserAttributes();
      const role = attributes?.["custom:role"] || null;
      const email = attributes?.email || null;
  
      setUserRole(role);
      setUserEmail(email);
  
      console.log("🔍 Fetching user role:", { role, email });
  
      // Ensure the user is added if they do not exist
      if (role && email) {
        console.log("Ensuring user exists in DB...");
        await handleNewUserSignup(email, role);
      }
    } catch (error) {
      console.error("Error fetching user attributes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  

  /** Determines the home page based on the role */
  const getHomePage = (role: string | null) => {
    if (role === "Admin") return "/admin/home";
    if (role === "Driver") return "/driver/home";
    if (role === "Sponsor") return "/sponsor/home";
    return null;
  };

  /** Fetch user role when authentication state changes */
  useEffect(() => {
    if (user) {
      const isFirstTime = sessionStorage.getItem("isNewUser");
      if (isFirstTime === "true") {
        setIsNewUser(true);
        sessionStorage.removeItem("isNewUser"); // Clear flag after first login
      }
      fetchUserRole(user);
    }
  }, [user, fetchUserRole]);

  /** Redirect to home page once user role is determined */
  useEffect(() => {
    if (userRole) {
      const homePage = getHomePage(userRole);
      if (homePage) {
        router.replace(homePage);
      }
    }
  }, [userRole, router]);

  return (
    <>
      <Authenticator
        initialState="signUp"
        components={{
          SignUp: {
            FormFields() {
              return (
                <>
                  <Authenticator.SignUp.FormFields />
                  <input type="hidden" name="custom:role" value="Driver" />
                </>
              );
            },
          },
        }}
      >
        {({ signOut, user: authUser }) => {
          if (!user && authUser) {
            setUser(authUser);
          }

          if (isLoading || !userRole) {
            return (
              <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-2xl font-semibold">Loading...</h1>
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
              <button
                onClick={() => {
                  signOut?.();
                  router.replace("/");
                }}
                className="px-6 py-3 border border-gray-500 rounded-md hover:bg-gray-200"
              >
                Log Out
              </button>
            </div>
          );
        }}
      </Authenticator>
    </>
  );
}
