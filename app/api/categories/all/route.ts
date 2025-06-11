import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const categories = await prisma.category.findMany({
      where: {
        organizationId: orgId,
        ...(type ? { type: type } : {}),
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[CATEGORIES_ALL_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
