import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
    try {
        // Get organization ID and user ID from Clerk auth
        const { orgId } = await auth();
        
        // If no organization is selected, return error
        if (!orgId) {
            return NextResponse.json(
                { error: "No organization selected" },
                { status: 403 }
            );
        }



        // Ambil data transaksi 90 hari terakhir
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 90)

        const transactions = await prisma.transaction.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: startDate
                },
                organizationId: orgId,
            },
            _sum: {
                amountTotal: true
            },
            orderBy: {
                date: 'asc'
            },  
            having: {
                date: {
                    _count: {
                        gt: 0
                    }
                }
            }
        })

        // Ambil data pemasukan dan pengeluaran terpisah
        const incomeByDate = await prisma.transaction.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: startDate
                },
                type: 'pemasukan',
                organizationId: orgId,
            },
            _sum: {
                amountTotal: true
            }
        })

        const expenseByDate = await prisma.transaction.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: startDate
                },
                type: 'pengeluaran',
                organizationId: orgId,
            },
            _sum: {
                amountTotal: true
            }
        })

        // Buat map untuk mempermudah akses data
        const incomeMap = new Map(
            incomeByDate.map(item => [
                item.date.toISOString().split('T')[0],
                item._sum.amountTotal || 0
            ])
        )

        const expenseMap = new Map(
            expenseByDate.map(item => [
                item.date.toISOString().split('T')[0],
                item._sum.amountTotal || 0
            ])
        )

        // Gabungkan data dalam format yang dibutuhkan chart
        const chartData = transactions.map(item => {
            const dateStr = item.date.toISOString().split('T')[0]
            return {
                date: dateStr,
                income: incomeMap.get(dateStr) || 0,
                expense: expenseMap.get(dateStr) || 0
            }
        })

        // Isi data kosong untuk tanggal yang tidak memiliki transaksi
        const filledData = []
        const endDate = new Date()
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0]
            const existingData = chartData.find(item => item.date === dateStr)

            filledData.push(
                existingData || {
                    date: dateStr,
                    income: 0,
                    expense: 0
                }
            )

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return NextResponse.json(filledData)

    } catch (error) {
        console.error("Error fetching transaction history:", error)
        return NextResponse.json(
            { error: "Failed to fetch transaction history" },
            { status: 500 }
        )
    }
} 