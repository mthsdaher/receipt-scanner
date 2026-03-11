import pool, { connectDB } from "../config/database";
import { Password } from "../utils/password";

const users = [
  {
    fullName: "Matheus Veloso",
    age: 27,
    email: "mthsv@example.com",
    cellNumber: "+14376603333",
    password: "test123*",
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    await pool.query("DELETE FROM users");
    console.log("Existing users cleared");

    for (const user of users) {
      const hashedPassword = await Password.toHash(user.password);
      await pool.query(
        `INSERT INTO users (full_name, age, email, cell_number, password, status)
         VALUES ($1, $2, $3, $4, $5, 'Active')`,
        [
          user.fullName,
          user.age,
          user.email,
          user.cellNumber,
          hashedPassword,
        ]
      );
    }
    console.log("Database seeded with sample users");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
