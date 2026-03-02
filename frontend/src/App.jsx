import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Star, MessageCircle, TrendingUp, BarChart3, ShieldCheck, Loader2 } from 'lucide-react';
import logo from './assets/logo.png';

const COLORS = ['#d4af37', '#1a1a1a', '#4a4a4a', '#8e8e8e'];
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=%D7%9E%D7%A1%D7%A2%D7%93%D7%AA+%D7%91%D7%90%D7%A9%D7%A2%D7%A8%D7%98+-+Bashert+Restaurant+%28%D7%9E%D7%91%D7%99%D7%AA+%D7%9E%D7%A0%D7%93%D7%99%D7%A1+%D7%A6%D7%A4%D7%AA%29+%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA&sa=X&ved=2ahUKEwj42_OpuP2SAxXGa_EDHebTO08Q0bkNegQIKBAH&biw=1536&bih=695&dpr=1.25#lrd=0x151c237d14c4a971:0xdc52c82ef0cd09e0,3,,,,";

// משיכת כתובת ה-API מהגדרות Vercel או שימוש בשרת המקומי כגיבוי
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomerView = () => {
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", issue: "", comment: "" });

  const handleRating = (rate) => {
    setRating(rate);
    setTimeout(() => {
      if (rate >= 4) {
        window.location.href = GOOGLE_REVIEWS_URL;
      } else {
        setShowFeedback(true);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.phone.length < 10) return alert("נא למלא שם וטלפון תקין");
    
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rating })
      });

      if (response.ok) {
        alert("תודה! המשוב הועבר להנהלה לטיפול אישי.");
        setShowFeedback(false); 
        setRating(0);
        setFormData({ name: "", phone: "", issue: "", comment: "" });
      } else {
        alert("אופס, הייתה שגיאה בשליחה. נסה שוב מאוחר יותר.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("חיבור לשרת נכשל. וודא שהאינטרנט מחובר.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-white overflow-x-hidden" dir="rtl">
      {/* צד מיתוג - רספונסיבי */}
      <div className="w-full md:w-1/2 bg-[#1a1a1a] flex flex-col items-center justify-center p-8 md:p-12 transition-all">
        <img src={logo} alt="Logo" className="w-48 md:w-80 lg:w-[450px] mb-4 md:mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]" />
        <h1 className="text-4xl md:text-6xl font-serif italic text-[#d4af37]">Bashert</h1>
        <p className="text-[#d4af37] opacity-60 mt-2 tracking-[0.3em] uppercase text-xs md:text-sm">Elite Smokehouse</p>
      </div>

      {/* צד אינטראקציה - רספונסיבי */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#fdfbf7]">
        {!showFeedback ? (
          <div className="w-full max-w-xl text-center space-y-10 md:space-y-16 py-10">
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 leading-tight">איך היה בבאשערט?</h2>
            <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => handleRating(s)} className="text-5xl md:text-8xl transition-all transform hover:scale-125 active:scale-90">
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl space-y-6 md:space-y-8 animate-fadeIn py-6">
            <div className="border-r-4 md:border-r-8 border-[#d4af37] pr-4 md:pr-6">
              <h3 className="text-2xl md:text-4xl font-black text-gray-900">נשמח לשמוע מה קרה</h3>
              <p className="text-gray-500 font-bold text-sm md:text-base">אנחנו לוקחים כל משוב ברצינות</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <input type="text" value={formData.name} placeholder="שם מלא" className="w-full p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]" 
                onChange={e => setFormData({...formData, name: e.target.value.replace(/[0-9]/g, '')})} />
              <input type="tel" value={formData.phone} maxLength="10" placeholder="טלפון" className="w-full p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]" 
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['שירות', 'אוכל', 'ניקיון', 'אחר'].map(i => (
                <button key={i} onClick={() => setFormData({...formData, issue: i})} className={`py-3 md:py-5 rounded-xl font-bold transition-all ${formData.issue === i ? 'bg-black text-[#d4af37]' : 'bg-white text-gray-400 border border-gray-100'}`}>{i}</button>
              ))}
            </div>

            <textarea placeholder="ספר לנו קצת יותר..." className="w-full p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm ring-1 ring-gray-200 h-32 md:h-48 resize-none outline-none focus:ring-2 focus:ring-[#d4af37]" 
              onChange={e => setFormData({...formData, comment: e.target.value})} />
            
            <button onClick={handleSubmit} disabled={isSending} className="w-full bg-[#1a1a1a] text-[#d4af37] py-5 md:py-8 rounded-2xl md:rounded-3xl font-black text-xl md:text-2xl shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all">
              {isSending ? <Loader2 className="animate-spin" /> : "שלח משוב ישיר להנהלה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- דף מנהל (Admin Dashboard) ---
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/stats`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="h-screen flex items-center justify-center bg-red-50 text-red-600 p-10 text-center font-bold">שגיאה בחיבור לשרת: {error}<br/>וודא שה-Backend ב-Render עובד.</div>;
  if (!data) return <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#d4af37] text-2xl animate-pulse">טוען נתונים...</div>;

  const pieData = Object.keys(data.stats.issues).map(k => ({ name: k, value: data.stats.issues[k] }));

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] flex flex-col overflow-x-hidden" dir="rtl">
      <header className="w-full bg-white border-b p-4 md:p-6 flex flex-col md:row justify-between items-center gap-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-8">
          <img src={logo} alt="Logo" className="w-12 md:w-20" />
          <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter">ניהול באשערט <span className="text-[#d4af37]">PRO</span></h1>
        </div>
        <div className="bg-black text-[#d4af37] px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-[10px] md:text-xs">
          <ShieldCheck size={16}/> Admin Mode
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* כרטיסי סטטיסטיקה - רספונסיבי */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard title="משובים" value={data.stats.total} color="bg-blue-600" />
          <StatCard title="ממוצע" value={data.stats.avgRating} color="bg-[#d4af37]" />
          <StatCard title="מגמה" value="+15%" color="bg-green-600" />
          <StatCard title="שביעות רצון" value="92%" color="bg-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-3xl shadow-sm border h-[350px] md:h-[500px]">
            <h3 className="text-xl font-black mb-6">מגמת דירוג</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[ {n: 'א', v: 4.1}, {n: 'ב', v: 4.5}, {n: 'ג', v: 3.9}, {n: 'ד', v: 4.2}, {n: 'ה', v: data.stats.avgRating} ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="n" />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#d4af37" strokeWidth={4} dot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border">
            <h3 className="text-xl font-black mb-6">פילוח בעיות</h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border">
          <h3 className="text-2xl font-black mb-6">ביקורות אחרונות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {data.feedbacks.map(f => (
              <div key={f.id} className="p-6 bg-[#fdfbf7] rounded-2xl border border-[#eee0cb]">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-lg">{f.name}</span>
                  <span className="font-black text-[#d4af37]">⭐ {f.rating}</span>
                </div>
                <p className="text-gray-700 italic text-sm mb-4">"{f.comment}"</p>
                <div className="text-[10px] font-black uppercase text-[#d4af37]">{f.issue} | {f.date}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-right">
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl text-white flex items-center justify-center shadow-lg ${color} text-xl md:text-3xl font-bold`}>
      {title.charAt(0)}
    </div>
    <div>
      <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase">{title}</p>
      <h2 className="text-2xl md:text-4xl font-black text-gray-900">{value}</h2>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerView />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
