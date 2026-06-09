const express = require('express');
const db = require('./DB');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ============= API МАРШРУТЫ =============

// Регистрация с новыми полями
app.post('/api/register', async (req, res) => {
    const { fullname, username, email, phone, birthdate, password } = req.body;
    
    try {
        // Проверяем, есть ли такой пользователь
        const checkUser = await db.query(
            'SELECT * FROM user_a WHERE login = $1 OR email = $2',
            [username, email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
        }
        
        // Добавляем нового пользователя (role_id = 1 - обычный пользователь)
        const result = await db.query(
            `INSERT INTO user_a (login, password, fcs, email, phone, date_of_birth, role_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, login, email, fcs, phone, date_of_birth`,
            [username, password, fullname, email, phone, birthdate, 1]
        );
        
        console.log(`✅ Новый пользователь зарегистрирован: ${username}`);
        
        res.json({ 
            success: true, 
            user: {
                id: result.rows[0].id,
                username: result.rows[0].login,
                email: result.rows[0].email,
                fullname: result.rows[0].fcs,
                phone: result.rows[0].phone,
                birthdate: result.rows[0].date_of_birth
            }
        });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
});

// Вход
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    
    try {
        const result = await db.query(
            `SELECT id, login, email, fcs as fullname, phone, date_of_birth 
             FROM user_a 
             WHERE (login = $1 OR email = $1) AND password = $2`,
            [login, password]
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    username: user.login,
                    email: user.email,
                    fullname: user.fullname,
                    phone: user.phone,
                    birthdate: user.date_of_birth
                }
            });
        } else {
            res.status(401).json({ error: 'Неверный логин или пароль' });
        }
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
});

// Получение заявок пользователя
app.get('/api/applications/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const result = await db.query(
            `SELECT a.*, t.name as transport_name 
             FROM applications a
             LEFT JOIN transport t ON a.transport_id = t.id
             WHERE a.user_id = $1
             ORDER BY a.start_time DESC`,
            [userId]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения заявок:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех пользователей (для админа)
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, login, fcs, email, phone, date_of_birth, created_at FROM user_a'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n✅ СЕРВЕР ЗАПУЩЕН!');
    console.log('📍 http://localhost:3000\n');
    console.log('📄 Страницы:');
    console.log('http://localhost:3000/login.html');
    console.log('http://localhost:3000/register.html');
    console.log('http://localhost:3000/dashboard.html');
});