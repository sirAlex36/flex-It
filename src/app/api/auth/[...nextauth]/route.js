import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials");
          throw new Error("Email and password required");
        }

        try {
          console.log("🔍 Attempting login for:", credentials.email);
          
          // ⏱️ SET TIMEOUT TO PREVENT HANGING
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let error = {};
            
            // Handle JSON responses
            if (contentType && contentType.includes("application/json")) {
              try {
                error = await response.json();
              } catch (parseError) {
                console.error("❌ Failed to parse JSON error response:", parseError);
                error = { error: "Invalid JSON response from server" };
              }
            } else {
              // Handle non-JSON responses (HTML error pages, etc.)
              const text = await response.text();
              console.error("❌ Non-JSON error response:", text.substring(0, 200));
              error = { error: `Server error (${response.status}): ${response.statusText}` };
            }
            
            console.error("❌ Login failed:", error);
            throw new Error(error.error || "Login failed");
          }

          const data = await response.json();
          console.log("✅ Backend response received:", {
            hasToken: !!data.access_token,
            hasUser: !!data.user,
          });

          if (!data.access_token) {
            throw new Error("No token received");
          }

          // ✅ DECODE token and extract claims
          const payload = jwtDecode(data.access_token);
          console.log("✅ Token decoded:\n", {
            sub: payload.sub,
            role: payload.role,
            email: payload.email,
          });

          const user = {
            id: payload.sub || data.user?.id,
            email: credentials.email,
            name: payload.name || data.user?.name || credentials.email,
            role: payload.role || data.user?.role || "user",
            accessToken: data.access_token,
          };

          console.log("✅ Returning user object:", {
            id: user.id,
            email: user.email,
            role: user.role,
          });

          return user;
        } catch (error) {
          console.error("❌ Auth error:", error.message);
          if (error.name === "AbortError") {
            throw new Error("Authentication request timeout");
          }
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "c5d7bd68f56060e60d8c014d4f4e4d99d720d4049f0d9434ea0a710f6c7c483e",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // On sign in
      if (user) {
        console.log("🔐 JWT Callback - User object:", user);
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("🔐 Session Callback - Token:", {
        id: token.id,
        role: token.role,
        name: token.name,
      });
      
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "c5d7bd68f56060e60d8c014d4f4e4d99d720d4049f0d9434ea0a710f6c7c483e",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };