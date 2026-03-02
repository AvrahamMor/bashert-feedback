const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// פתיחת השרת לבקשות מכל מקום (פותר את בעיית ה"אדום" ב-Console)
app.use(cors());
app.use(bodyParser.json());

// נתיב בדיקה - כדי שנדע שהשרת עובד
app.get('/', (req, res) => {
    res.send('Bashert Server is Running!');
});

// שמירת נתונים בזיכרון (כדי שהאתר יגיב מהר גם ב-Render)
let feedbacksMemory = [];

// ניסיון לקרוא נתונים קיימים אם השרת עולה מחדש
const DB_FILE = 'feedbacks.txt';
if (fs.existsSync(DB_FILE)) {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        feedbacksMemory = data.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));
        console.log(`Loaded ${feedbacksMemory.length} feedbacks from file`);
    } catch (e) {
        console.log("Starting with empty memory");
    }
}

// 1. קבלת הגדרות (למשל לינק לגוגל)
app.get('/api/config', (req, res) => {
    res.json({ 
        googleLink: "https://www.google.com/search?q=bashert+restaurant+reviews" 
    });
});

// 2. שמירת משוב חדש (POST)
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
    
    // ניסיון גיבוי לקובץ (ב-Render זה זמני, אבל טוב שיהיה)
    try {
        fs.appendFileSync(DB_FILE, JSON.stringify(feedback) + '\n');
    } catch (e) {
        console.error("File save error:", e.message);
    }

    console.log("✅ משוב חדש התקבל:", feedback.name, "דירוג:", feedback.rating);
    res.status(200).send({ message: "Success", feedback });
});

// 3. נתיב לאדמין - סטטיסטיקה ומשובים
app.get('/api/admin/stats', (req, res) => {
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

// שימוש בפורט דינמי עבור Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 השרת של באשערט באוויר בפורט ${PORT}`);
});
