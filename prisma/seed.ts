import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
    try {
        // Read the SQL file
        const sqlFile = readFileSync(join(__dirname, 'seed.sql'), 'utf8')
        
        // Split the SQL file into individual statements
        const statements = sqlFile
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0)

        // Execute each statement in a transaction
        await prisma.$transaction(
            statements.map(statement => prisma.$executeRawUnsafe(`${statement};`))
        )

        console.log('🌱 Seed data has been planted successfully!')
    } catch (error) {
        console.error('Error seeding data:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch(e => {
    console.error(e)
    process.exit(1)
}) 