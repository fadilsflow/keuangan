import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MasterItemCreateSchema } from "@/lib/validations/master-item";

export async function GET(request: Request) {
  try {
    // Get organization ID and user ID from Clerk auth
    const { orgId, userId } = await auth();
    
    // If no organization is selected, return error
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    // If no user is authenticated, return error
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'expense'; // Default to 'expense' if not specified
    const skip = (page - 1) * limit;

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    const masterItems = await prismaClient.masterItem.findMany({
      where: {
        organizationId: orgId,
        type: type,
        name: {
          contains: search
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    });

    const totalItems = await prismaClient.masterItem.count({
      where: {
        organizationId: orgId,
        type: type,
        name: {
          contains: search
        }
      }
    });

    return NextResponse.json({
      items: masterItems,
      meta: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
    
  } catch (error: any) {
    console.error("Error fetching master items:", error);
    return NextResponse.json(
      { error: "Failed to fetch master items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get organization ID and user ID from Clerk auth
    const { orgId, userId } = await auth();
    
    // If no organization is selected, return error
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    // If no user is authenticated, return error
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Add organizationId and userId to the request body
    body.organizationId = orgId;
    body.userId = userId;
    
    // Validate the request body
    const validatedData = MasterItemCreateSchema.parse(body);
    
    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;
    
    // Create a new master item
    const masterItem = await prismaClient.masterItem.create({
      data: validatedData
    });
    
    return NextResponse.json(masterItem, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating master item:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Item dengan nama tersebut sudah ada untuk tipe yang sama" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create master item" },
      { status: 500 }
    );
  }
} 