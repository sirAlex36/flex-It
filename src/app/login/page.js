"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 REDIRECT IF ALREADY AUTHENTICATED (FALLBACK)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const role = session.user.role;

      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "organiser") {
        router.replace("/dashboard/organiser");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [status, session?.user?.id, router]);

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
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Give the session a moment to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the updated session
        const session = await getSession();
        console.log("✅ Session retrieved:", {
          exists: !!session,
          userId: session?.user?.id,
          role: session?.user?.role,
        });
        
        if (session?.user?.id) {
          const role = session.user.role;
          console.log("✅ Redirecting to dashboard as:", role);
          
          // Redirect immediately
          if (role === "admin") {
            router.push("/dashboard/admin");
          } else if (role === "organiser") {
            router.push("/dashboard/organiser");
          } else {
            router.push("/dashboard/user");
          }
        } else {
          setError("Failed to establish session. Please try again.");
          setLoading(false);
        }
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  // 🔄 SHOW LOADER WHILE CHECKING SESSION
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Sign in to your <span className="text-blue-600 font-semibold">Flex-It</span> account
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* SIGN UP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New here?{" "}
              <a href="/sign-up" className="text-blue-600 font-medium hover:underline">
                Create account
              </a>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Secure & encrypted login
        </p>
      </div>
    </div>
  );
}