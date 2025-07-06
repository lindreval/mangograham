// // src/app/api/auth/[...nextauth]/route.ts
// import NextAuth, { type AuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";
// import { authConfig } from "@/lib/auth";
// import { authOptions } from "@/lib/authOptions";


// // 👇 give the object an explicit type
// const authOptions: AuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.CLIENT_ID!,
//       clientSecret: process.env.CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: "jwt",            // ← now inferred as "jwt", not string
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       // user is only present on the first sign-in
//       if (user) {
//         token.id = user.id;
//         token.role = ((user as { role?: string }).role || 'user') as 'user' | 'moderator' | 'admin';
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
