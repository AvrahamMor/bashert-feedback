const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// עדכון CORS: מאפשר לכל האתרים (כולל Vercel שלך) לגשת לשרת
app.use(cors());
app.use(bodyParser.json());

// נתיב זמני לשמירת נתונים בזיכרון (כדי למנוע שגיאות כתיבה לקבצים ב-Render)
let feedbacksMemory = [];

// טעינה ראשונית מקובץ אם הוא קיים (למקרה שהשרת רץ מקומית)
if (fs.existsSync('feedbacks.txt')) {
    try {
        const data = fs.readFileSync('feedbacks.txt', 'utf8');
        feedbacksMemory = data.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));
    } catch (e) {
        console.log("Starting with empty memory");
    }
}

// 1. נתיב לקבלת ההגדרות
app.get('/api/config', (req, res) => {
    // ב-Render הקובץ הזה כנראה לא יהיה קיים באותו נתיב, אז נחזיר ערך ברירת מחדל אם הוא נכשל
    try {
        const configPath = path.join(__dirname, '../automations/config.json');
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return res.json(JSON.parse(configData));
        }
        res.json({ googleLink: "https://google.com" }); // לינק ברירת מחדל
    } catch (error) {
        res.json({ googleLink: "https://google.com" });
    }
});

// 2. נתיב לקבלת משוב חדש
app.post('/api/feedback', (req, res) => {
    const feedback = { 
        id: Date.now(), 
        date: new Date().toLocaleString('he-IL'), 
        name: req.body.name || "אנונימי",
        phone: req.body.phone || "לא צוין",
        issue: req.body.issue || "כללי",
        comment: req.body.comment || "הלקוח לא הוסיף הערה מילולית.",
        rating: req.body.rating 
    };

    feedbacksMemory.push(feedback);
    
    // ננסה גם לכתוב לקובץ (יעבוד רק מקומית, ב-Render זה ימחק כל כמה זמן)
    try {
        fs.appendFileSync('feedbacks.txt', JSON.stringify(feedback) + '\n');
    } catch (e) {
        console.log("Could not write to file, kept in memory");
    }

    console.log("✅ משוב חדש התקבל:", feedback.name);
    res.status(200).send({ message: "Success", feedback });
});

// 3. נתיב לניהול (Admin)
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
        feedbacks: [...feedbacksMemory].reverse().slice(0, 20)
    });
});

// חשוב ל-Render: להשתמש בפורט שהם נותנים או ב-5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 השרת של באשערט רץ בפורט ${PORT}`);
});
