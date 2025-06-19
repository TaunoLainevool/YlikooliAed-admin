// server.js
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

//init ajal lisa enda baasi andmed
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'aed',
    password: 'psql',
    port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Authentication middleware for pages (redirects to login)
const requireAuthPage = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
};

const initDB = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin BOOLEAN NOT NULL DEFAULT FALSE 
      )
    `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
};

// Public routes (no authentication required)
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Vali uus kasutaja' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user into database
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );

        // DO NOT set session variables here - just return success
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE (username = $1 OR email = $1) and admin = TRUE',
            [username]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Vigane e-posti aadress või salasõna' });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: 'Vigane e-posti aadress või salasõna' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Viga andmete laadmisel' });
    }
});

// Protected routes - require authentication
app.post('/api/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Tehniline viga!' });
        }
        res.json({ success: true });
    });
});

app.get('/api/profile', requireAuth, (req, res) => {
    res.json({
        userId: req.session.userId,
        username: req.session.username
    });
});

// Protected page routes
app.get('/add', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add.html'));
});

app.get('/update', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update.html'));
});

app.get('/delete', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});

app.get('/hiscores', requireAuthPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hiscores.html'));
});

// Protected API routes
app.get('/api/scores', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, player_name, score, created_at
             FROM scores
             WHERE 1=1
             ORDER BY score DESC, created_at ASC `
        );

        res.json({
            success: true,
            scores: result.rows
        });

    } catch (err) {
        console.error('Viga andmete laadmisel:', err);
        res.status(500).json({
            success: false,
            error: 'Viga andmete laadmisel'
        });
    }
});

app.get('/api/stats', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                 COUNT(*) as total_games,
                 MAX(score) as highest_score,
                 AVG(score)::INTEGER as average_score,
                 COUNT(DISTINCT player_name) as unique_players
             FROM scores`,
        );

        res.json({
            success: true,
            scores: result.rows
        });

    } catch (err) {
        console.error('Viga andmete laadmisel:', err);
        res.status(500).json({
            success: false,
            error: 'Viga andmete laadmisel'
        });
    }
});

app.get('/api/quizzes', requireAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Viga küsimuste laadimisel' });
    }
});

app.post('/api/quizzes', requireAuth, async (req, res) => {
    const { title, question, option_a, option_b, option_c, option_d, correct_answer } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO quizzes (title, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (trim($1), $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, question, option_a, option_b, option_c, option_d, correct_answer.toUpperCase()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Küsimuse lisamine' });
    }
});

app.delete('/api/quizzes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Küsimust ei leitud!' });
        }
        res.json({ message: 'Küsimus kustutatud edukalt!', quiz: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Küsimuse kustutamine ebaõnnestus!' });
    }
});

app.get('/api/quizzes/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/quizzes/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, question, option_a, option_b, option_c, option_d, correct_answer } = req.body;

        const result = await pool.query(
            `UPDATE quizzes
             SET title = $1, question = $2, option_a = $3, option_b = $4, option_c = $5, option_d = $6, correct_answer = $7
             WHERE id = $8 RETURNING *`,
            [title, question, option_a, option_b, option_c, option_d, correct_answer, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});