import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RelatedPartyUpdateSchema } from "@/lib/validations/related-party";

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

    // Use a temporary workaround until the Prisma client is regenerated
    const prismaClient = prisma as any;

    const relatedParty = await prismaClient.relatedParty.findUnique({
      where: {
        id: params.id
      }
    });

    if (!relatedParty) {
      return NextResponse.json(
        { error: "Related party not found" },
        { status: 404 }
      );
    }

    // Check if the related party belongs to the user's organization
    if (relatedParty.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to access this related party" },
        { status: 403 }
      );
    }

    return NextResponse.json(relatedParty);
    
  } catch (error) {
    console.error("Error fetching related party:", error);
    return NextResponse.json(
      { error: "Failed to fetch related party" },
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

    // Check if the related party exists and belongs to the user's organization
    const existingRelatedParty = await prisma.relatedParty.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existingRelatedParty) {
      return NextResponse.json(
        { error: "Related party not found" },
        { status: 404 }
      );
    }

    if (existingRelatedParty.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to update this related party" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = RelatedPartyUpdateSchema.parse(body);
    
    // Update the related party
        const updatedRelatedParty = await prisma.relatedParty.update({
      where: {
        id: params.id
      },
      data: validatedData
    });
    
    return NextResponse.json(updatedRelatedParty);
    
  } catch (error) {
    console.error("Error updating related party:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Pihak terkait dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update related party" },
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

    // Check if the related party exists and belongs to the user's organization
    const existingRelatedParty = await prismaClient.relatedParty.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existingRelatedParty) {
      return NextResponse.json(
        { error: "Related party not found" },
        { status: 404 }
      );
    }

    if (existingRelatedParty.organizationId !== orgId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this related party" },
        { status: 403 }
      );
    }

    // Delete the related party
    await prismaClient.relatedParty.delete({
      where: {
        id: params.id
      }
    });
    
    return NextResponse.json({ message: "Related party deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting related party:", error);
    
    return NextResponse.json(
      { error: "Failed to delete related party" },
      { status: 500 }
    );
  }
} 