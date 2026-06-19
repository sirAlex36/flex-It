import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flex-it.onrender.com";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://flex-it-six.vercel.app";

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
          throw new Error("Email and password required");
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

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

            if (contentType && contentType.includes("application/json")) {
              try {
                error = await response.json();
              } catch (parseError) {
                error = { error: "Invalid JSON response from server" };
              }
            } else {
              const text = await response.text();
              error = { error: `Server error (${response.status}): ${response.statusText}` };
            }

            throw new Error(error.error || "Login failed");
          }

          const data = await response.json();

          if (!data.access_token) {
            throw new Error("No token received");
          }

          const payload = jwtDecode(data.access_token);

          const user = {
            id: payload.sub || data.user?.id,
            email: credentials.email,
            name: payload.name || data.user?.name || credentials.email,
            role: payload.role || data.user?.role || "user",
            accessToken: data.access_token,
          };

          return user;
        } catch (error) {
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
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "c5d7bd68f56060e60d8c014d4f4e4d99d720d4049f0d9434ea0a710f6c7c483e",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.accessToken = token.accessToken;
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET || "c5d7bd68f56060e60d8c014d4f4e4d99d720d4049f0d9434ea0a710f6c7c483e",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };