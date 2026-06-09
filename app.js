const express = require('express');
const db = require('./DB');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ============= АДМИН-ДАННЫЕ =============
const ADMIN_LOGIN = 'Admin26';
const ADMIN_PASSWORD = 'Demo20';

// ============= АДМИН-МАРШРУТЫ =============

// Админ-вход
app.post('/api/admin/login', (req, res) => {
    const { login, password } = req.body;
    
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        res.json({ 
            success: true, 
            admin: { 
                login: ADMIN_LOGIN,
                role: 'admin'
            } 
        });
    } else {
        res.status(401).json({ error: 'Неверный логин или пароль администратора' });
    }
});

// Получение всех заявок (для админа)
app.get('/api/admin/applications', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT a.*, u.login, u.fcs as fullname, u.email, u.phone, t.name as transport_name
            FROM applications a
            JOIN user_a u ON a.user_id = u.id
            LEFT JOIN transport t ON a.transport_id = t.id
            ORDER BY a.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения заявок:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Изменение статуса заявки (для админа)
app.put('/api/admin/applications/:id/status', async (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;
    
    const allowedStatuses = ['Новая', 'Идет обучение', 'Обучение завершено'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
    }
    
    try {
        const result = await db.query(
            'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
            [status, applicationId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }
        
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        console.error('Ошибка обновления статуса:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ============= ПОЛЬЗОВАТЕЛЬСКИЕ МАРШРУТЫ =============

// Регистрация
app.post('/api/register', async (req, res) => {
    const { fullname, username, email, phone, birthdate, password } = req.body;
    
    try {
        const checkUser = await db.query(
            'SELECT * FROM user_a WHERE login = $1 OR email = $2',
            [username, email]
        );
        
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
        }
        
        const result = await db.query(
            `INSERT INTO user_a (login, password, fcs, email, phone, date_of_birth, role_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, login, email, fcs, phone, date_of_birth`,
            [username, password, fullname, email, phone, birthdate, 1]
        );
        
        console.log(`✅ Новый пользователь: ${username}`);
        
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

// Вход пользователя
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

// Создание новой заявки
app.post('/api/applications', async (req, res) => {
    const { user_id, transport_id, methods_of_payment } = req.body;
    
    try {
        const result = await db.query(
            `INSERT INTO applications (status, user_id, methods_of_payment, start_time, transport_id) 
             VALUES ($1, $2, $3, NOW(), $4) 
             RETURNING *`,
            ['Новая', user_id, methods_of_payment, transport_id]
        );
        
        res.json({ success: true, application: result.rows[0] });
    } catch (err) {
        console.error('Ошибка создания заявки:', err);
        res.status(500).json({ error: 'Ошибка сервера при создании заявки' });
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

// ============= ЗАПУСК СЕРВЕРА =============
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n✅ СЕРВЕР ЗАПУЩЕН!');
    console.log('📍 http://localhost:3000\n');
    console.log('👨‍💻 ПОЛЬЗОВАТЕЛЬСКИЕ СТРАНИЦЫ:');
    console.log('   - http://localhost:3000/login.html');
    console.log('   - http://localhost:3000/register.html');
    console.log('   - http://localhost:3000/dashboard.html\n');
    console.log('👨‍💼 АДМИН-ПАНЕЛЬ:');
    console.log('   - http://localhost:3000/admin-login.html');
    console.log('   - Логин: Admin26');
    console.log('   - Пароль: Demo20\n');
});