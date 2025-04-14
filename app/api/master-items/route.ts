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
    const type = searchParams.get('type') as "income" | "expense" || "expense";
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // Calculate pagination values
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalItems = await prisma.masterItem.count({
      where: {
        organizationId: orgId,
        type: type,
        name: {
          contains: search,
        }
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    const masterItems = await prisma.masterItem.findMany({
      where: {
        organizationId: orgId,
        type: type,
        name: {
          contains: search,
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: pageSize
    });

    return NextResponse.json({
      data: masterItems,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      }
    });
    
  } catch (error) {
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
    
    // Create a new master item
    const masterItem = await prisma.masterItem.create({
      data: validatedData
    });
    
    return NextResponse.json(masterItem, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating master item:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Item dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create master item" },
      { status: 500 }
    );
  }
} 