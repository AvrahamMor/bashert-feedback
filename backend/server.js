// ייבוא מודולים נדרשים
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// יצירת אפליקציית Express
const app = express();

// קבלת סיסמת אדמין מהמשתנים הסביבתיים
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// הגדרת CORS ו-JSON parsing
app.use(cors());
app.use(bodyParser.json());

// נתיב בדיקה בסיסי
app.get('/', (req, res) => {
    res.send('Bashert Server is Running!');
});

// נתיב לבדיקת שימוש בזיכרון
app.get('/api/memory', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
        feedbacksCount: feedbacksMemory.length
    });
});

// שמירת נתונים בזיכרון לצורך ביצועים מהירים
let feedbacksMemory = [];

// נתיב לקובץ JSON של המשובים
const JSON_DB_FILE = path.join(__dirname, 'feedbacks.json');

// פונקציה לשמירת המשובים לקובץ JSON
const saveFeedbacksToJson = (items) => {
    try {
        fs.writeFileSync(JSON_DB_FILE, JSON.stringify(items, null, 2), 'utf8');
    } catch (err) {
        console.error('Unable to save JSON database:', err.message);
    }
};

// פונקציה לטעינת המשובים מקובץ JSON
const loadFeedbacksFromJson = () => {
    if (fs.existsSync(JSON_DB_FILE)) {
        try {
            const raw = fs.readFileSync(JSON_DB_FILE, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            console.error('Unable to parse JSON database, starting empty:', err.message);
            return [];
        }
    }
    return [];
};

// טעינת המשובים מהקובץ בעת הפעלת השרת
feedbacksMemory = loadFeedbacksFromJson();
console.log(`Loaded ${feedbacksMemory.length} feedbacks from JSON database`);

// נתיב לקבלת הגדרות (למשל קישור לגוגל)
app.get('/api/config', (req, res) => {
    res.json({
        googleLink: "https://www.google.com/search?q=bashert+restaurant+reviews"
    });
});

// נתיב לשמירת משוב חדש
app.post('/api/feedback', (req, res) => {
    const feedback = {
        id: Date.now(),
        date: new Date().toLocaleString('he-IL'),
        name: req.body.name || "אנונימי",
        phone: req.body.phone || "לא צוין",
        issue: req.body.issue || "כללי",
        comment: req.body.comment || "ללא הערה",
        rating: req.body.rating
    };

    feedbacksMemory.push(feedback);

    // הגבלת הזיכרון - שמור רק את 1000 המשובים האחרונים
    if (feedbacksMemory.length > 1000) {
        feedbacksMemory = feedbacksMemory.slice(-1000);
    }

    saveFeedbacksToJson(feedbacksMemory);

    console.log("✅ משוב חדש התקבל:", feedback.name, "דירוג:", feedback.rating);
    res.status(200).send({ message: "Success", feedback });
});

// נתיב לאימות אדמין
app.post('/api/admin/login', (req, res) => {
    if (!ADMIN_PASSWORD) {
        return res.status(500).json({ message: 'Admin password not configured.' });
    }

    const password = req.body.password;
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin password.' });
    }

    res.json({ success: true });
});

// נתיב לקבלת סטטיסטיקות אדמין
app.get('/api/admin/stats', (req, res) => {
    if (!ADMIN_PASSWORD || req.get('x-admin-password') !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    feedbacksMemory = loadFeedbacksFromJson();

    const issues = { 'שירות': 0, 'אוכל': 0, 'ניקיון': 0, 'אחר': 0 };
    let sumRating = 0;

    feedbacksMemory.forEach(f => {
        if (issues[f.issue] !== undefined) issues[f.issue]++;
        sumRating += f.rating;
    });

    res.json({
        stats: {
            total: feedbacksMemory.length,
            avgRating: feedbacksMemory.length ? (sumRating / feedbacksMemory.length).toFixed(1) : 0,
            issues: issues
        },
        feedbacks: [...feedbacksMemory].reverse().slice(0, 30) // מחזיר את ה-30 האחרונים
    });
});

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 השרת של באשערט באוויר בפורט ${PORT}`);
});
