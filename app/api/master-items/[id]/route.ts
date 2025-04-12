import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MasterItemUpdateSchema } from "@/lib/validations/master-item";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    const masterItem = await prismaClient.masterItem.findUnique({
      where: {
        id: id
      }
    });

    if (!masterItem) {
      return NextResponse.json(
        { error: "Master item not found" },
        { status: 404 }
      );
    }

    // Check if the master item belongs to the user's organization
    if (masterItem.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to access this master item" },
        { status: 403 }
      );
    }

    return NextResponse.json(masterItem);
    
  } catch (error: any) {
    console.error("Error fetching master item:", error);
    return NextResponse.json(
      { error: "Failed to fetch master item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    // Check if the master item exists and belongs to the user's organization
    const existingMasterItem = await prismaClient.masterItem.findUnique({
      where: {
        id: id
      }
    });

    if (!existingMasterItem) {
      return NextResponse.json(
        { error: "Master item not found" },
        { status: 404 }
      );
    }

    if (existingMasterItem.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to update this master item" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = MasterItemUpdateSchema.parse(body);
    
    // Update the master item
    const updatedMasterItem = await prismaClient.masterItem.update({
      where: {
        id: id
      },
      data: validatedData
    });
    
    return NextResponse.json(updatedMasterItem);
    
  } catch (error: any) {
    console.error("Error updating master item:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Item dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update master item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    // Check if the master item exists and belongs to the user's organization
    const existingMasterItem = await prismaClient.masterItem.findUnique({
      where: {
        id: id
      }
    });

    if (!existingMasterItem) {
      return NextResponse.json(
        { error: "Master item not found" },
        { status: 404 }
      );
    }

    if (existingMasterItem.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this master item" },
        { status: 403 }
      );
    }

    // Delete the master item
    await prismaClient.masterItem.delete({
      where: {
        id: id
      }
    });
    
    return NextResponse.json({ message: "Master item deleted successfully" });
    
  } catch (error: any) {
    console.error("Error deleting master item:", error);
    
    return NextResponse.json(
      { error: "Failed to delete master item" },
      { status: 500 }
    );
  }
} 