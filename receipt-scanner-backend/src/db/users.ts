import pool from "../config/database";
import { UserStatus } from "../models/User";

export interface UserRow {
  id: string;
  full_name: string;
  age: number;
  email: string;
  cell_number: string;
  password?: string;
  reset_token?: string;
  reset_token_expires?: Date;
  verif_cd?: string;
  exp_dt?: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
  verifCd?: string | null;
  expDt?: Date | null;
}

function rowToUser(row: UserRow, includeSensitive = false): User {
  const user: User = {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    email: row.email.toLowerCase(),
    cellNumber: row.cell_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeSensitive) {
    user.password = row.password;
    user.resetToken = row.reset_token ?? null;
    user.resetTokenExpires = row.reset_token_expires ?? null;
    user.verifCd = row.verif_cd ?? null;
    user.expDt = row.exp_dt ?? null;
  }
  return user;
}

export async function findUserByEmail(email: string, includePassword = false) {
  const res = await pool.query<UserRow>(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email.trim()]
  );
  const row = res.rows[0];
  if (!row) return null;
  return rowToUser(row, includePassword);
}

export async function findUserById(id: string) {
  const res = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  const row = res.rows[0];
  if (!row) return null;
  return rowToUser(row);
}

export async function findAllUsers() {
  const res = await pool.query<UserRow>(
    "SELECT id, full_name, age, email, cell_number, status, created_at, updated_at FROM users"
  );
  return res.rows.map((row) => rowToUser(row));
}

export async function createUser(data: {
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
  password: string;
  verifCd: string;
  expDt: Date;
  status: UserStatus;
}) {
  const res = await pool.query<UserRow>(
    `INSERT INTO users (full_name, age, email, cell_number, password, verif_cd, exp_dt, status)
     VALUES ($1, $2, LOWER($3), $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.fullName.trim(),
      data.age,
      data.email.trim(),
      data.cellNumber.trim(),
      data.password,
      data.verifCd,
      data.expDt,
      data.status,
    ]
  );
  return rowToUser(res.rows[0]);
}

export async function updateUser(
  email: string,
  updates: Partial<{
    resetToken: string | null;
    resetTokenExpires: Date | null;
    verifCd: string | null;
    expDt: Date | null;
    status: string;
    password: string;
  }>
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (Object.prototype.hasOwnProperty.call(updates, "resetToken")) {
    fields.push(`reset_token = $${i++}`);
    values.push(updates.resetToken);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "resetTokenExpires")) {
    fields.push(`reset_token_expires = $${i++}`);
    values.push(updates.resetTokenExpires);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "verifCd")) {
    fields.push(`verif_cd = $${i++}`);
    values.push(updates.verifCd);
  }
  if (Object.prototype.hasOwnProperty.call(updates, "expDt")) {
    fields.push(`exp_dt = $${i++}`);
    values.push(updates.expDt);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${i++}`);
    values.push(updates.status);
  }
  if (updates.password !== undefined) {
    fields.push(`password = $${i++}`);
    values.push(updates.password);
  }

  if (fields.length === 0) return null;

  values.push(email);
  const res = await pool.query<UserRow>(
    `UPDATE users SET ${fields.join(", ")} WHERE LOWER(email) = LOWER($${i}) RETURNING *`,
    values
  );
  const row = res.rows[0];
  if (!row) return null;
  return rowToUser(row, true);
}

export async function deleteUserByEmail(email: string) {
  const res = await pool.query(
    "DELETE FROM users WHERE LOWER(email) = LOWER($1) RETURNING id",
    [email]
  );
  return res.rowCount ?? 0;
}
