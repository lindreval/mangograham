import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Wrapper function to use in server components
export async function auth() {
  return await getServerSession(authOptions);
}
