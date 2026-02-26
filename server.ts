import express from 'express';
import { createServer as createViteServer } from 'vite';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-dev';

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sheets (
        id VARCHAR(255) PRIMARY KEY,
        custody_number VARCHAR(255) NOT NULL,
        custody_amount DECIMAL(10, 2) NOT NULL,
        employee_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expense_lines (
        id VARCHAR(255) PRIMARY KEY,
        sheet_id VARCHAR(255) REFERENCES sheets(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        company VARCHAR(255) NOT NULL,
        tax_number VARCHAR(255),
        invoice_number VARCHAR(255),
        description TEXT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        bank_fees DECIMAL(10, 2),
        buyer_name VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    client.release();
  }
}

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if user exists
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
        [email, passwordHash, name]
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ token, user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء التسجيل' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const user = result.rows[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
    }
  });

  // API Routes
  app.get('/api/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
      res.status(500).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.get('/api/sheets', authenticateToken, async (req, res) => {
    try {
      // In a real app, you might filter by req.user.id if it's an employee
      const sheetsResult = await pool.query('SELECT * FROM sheets ORDER BY last_modified DESC');
      const linesResult = await pool.query('SELECT * FROM expense_lines');
      
      const sheets = sheetsResult.rows.map(sheet => {
        return {
          ...sheet,
          custody_amount: parseFloat(sheet.custody_amount),
          lines: linesResult.rows
            .filter(line => line.sheet_id === sheet.id)
            .map(line => ({
              ...line,
              amount: parseFloat(line.amount),
              bank_fees: line.bank_fees ? parseFloat(line.bank_fees) : undefined,
              date: new Date(line.date).toISOString().split('T')[0] // Format date back to YYYY-MM-DD
            }))
        };
      });
      
      res.json(sheets);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/sheets', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const sheet = req.body;
      
      // Upsert Sheet
      await client.query(`
        INSERT INTO sheets (id, custody_number, custody_amount, employee_id, status, notes, created_at, last_modified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          custody_number = EXCLUDED.custody_number,
          custody_amount = EXCLUDED.custody_amount,
          employee_id = EXCLUDED.employee_id,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          last_modified = EXCLUDED.last_modified
      `, [sheet.id, sheet.custody_number, sheet.custody_amount, sheet.employee_id, sheet.status, sheet.notes, sheet.created_at, sheet.last_modified]);

      // Delete existing lines for this sheet to replace them
      await client.query('DELETE FROM expense_lines WHERE sheet_id = $1', [sheet.id]);

      // Insert new lines
      if (sheet.lines && sheet.lines.length > 0) {
        for (const line of sheet.lines) {
          await client.query(`
            INSERT INTO expense_lines (id, sheet_id, date, company, tax_number, invoice_number, description, reason, amount, bank_fees, buyer_name, notes, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [line.id, sheet.id, line.date, line.company, line.tax_number, line.invoice_number, line.description, line.reason, line.amount, line.bank_fees, line.buyer_name, line.notes, line.created_at]);
        }
      }

      await client.query('COMMIT');
      res.json(sheet);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saving sheet:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
