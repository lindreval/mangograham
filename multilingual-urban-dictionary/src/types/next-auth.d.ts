// types/next-auth.d.ts  (anywhere inside your tsconfig "include" paths)
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type Role = "user" | "moderator" | "admin";

declare module "next-auth" {
  /** Server-side: the shape added to the JWT and the returned `user` */
  interface User extends DefaultUser {
    id: string;
    role: string;
  }

  /** Client-side: what `useSession()` sees */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
