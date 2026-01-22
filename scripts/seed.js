import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

const email = 'admin@empresa.local';
const name = 'Admin';
const password = 'Admin@123';

const hash = await bcrypt.hash(password, 12);

await sql`
  INSERT INTO users (email, name, password_hash, role, can_view_sensitive, status, must_reset_password)
  VALUES (${email}, ${name}, ${hash}, 'ADMIN', true, 'ACTIVE', true)
  ON CONFLICT (email) DO NOTHING;
`;

console.log('Seed concluído.');
