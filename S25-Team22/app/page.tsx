"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 text-white">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/truck1.jpeg')" }}></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center p-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-lg">
        {/* Truck Image */}
        <Image src="/truck1.jpeg" alt="Trucks" width={500} height={250} className="mb-4 rounded-lg shadow-md" />

        <h1 className="text-5xl font-bold mb-4 text-shadow-md">Welcome Mother Trucker!</h1>
        <p className="text-lg mb-6 text-gray-200">Please sign in or sign up to continue.</p>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push("/signUp")}
            className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-all duration-300 shadow-md"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/signUp")}
            className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-md"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
