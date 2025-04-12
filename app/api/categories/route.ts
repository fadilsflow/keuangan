import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CategoryCreateSchema } from "@/lib/validations/category";

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
    const type = searchParams.get('type') || 'expense'; // Default to 'expense' if not specified
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // Calculate pagination values
    const skip = (page - 1) * pageSize;

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    // Get total count for pagination
    const totalItems = await prismaClient.category.count({
      where: {
        organizationId: orgId,
        type: type,
        name: {
          contains: search
        }
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated categories
    const categories = await prismaClient.category.findMany({
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
      take: pageSize
    });

    // Return the data with pagination metadata
    return NextResponse.json({
      data: categories,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      }
    });
    
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedData = CategoryCreateSchema.parse(body);
    
    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;
    
    // Create a new category
    const category = await prismaClient.category.create({
      data: validatedData
    });
    
    return NextResponse.json(category, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating category:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada untuk tipe yang sama" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
} 