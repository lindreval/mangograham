"use server";

import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function testSession() {
  const session = await getServerSession(authConfig);
  console.log("Server action session:", JSON.stringify(session, null, 2));
  return session;
}