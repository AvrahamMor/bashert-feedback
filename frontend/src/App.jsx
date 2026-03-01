import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Star, MessageCircle, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import logo from './assets/logo.png';

const COLORS = ['#d4af37', '#1a1a1a', '#4a4a4a', '#8e8e8e'];

// הקישור ששלחת לביקורות בגוגל
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=%D7%9E%D7%A1%D7%A2%D7%93%D7%AA+%D7%91%D7%90%D7%A9%D7%A2%D7%A8%D7%98+-+Bashert+Restaurant+%28%D7%9E%D7%91%D7%99%D7%AA+%D7%9E%D7%A0%D7%93%D7%99%D7%A1+%D7%A6%D7%A4%D7%AA%29+%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA&sa=X&ved=2ahUKEwj42_OpuP2SAxXGa_EDHebTO08Q0bkNegQIKBAH&biw=1536&bih=695&dpr=1.25#lrd=0x151c237d14c4a971:0xdc52c82ef0cd09e0,3,,,,";

const CustomerView = () => {
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", issue: "", comment: "" });

  const handleRating = (rate) => {
    setRating(rate);
    setTimeout(() => {
      if (rate >= 4) {
        // לקוח מרוצה מועבר ישר לגוגל
        window.location.href = GOOGLE_REVIEWS_URL;
      } else {
        // לקוח פחות מרוצה נשאר למשוב פנימי
        setShowFeedback(true);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.phone.length < 10) return alert("נא למלא שם וטלפון תקין");
    await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, rating })
    });
    alert("תודה! המשוב הועבר להנהלה לטיפול אישי.");
    setShowFeedback(false); setRating(0);
    setFormData({ name: "", phone: "", issue: "", comment: "" });
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-white" dir="rtl">
      {/* צד מיתוג ענק - תופס חצי מסך */}
      <div className="w-full md:w-1/2 bg-[#1a1a1a] flex flex-col items-center justify-center p-12 relative">
        <img src={logo} alt="Logo" className="w-80 md:w-[500px] mb-8 drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]" />
        <h1 className="text-6xl font-serif italic text-[#d4af37]">Bashert</h1>
        <p className="text-[#d4af37] opacity-60 mt-4 tracking-[0.5em] uppercase text-sm">Elite Smokehouse</p>
      </div>

      {/* צד אינטראקציה - תופס חצי מסך */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-12 bg-[#fdfbf7]">
        {!showFeedback ? (
          <div className="w-full max-w-2xl text-center space-y-16">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">איך היה בבאשערט?</h2>
            <div className="flex justify-between items-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => handleRating(s)} className="text-7xl md:text-9xl transition-all transform hover:scale-125">
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8 animate-fadeIn">
            <div className="border-r-8 border-[#d4af37] pr-6">
              <h3 className="text-4xl font-black text-gray-900">נשמח לשמוע מה קרה</h3>
              <p className="text-gray-500 font-bold">אנחנו לוקחים כל משוב ברצינות</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" value={formData.name} placeholder="שם מלא" className="w-full p-6 bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-200 outline-none focus:ring-4 focus:ring-[#d4af37]/20 text-xl" 
                onChange={e => setFormData({...formData, name: e.target.value.replace(/[0-9]/g, '')})} />
              <input type="tel" value={formData.phone} maxLength="10" placeholder="טלפון" className="w-full p-6 bg-white rounded-2xl shadow-sm border-none ring-1 ring-gray-200 outline-none focus:ring-4 focus:ring-[#d4af37]/20 text-xl" 
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {['שירות', 'אוכל', 'ניקיון', 'אחר'].map(i => (
                <button key={i} onClick={() => setFormData({...formData, issue: i})} className={`py-5 rounded-2xl font-black transition-all shadow-sm ${formData.issue === i ? 'bg-black text-[#d4af37]' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>{i}</button>
              ))}
            </div>

            <textarea placeholder="ספר לנו קצת יותר כדי שנוכל להשתפר..." className="w-full p-6 bg-white rounded-3xl shadow-sm ring-1 ring-gray-200 h-48 resize-none outline-none focus:ring-4 focus:ring-[#d4af37]/20 text-xl" 
              onChange={e => setFormData({...formData, comment: e.target.value})} />
            
            <button onClick={handleSubmit} className="w-full bg-[#1a1a1a] text-[#d4af37] py-8 rounded-3xl font-black text-2xl shadow-2xl hover:bg-black transition-all">שלח משוב ישיר להנהלה</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- דף מנהל (Admin) - נשאר רחב ומקצועי ---
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#d4af37] text-3xl font-black italic">טוען נתונים...</div>;

  const pieData = Object.keys(data.stats.issues).map(k => ({ name: k, value: data.stats.issues[k] }));

  return (
    <div className="min-h-screen w-screen bg-[#f4f4f4] flex flex-col" dir="rtl">
      <header className="w-full bg-white border-b border-gray-200 p-6 flex justify-between items-center px-12 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <img src={logo} alt="Logo" className="w-20" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">ניהול באשערט <span className="text-[#d4af37]">PRO</span></h1>
        </div>
        <div className="bg-black text-[#d4af37] px-6 py-3 rounded-xl flex items-center gap-3 font-bold uppercase tracking-widest text-xs">
          <ShieldCheck size={20}/> Admin Mode
        </div>
      </header>

      <main className="flex-1 p-8 space-y-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatCard icon={<Users size={40}/>} title="משובים" value={data.stats.total} color="bg-blue-600" />
          <StatCard icon={<Star size={40}/>} title="דירוג ממוצע" value={data.stats.avgRating} color="bg-[#d4af37]" />
          <StatCard icon={<TrendingUp size={40}/>} title="מגמה" value="+15%" color="bg-green-600" />
          <StatCard icon={<BarChart3 size={40}/>} title="שביעות רצון" value="92%" color="bg-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 h-[500px]">
            <h3 className="text-2xl font-black mb-10">מגמת דירוג שבועית</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[ {n: 'א', v: 4.1}, {n: 'ב', v: 4.5}, {n: 'ג', v: 3.9}, {n: 'ד', v: 4.2}, {n: 'ה', v: data.stats.avgRating} ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="n" />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#d4af37" strokeWidth={6} dot={{r: 8, fill: '#1a1a1a', stroke: '#d4af37'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-10">פילוח בעיות</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl font-bold">
                  <span>{d.name}</span>
                  <span style={{color: COLORS[i % COLORS.length]}}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-3xl font-black mb-8">ביקורות אחרונות</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.feedbacks.map(f => (
              <div key={f.id} className="p-8 bg-[#fdfbf7] rounded-[2rem] border border-[#eee0cb] hover:border-[#d4af37] transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-[#d4af37] rounded-xl flex items-center justify-center font-black">{f.name.charAt(0)}</div>
                    <div>
                      <span className="block font-black text-lg">{f.name}</span>
                      <span className="text-xs text-gray-400">{f.date}</span>
                    </div>
                  </div>
                  <div className="font-black text-[#d4af37]">⭐ {f.rating}</div>
                </div>
                <p className="text-gray-700 italic bg-white p-5 rounded-2xl border h-32 overflow-y-auto">"{f.comment}"</p>
                <div className="mt-4 text-xs font-black uppercase text-[#d4af37]">{f.issue}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-8">
    <div className={`p-6 rounded-[2rem] text-white shadow-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-black text-gray-400 uppercase mb-1">{title}</p>
      <h2 className="text-5xl font-black text-gray-900">{value}</h2>
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