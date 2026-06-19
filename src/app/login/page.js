"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, getSession } from "next-auth/react"; // ✅ Added getSession import

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle reset parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      console.log("🔄 Performing hard reset...");
      
      // Clear everything
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Remove the query param
      window.history.replaceState({}, document.title, "/login");
      
      console.log("✅ Reset complete");
    }
  }, []);

  // ✅ Handle redirect after login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      const redirectPaths = {
        admin: "/dashboard/admin",
        organiser: "/dashboard/organiser",
        user: "/dashboard/user",
      };
      router.replace(redirectPaths[role] || "/dashboard/user");
    }
  }, [status, session, router]);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

    

      if (result?.error) {
        setError(result.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ Login successful");
        
        // ✅ Get the session to extract token
        try {
          const sessionData = await getSession();
          if (sessionData?.user?.accessToken) {
            localStorage.setItem("token", sessionData.user.accessToken);
            console.log("✅ Token saved to localStorage");
          }
        } catch (err) {
          console.error("Error getting session:", err);
        }
        
        // The useEffect will handle redirect
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? "Signing you in..." : "Checking session..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
          <p className="text-xs text-gray-400 mt-2">
            <a href="/login?reset=true" className="text-blue-600 hover:underline">
              Reset session if having issues
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-white rounded transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}