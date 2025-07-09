import { prisma } from "@/lib/prisma";
import slugify from "@/lib/slugify";

export async function generateUniqueUsername(name: string | null, email: string): Promise<string> {
  // Start with a base username from name or email
  let baseUsername = "";
  
  if (name) {
    // Use name and slugify it
    baseUsername = slugify(name).replace(/-/g, ''); // Remove hyphens for username
  } else {
    // Use email prefix
    baseUsername = slugify(email.split('@')[0]).replace(/-/g, '');
  }

  // Ensure we have something to work with and limit length
  if (!baseUsername) {
    baseUsername = "user";
  } else {
    baseUsername = baseUsername.substring(0, 15);
  }

  // Check if base username is available
  const existingUser = await prisma.user.findFirst({
    where: { username: baseUsername }
  });

  if (!existingUser) {
    return baseUsername;
  }

  // If base username exists, try with numbers
  let counter = 1;
  let candidateUsername = `${baseUsername}${counter}`;
  
  while (counter < 1000) { // Prevent infinite loop
    const existingUserWithNumber = await prisma.user.findFirst({
      where: { username: candidateUsername }
    });
    
    if (!existingUserWithNumber) {
      return candidateUsername;
    }
    
    counter++;
    candidateUsername = `${baseUsername}${counter}`;
  }

  // Fallback: use timestamp
  const timestamp = Date.now().toString().slice(-6);
  return `${baseUsername}${timestamp}`;
}