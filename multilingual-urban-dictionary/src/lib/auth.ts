// // import { getServerSession } from "next-auth";
// // import { authOptions } from "@/lib/authOptions";

// // // Wrapper function to use in server components
// // export async function auth() {
// //   return await getServerSession(authOptions);
// // }

// import { getServerSession } from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";
// import type { NextAuthOptions } from "next-auth";

// export async function auth() {
//   return await getServerSession(authConfig);
// }

// // Extend the built-in session types
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//     };
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: string;
//   }
// }

// export const authConfig: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     Google({
//       clientId: process.env.CLIENT_ID!,
//       clientSecret: process.env.CLIENT_SECRET!,
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (account && user) {
//         // Ensure user exists in database when using JWT
//         const existingUser = await prisma.user.findUnique({
//           where: { email: user.email! },
//         });
        
//         if (!existingUser) {
//           const newUser = await prisma.user.create({
//             data: {
//               email: user.email!,
//               name: user.name,
//               image: user.image,
//               role: "user",
//             },
//           });
//           token.id = newUser.id;
//           token.role = newUser.role;
//         } else {
//           token.id = existingUser.id;
//           token.role = existingUser.role;
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user && token) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },
// };

import { getServerSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import { generateUniqueUsername } from "@/lib/username-generator";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  // Use JWT strategy for faster session checks (no DB query on every request)
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, user object is available
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // token comes from JWT when using JWT sessions
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Generate and assign username when user is created
      if (user.email && user.name !== undefined) {
        const username = await generateUniqueUsername(user.name, user.email);
        await prisma.user.update({
          where: { id: user.id },
          data: { username }
        });
      }
    },
  },
};

// Export the auth function
export async function auth() {
  return await getServerSession(authConfig);
}