import { Roles } from "@/types/global";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();

  console.log(`sessionClaims:${JSON.stringify(sessionClaims)}}`);
  const metadata: { role?: Roles } | undefined = sessionClaims?.metadata;

  if (metadata) {
    return metadata.role === role;
  } else {
    return false;
  }
};
