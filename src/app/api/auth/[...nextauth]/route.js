import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
}

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
          const timeout = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
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
            let errorMessage = "Login failed";
            
            if (contentType && contentType.includes("application/json")) {
              try {
                const error = await response.json();
                errorMessage = error.error || error.message || "Invalid credentials";
              } catch (parseError) {
                errorMessage = "Invalid response from server";
              }
            } else {
              errorMessage = `Server error (${response.status})`;
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (!data.access_token) {
            throw new Error("No token received");
          }

          const payload = jwtDecode(data.access_token);

          const user = {
            id: payload.sub || data.user?.id || credentials.email,
            email: credentials.email,
            name: payload.name || data.user?.name || credentials.email,
            role: payload.role || data.user?.role || "user",
            accessToken: data.access_token,
          };

          return user;
        } catch (error) {
          console.error("Auth error:", error.message);
          if (error.name === "AbortError") {
            throw new Error("Login request timed out. Please try again.");
          }
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // FIX: Only use callbacks that work with Credentials provider
  callbacks: {
    //  This callback works with all providers
    async jwt({ token, user, account, profile, isNewUser }) {
      // When user signs in, add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    // This callback works with all providers
    async session({ session, token }) {
      // Pass token data to session
      session.user = {
        id: token.id,
        role: token.role,
        accessToken: token.accessToken,
        email: token.email || session.user.email,
        name: token.name || session.user.name,
      };
      return session;
    },

    // This callback works with all providers
    async redirect({ url, baseUrl }) {
      // Handle redirects
      if (url.startsWith("/flex-it-six.vercel.app")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };