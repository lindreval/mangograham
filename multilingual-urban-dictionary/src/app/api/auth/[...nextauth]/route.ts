// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// 👇 give the object an explicit type
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",            // ← now inferred as "jwt", not string
  },
  callbacks: {
    async jwt({ token, user }) {
      // user is only present on the first sign-in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;   // still unknown here → cast OK
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
