import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Star, MessageCircle, TrendingUp, BarChart3, ShieldCheck, Loader2, Phone } from 'lucide-react';
import logo from './assets/logo.png';

const COLORS = ['#d4af37', '#1a1a1a', '#4a4a4a', '#8e8e8e'];

// הקישור הישיר לביקורות גוגל
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?sca_esv=26102ee7b85ee816&authuser=1&biw=402&bih=684&sxsrf=ANbL-n6w7b4vo5--ApxB7i_QQZDT-MgOHA:1772452874863&q=%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA+%D7%A2%D7%9C+%D7%91%D7%90%D7%A9%D7%A2%D7%A8%D7%98+%D7%A6%D7%A4%D7%AA&uds=ALYpb_maNyHQLHL0ydCZCaDrUGBX-w8GnUmnjWyNt36DCD_nY8KVGTOU6vHCA4dmbbGJAXNQ9abiTBFGJETZXf_iHhsr-b9BynDHp1lM5HQBI8bx9Pi98l_40FAHv0D-1O-H8_6l9GbxAwn3lIHjMB0WgPiocBc1fBFCozvhR5lBesT0pBan0JiHZkottX-mWwkwLghYVV4eFKqgHw0CpumCoExECnTbua5GYCgoTPUNEdNR9USOLSyCteXiAwDYwkr5BoTx4GIDAtlNX3224Nu6T-RYXzeKmWGWJEcsh_86f3WxaARw4uCirBnTupiUEBZCAG0E1xtgbzcxsO5qKn5kThpGwRX1gE47SNMdyCZGrpCoqzlJL7e5euAU2yM3Ixvs9VrKB8GQ35pcFHt6DFiCBA4-dJw5OMg02GR1DJnhPY_jQWbwVIjCWjp4N9iEGt46zzLPTZKuhXLF2DlFA9RzTV8jg9-r_KayulUtJABg9wYnkN6mllNAcpl0-XteaybBFycYBW0WQUkjgXatUSgFQC4addAv3Q&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORDrvfHHAhA8MwBJ8bPbpvEFP7erOXeDrsDSovldQKd1XQ1bVthraUr1g6u8CUzJPCxayH2PKzcf3SaJTqNQxg97htRw4XXOtIfH7Ahn-XqtoJP_ZA%3D%3D&sa=X&ved=2ahUKEwin2vK_lYGTAxWARP4FHTSXKZsQk8gLegQIGhAB&ictx=1#ebo=1";

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
        // עכשיו גם 4 וגם 5 כוכבים עוברים לגוגל
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
        alert("אופס, הייתה שגיאה בשליחה.");
      }
    } catch (error) {
      alert("חיבור לשרת נכשל.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-white overflow-x-hidden" dir="rtl">
      <div className="w-full md:w-1/2 bg-[#1a1a1a] flex flex-col items-center justify-center p-8 md:p-12">
        <img src={logo} alt="Logo" className="w-48 md:w-80 lg:w-[450px] mb-4 md:mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]" />
        <h1 className="text-4xl md:text-6xl font-serif italic text-[#d4af37]">Bashert</h1>
        <p className="text-[#d4af37] opacity-60 mt-2 tracking-[0.3em] uppercase text-xs md:text-sm">Elite Smokehouse</p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#fdfbf7]">
        {!showFeedback ? (
          <div className="w-full max-w-xl text-center space-y-10 py-10">
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
          <div className="w-full max-w-xl space-y-6 md:space-y-8 animate-fadeIn">
            <div className="border-r-4 md:border-r-8 border-[#d4af37] pr-4 md:pr-6">
              <h3 className="text-2xl md:text-4xl font-black text-gray-900">נשמח לשמוע מה קרה</h3>
              <p className="text-gray-500 font-bold text-sm md:text-base">אנחנו לוקחים כל משוב ברצינות</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <input type="text" value={formData.name} placeholder="שם מלא" className="w-full p-4 md:p-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]" 
                onChange={e => setFormData({...formData, name: e.target.value.replace(/[0-9]/g, '')})} />
              <input type="tel" value={formData.phone} maxLength="10" placeholder="טלפון" className="w-full p-4 md:p-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]" 
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['שירות', 'אוכל', 'ניקיון', 'אחר'].map(i => (
                <button key={i} onClick={() => setFormData({...formData, issue: i})} className={`py-3 md:py-5 rounded-xl font-bold transition-all ${formData.issue === i ? 'bg-black text-[#d4af37]' : 'bg-white text-gray-400 border'}`}>{i}</button>
              ))}
            </div>

            <textarea placeholder="ספר לנו קצת יותר..." className="w-full p-4 md:p-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 h-32 md:h-48 resize-none outline-none focus:ring-2 focus:ring-[#d4af37]" 
              onChange={e => setFormData({...formData, comment: e.target.value})} />
            
            <button onClick={handleSubmit} disabled={isSending} className="w-full bg-[#1a1a1a] text-[#d4af37] py-5 md:py-8 rounded-2xl font-black text-xl md:text-2xl shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all">
              {isSending ? <Loader2 className="animate-spin" /> : "שלח משוב ישיר להנהלה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/stats`)
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold">שגיאה בחיבור לשרת</div>;
  if (!data) return <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#d4af37] text-2xl animate-pulse font-black italic">טוען נתונים...</div>;

  return (
    <div className="min-h-screen w-full bg-[#f4f4f4] flex flex-col overflow-x-hidden" dir="rtl">
      <header className="w-full bg-white border-b p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-12 md:w-20" />
          <h1 className="text-xl md:text-3xl font-black text-gray-900">ניהול באשערט <span className="text-[#d4af37]">PRO</span></h1>
        </div>
        <div className="bg-black text-[#d4af37] px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
          <ShieldCheck size={16}/> Admin Mode
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard title="משובים" value={data.stats.total} color="bg-blue-600" />
          <StatCard title="ממוצע" value={data.stats.avgRating} color="bg-[#d4af37]" />
          <StatCard title="מגמה" value="+15%" color="bg-green-600" />
          <StatCard title="שביעות רצון" value="92%" color="bg-purple-600" />
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-black mb-8 border-b pb-4 text-gray-900">ביקורות אחרונות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.feedbacks.map(f => (
              <div key={f.id} className="p-6 bg-[#fdfbf7] rounded-2xl border border-[#eee0cb] hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-lg text-gray-900">{f.name}</span>
                  <span className="font-black text-[#d4af37] bg-black px-3 py-1 rounded-full text-sm">⭐ {f.rating}</span>
                </div>
                
                {/* הצגת טלפון עם כפתור חיוג מהיר */}
                <div className="flex items-center gap-3 mb-4 text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100 font-bold">
                  <Phone size={18} />
                  <a href={`tel:${f.phone}`} className="text-lg hover:underline tracking-wider">{f.phone}</a>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4 h-28 overflow-y-auto shadow-inner">
                  <p className="text-gray-700 italic text-sm leading-relaxed">"{f.comment}"</p>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span className="text-[#d4af37] bg-[#d4af37]/10 px-2 py-1 rounded">{f.issue}</span>
                  <span>{f.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 text-center md:text-right hover:scale-105 transition-transform">
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl text-white flex items-center justify-center shadow-lg ${color} text-xl font-bold`}>
      {title.charAt(0)}
    </div>
    <div>
      <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-tighter">{title}</p>
      <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-none">{value}</h2>
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
