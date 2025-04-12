import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CategoryUpdateSchema } from "@/lib/validations/category";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const category = await prisma.category.findUnique({
      where: {
        id: params.id
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if the category belongs to the user's organization
    if (category.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to access this category" },
        { status: 403 }
      );
    }

    return NextResponse.json(category);
    
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the category exists and belongs to the user's organization
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to update this category" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = CategoryUpdateSchema.parse(body);
    
    // Update the category
    const updatedCategory = await prisma.category.update({
      where: {
        id: params.id
      },
      data: validatedData
    });
    
    return NextResponse.json(updatedCategory);
    
  } catch (error) {
    console.error("Error updating category:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the category exists and belongs to the user's organization
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this category" },
        { status: 403 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        id: params.id
      }
    });
    
    return NextResponse.json({ message: "Category deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting category:", error);
    
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 