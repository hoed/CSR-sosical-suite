import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db, pool } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function resetAdminPassword() {
  try {
    console.log("Resetting admin password...");
    
    // Generate a hashed password for 'admin123'
    const hashedPassword = await hashPassword("admin123");
    
    // Update the admin user's password using Drizzle
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, "admin"))
      .returning();
    
    if (result.length > 0) {
      console.log("Admin password successfully reset!");
      console.log("Username: admin");
      console.log("Password: admin123");
    } else {
      console.log("Admin user not found!");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();