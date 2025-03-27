import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id
            },
            include: {
                items: true
            }
        })

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(transaction)
    } catch (error) {
        console.error("Error fetching transaction:", error)
        return NextResponse.json(
            { error: "Failed to fetch transaction" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Delete existing items
        await prisma.item.deleteMany({
            where: {
                transactionId: id
            }
        })

        // Update transaction and create new items
        const transaction = await prisma.transaction.update({
            where: {
                id: id
            },
            data: {
                date: new Date(body.date),
                description: body.description,
                category: body.category,
                relatedParty: body.relatedParty,
                amountTotal: body.amountTotal,
                type: body.type,
                paymentImg: body.paymentImg,
                items: {
                    create: body.items.map((item: any) => ({
                        name: item.name,
                        itemPrice: Number(item.itemPrice),
                        quantity: Number(item.quantity),
                        totalPrice: Number(item.itemPrice) * Number(item.quantity)
                    }))
                }
            },
            include: {
                items: true
            }
        })

        return NextResponse.json(transaction)
    } catch (error) {
        console.error("Error updating transaction:", error)
        return NextResponse.json(
            { error: "Failed to update transaction" },
            { status: 500 }
        )
    }
} 