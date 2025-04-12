import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";

const execAsync = promisify(exec);

async function backupDatabase() {
  try {
    // Create backups directory if it doesn't exist
    const backupDir = join(process.cwd(), "backups");
    await mkdir(backupDir, { recursive: true });

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = join(backupDir, `backup-${timestamp}.sql`);

    if (process.env.NODE_ENV === "production") {
      // For PostgreSQL in production
      const { stdout, stderr } = await execAsync(
        `pg_dump "${process.env.DATABASE_URL_PROD}" > "${backupFile}"`
      );
      
      if (stderr) {
        console.error("Backup error:", stderr);
        return;
      }
    } else {
      // For SQLite in development
      // Copy the database file
      const { stdout, stderr } = await execAsync(
        `cp "${join(process.cwd(), "prisma/dev.db")}" "${backupFile}.db"`
      );

      if (stderr) {
        console.error("Backup error:", stderr);
        return;
      }
    }

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    };

    await writeFile(
      `${backupFile}.json`,
      JSON.stringify(metadata, null, 2)
    );

    console.log(`✅ Database backup created: ${backupFile}`);
  } catch (error) {
    console.error("Failed to create backup:", error);
    process.exit(1);
  }
}

// Run backup
backupDatabase(); 