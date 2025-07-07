// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/authOptions";

// // Wrapper function to use in server components
// export async function auth() {
//   return await getServerSession(authOptions);
// }

import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token && typeof token === "object" && "role" in token) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};



