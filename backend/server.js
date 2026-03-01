const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. נתיב לקבלת ההגדרות (מה שהפייתון מעדכן ב-config.json)
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, '../automations/config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        res.json(JSON.parse(configData));
    } catch (error) {
        console.error("שגיאה בקריאת קובץ ההגדרות:", error);
        res.status(500).send({ error: "Could not read config file" });
    }
});

// 2. נתיב לקבלת משוב חדש ושמירתו (כולל ההערות המפורטות)
app.post('/api/feedback', (req, res) => {
    const feedback = { 
        id: Date.now(), 
        date: new Date().toLocaleString('he-IL'), 
        name: req.body.name,
        phone: req.body.phone,
        issue: req.body.issue,
        comment: req.body.comment || "הלקוח לא הוסיף הערה מילולית.",
        rating: req.body.rating 
    };

    try {
        // שמירת המשוב כשורת JSON בתוך קובץ הטקסט
        fs.appendFileSync('feedbacks.txt', JSON.stringify(feedback) + '\n');
        console.log("✅ משוב חדש נשמר בהצלחה:", feedback.name);
        res.status(200).send({ message: "Success" });
    } catch (error) {
        console.error("שגיאה בשמירת המשוב:", error);
        res.status(500).send({ error: "Failed to save feedback" });
    }
});

// 3. נתיב לשליחת הסטטיסטיקה והמשובים ללוח הניהול (Admin)
app.get('/api/admin/stats', (req, res) => {
    try {
        if (!fs.existsSync('feedbacks.txt')) {
            return res.json({ stats: { total: 0, avgRating: 0, issues: {} }, feedbacks: [] });
        }

        const data = fs.readFileSync('feedbacks.txt', 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const feedbacks = lines.map(line => JSON.parse(line));
        
        const issues = { 'שירות': 0, 'אוכל': 0, 'ניקיון': 0, 'אחר': 0 };
        let sumRating = 0;

        feedbacks.forEach(f => {
            if (issues[f.issue] !== undefined) issues[f.issue]++;
            sumRating += f.rating;
        });

        res.json({
            stats: {
                total: feedbacks.length,
                avgRating: feedbacks.length ? (sumRating / feedbacks.length).toFixed(1) : 0,
                issues: issues
            },
            feedbacks: feedbacks.reverse().slice(0, 10) // מציג את 10 המשובים האחרונים
        });
    } catch (error) {
        console.error("שגיאה בעיבוד הסטטיסטיקה:", error);
        res.status(500).send({ error: "Stats calculation failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 השרת של באשערט רץ בפורט ${PORT}`);
});