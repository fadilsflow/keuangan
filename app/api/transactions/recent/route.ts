import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch 10 most recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: orgId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 