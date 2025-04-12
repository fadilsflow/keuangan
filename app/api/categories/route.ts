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

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

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
      }
    });

    return NextResponse.json(categories);
    
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