const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// סיסמת מנהל ללוח הבקרה (תוכל לשנות אותה כאן למה שתרצה)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

// הגדרת החיבור המאובטח ל-Firebase
const serviceAccount = {
  "type": "service_account",
  "project_id": "bashert-feedback",
  "private_key_id": "3316364a637bb1520470b98281119bb787f43d15",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHFcqtAjwpAHkb\nmXHYhySyBNluF0cos4+s6l+h83UXahBD73dpJT5aohKdp+Aka5QxBLLt+VZpX8C9\nBh820jMsoLLRZ2uk75vLHBGvZfoseSiUeHYrwVPGHWK4LqwaR992RNJXX8P8uH7l\nmGAdTMlUYIGbZ2eYJMMmZZz2DWME8TMvqm8ETEPS73iG922LyjkRygXtYJyVsT3q\nKfUwNko7nFfNvRhy6rEfy4s9SFmFaODQRwI6+NV3vO5SQKcTDjwsG6x8kPKHm+ow\n6ewb8pLHmGS4WMel+FT4AYhJOBFScX0RDc4we9/XmqKaCJHHe8AaULWUQXW/WPNn\nerd0UcShAgMBAAECggEADV00dRdYpn/2S+3/AG6sqJk+vJnUwwdatlwn/fJz18CH\nmv0w4jQH0tmyWjbyCuqAe3yPQ6j12K5UJ9wzWDYVYqze6W5XLC6Rd2RI+Pc61frE\nHe4AMMESOJMHFMoSmikHonl4N+P2f2PQe4/A/qEwRU5nz4t0yXfI9IOPB81aP53l\nvIijjVjp1NGIjZQzeE44fFcs7pRpSz/sZEu2NT/OJuPFP8muHh3RctrzJTxb7gf0\n8FMv17JiG+HwFsnUttC0Gv45Yp+0Wg+VYDTGD6ugoJ0WGbIRak6LixP5jom0S3a6\nagXhIbXbI1qRownZbC2b0f+2cSer42vXOa7ai7Sq4QKBgQDiHpp979IVYnm9+JP4\nVFHrref1Rev4guPnCHKwN+1f0fNOJ7qucRe9PIpnJyp3+o4Iu77RsXm7/23tRO/R\n7lsFCtXonfR+CoXBIZeDVEdtQvlH5FA8YKEMSwU0HzZN+AR/Ps0UqtYKU/S80OA4\nD/zzF3r4C2wz1WoS+Y1zr59dVQKBgQDhZKQXD1RT5BA99qk5wVJ4nNAvRtHeogkQ\nV4bJZQXgSTHHELc8vyQsXvu9J9/SHlr2UqwaVZ24FQhcwcn5xA9V8yqWZIqXiHT3\nYJYM0Bra8UK97pjoljpuGEdHuGJZkoAzlaPQeRlGD+eOe98eq8wT/Nlcf+dkGugW\nxLQvkCNqHQKBgEJthStcKdaYcHVrsmSwuMRI+aznlrQSF8vGgpLcS0LsFdMu/rvC\ng5vXTj2RlvtaQyGzrhJCViXxmySqLN36bQjlLwRAaxQgGT0slitBth4WH8+L9jpW\nlNlcrLGsPbLYGtIa6/qXWXv9QBe8MTKnF8N+cWSvTmFH3/qlD3Yd8O5lAoGBALN/\nUq6Kpr2ogsbWCS7VprgnKiR8YebLZCx/h/gbW/KiV+IQjdzy2/v6KMEbYEQVqJtC\ne4z9Yf2XwnEcY51lZlEstl3O9BB5u6zGXrkVgk2alWxs95lDCoVjEGEtliV/Zlmu\ncic0ScxiHiZ6v9XNO1kvpGrl8YDnbK21OUonoAyBAoGAZFBScPTK3q7so0Ib9A52\nV1nyBk/Ky7NZOWBTiz1IQOSP8JMvo2PeFiCg8/pNTE8fLli2SuDAU2rAufDG8S15\nIxf27tAYx43gdaYnbLY9jQdPA7baVeiBm5/IvUmWrWn6SCvH98FUz+2cnQH6y/rk\nVBlAHlJobZyvcnW6QfmeNM4=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@bashert-feedback.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const FEEDBACKS_COLLECTION = 'feedbacks';

// Middleware לבדיקת אבטחה של האדמין
const authenticateAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// --- 1. נתיב שמירת משוב חדש (תואם לאתר הלקוח) ---
app.post('/api/feedbacks', async (req, res) => {
  try {
    // השרת מושך רק את מה שהאתר שולח: דירוג אחד ונושא
    const { name, phone, issue, comment, rating } = req.body;
    
    if (!rating) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    const newFeedback = {
      name: name || 'אנונימי',
      phone: phone || '',
      issue: issue || 'כללי',
      rating: Number(rating),
      comment: comment || '',
      date: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection(FEEDBACKS_COLLECTION).add(newFeedback);
    res.status(201).json({ message: 'Feedback saved successfully!', id: docRef.id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// --- 2. נתיב התחברות ללוח הבקרה ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

// --- 3. נתיב קבלת נתונים ללוח הבקרה (סטטיסטיקות + גרפים) ---
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection(FEEDBACKS_COLLECTION).orderBy('createdAt', 'desc').get();
    const feedbacks = [];
    snapshot.forEach(doc => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });

    // חישוב אוטומטי של הסטטיסטיקות עבור דף האדמין שלך
    const total = feedbacks.length;
    const avgRating = total > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : 0;
    
    const issuesCount = {
      'שירות': feedbacks.filter(f => f.issue === 'שירות').length,
      'אוכל': feedbacks.filter(f => f.issue === 'אוכל').length,
      'ניקיון': feedbacks.filter(f => f.issue === 'ניקיון').length,
      'אחר': feedbacks.filter(f => f.issue === 'אחר' || f.issue === 'כללי').length
    };

    res.json({
      stats: {
        total,
        avgRating: Number(avgRating),
        issues: issuesCount
      },
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- 4. נתיב מחיקת משוב ---
app.delete('/api/admin/feedback/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(FEEDBACKS_COLLECTION).doc(id).delete();
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Bashert Firebase Server running on port ${PORT}`);
});