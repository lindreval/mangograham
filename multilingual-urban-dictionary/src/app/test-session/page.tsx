// src/app/test-session/page.tsx
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { testSession } from "../test-action";

export default async function TestSession() {
  const session = await getServerSession(authConfig);
  
  async function handleTest() {
    "use server";
    const actionSession = await testSession();
    console.log("Action result:", actionSession);
  }
  
  return (
    <div className="p-6 space-y-4">
      <h1>Session Test</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
      
      <form action={handleTest}>
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Server Action Session
        </button>
      </form>
    </div>
  );
}