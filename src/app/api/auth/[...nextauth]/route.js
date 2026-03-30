import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Login failed");
          }

          const data = await response.json();

          if (data.access_token) {
            // Parse JWT to get user info
            const tokenParts = data.access_token.split(".");
            const payloadBase64 = tokenParts[1];
            const payload = JSON.parse(
              Buffer.from(payloadBase64, "base64").toString()
            );

            return {
              id: payload.sub,
              email: credentials.email,
              name: payload.name || credentials.email,
              role: payload.role || "user",
              token: data.access_token,
            };
          }

          throw new Error("No token received");
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
