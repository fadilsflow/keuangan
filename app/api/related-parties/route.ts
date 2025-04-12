import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RelatedPartyCreateSchema } from "@/lib/validations/related-party";

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

    // Get total count for pagination
    const totalItems = await prisma.relatedParty.count({
      where: {
        organizationId: orgId,
        type,
        name: {
          contains: search
        }
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    const relatedParties = await prisma.relatedParty.findMany({
      where: {
        organizationId: orgId,
        type,
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

    return NextResponse.json({
      data: relatedParties,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      }
    });
    
  } catch (error) {
    console.error("Error fetching related parties:", error);
    return NextResponse.json(
      { error: "Failed to fetch related parties" },
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
    const validatedData = RelatedPartyCreateSchema.parse(body);
    
    // Create a new related party
    const relatedParty = await prisma.relatedParty.create({
      data: validatedData
    });
    
    return NextResponse.json(relatedParty, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating related party:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Pihak terkait dengan nama tersebut sudah ada untuk tipe yang sama" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create related party" },
      { status: 500 }
    );
  }
} 