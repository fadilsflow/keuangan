
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useOrganization() {
  const { organization } = useClerk();
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "");
    }
  }, [organization]);

  return { orgName };
}

export async function getOrgNameFromId(orgId: string): Promise<string> {
  try {
    // In a real implementation, this would fetch the org name from the database or Clerk API
    // For simplicity, we'll just return a placeholder
    return "Organization"; // Placeholder
  } catch (error) {
    console.error("Error fetching org name:", error);
    return "Organization";
  }
} 