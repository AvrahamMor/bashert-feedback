const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// הגדרת החיבור המאובטח ל-Firebase באמצעות המפתח שסיפקת
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

// 1. קבלת כל המשובים (עבור דף הניהול שלך)
app.get('/api/feedbacks', async (req, res) => {
  try {
    const snapshot = await db.collection(FEEDBACKS_COLLECTION).orderBy('createdAt', 'desc').get();
    const feedbacks = [];
    snapshot.forEach(doc => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// 2. שמירת משוב חדש (כשלשקוח ממלא את הטופס)
app.post('/api/feedbacks', async (req, res) => {
  try {
    const { name, phone, foodRating, serviceRating, cleanRating, generalRating, comment } = req.body;
    
    if (!foodRating || !serviceRating || !cleanRating || !generalRating) {
      return res.status(400).json({ error: 'All ratings are required' });
    }

    const newFeedback = {
      name: name || 'אנונימי',
      phone: phone || '',
      foodRating: Number(foodRating),
      serviceRating: Number(serviceRating),
      cleanRating: Number(cleanRating),
      generalRating: Number(generalRating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection(FEEDBACKS_COLLECTION).add(newFeedback);
    res.status(201).json({ message: 'Feedback saved successfully!', id: docRef.id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Bashert Firebase Server running on port ${PORT}`);
});