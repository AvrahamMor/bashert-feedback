import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Loader2 } from 'lucide-react';
import logo from './assets/logo.png';

const COLORS = ['#d4af37', '#1a1a1a', '#4a4a4a', '#8e8e8e'];

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%95%D7%AA+%D7%A2%D7%9C+%D7%91%D7%90%D7%A9%D7%A2%D7%A8%D7%98+%D7%A6%D7%A4%D7%AA";

const API_BASE_URL = "https://bashert-feedback.onrender.com";

const ADMIN_PASSWORD = "1234";

const AdminLogin = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) return;

    setIsLoading(true);
    await onLogin(password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#f4f4f4] p-8" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
        <h2 className="text-3xl font-black text-gray-900 mb-6">כניסת מנהל</h2>

        <p className="text-gray-600 mb-6">
          הזן את הסיסמה כדי לגשת ללוח הניהול.
        </p>

        <input
          type="password"
          value={password}
          placeholder="סיסמה"
          className="w-full p-4 rounded-2xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-[#d4af37]"
          onChange={e => setPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-600 font-bold mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-[#1a1a1a] text-[#d4af37] py-4 rounded-2xl font-black text-lg hover:opacity-90 transition"
        >
          {isLoading ? 'טוען...' : 'התחבר'}
        </button>
      </div>
    </div>
  );
};

const AdminRoute = ({ authenticated, onLogin, onLogout, loginError }) => {
  if (!authenticated) {
    return <AdminLogin onLogin={onLogin} error={loginError} />;
  }

  return <AdminDashboard onLogout={onLogout} />;
};

const CustomerView = () => {
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    issue: "",
    comment: ""
  });

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
    if (!formData.name.trim() || formData.phone.length < 10) {
      alert("נא למלא שם וטלפון תקין");
      return;
    }

    if (!rating) {
      alert("נא לבחור דירוג");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          issue: formData.issue || 'אחר',
          comment: formData.comment,
          rating: rating
        })
      });

      if (response.ok) {
        alert("תודה! המשוב הועבר להנהלה לטיפול אישי.");

        setShowFeedback(false);
        setRating(0);
        setFormData({
          name: "",
          phone: "",
          issue: "",
          comment: ""
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "אופס, הייתה שגיאה בשליחה.");
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
        <img
          src={logo}
          alt="Logo"
          className="w-48 md:w-80 lg:w-[450px] mb-4 md:mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        />

        <h1 className="text-4xl md:text-6xl font-serif italic text-[#d4af37]">
          Bashert
        </h1>

        <p className="text-[#d4af37] opacity-60 mt-2 tracking-[0.3em] uppercase text-xs md:text-sm">
          Elite Smokehouse
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#fdfbf7]">
        {!showFeedback ? (
          <div className="w-full max-w-xl text-center space-y-10 py-10">
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 leading-tight">
              איך היה בבאשערט?
            </h2>

            <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => handleRating(s)}
                  className="text-5xl md:text-8xl transition-all transform hover:scale-125 active:scale-90"
                >
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl space-y-6 md:space-y-8 animate-fadeIn">
            <div className="border-r-4 md:border-r-8 border-[#d4af37] pr-4 md:pr-6">
              <h3 className="text-2xl md:text-4xl font-black text-gray-900">
                נשמח לשמוע מה קרה
              </h3>

              <p className="text-gray-500 font-bold text-sm md:text-base">
                אנחנו לוקחים כל משוב ברצינות
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <input
                type="text"
                value={formData.name}
                placeholder="שם מלא"
                className="w-full p-4 md:p-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]"
                onChange={e =>
                  setFormData({
                    ...formData,
                    name: e.target.value.replace(/[0-9]/g, '')
                  })
                }
              />

              <input
                type="tel"
                value={formData.phone}
                maxLength="10"
                placeholder="טלפון"
                className="w-full p-4 md:p-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#d4af37]"
                onChange={e =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, '')
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['שירות', 'אוכל', 'ניקיון', 'אחר'].map(i => (
                <button
                  key={i}
                  onClick={() => setFormData({ ...formData, issue: i })}
                  className={`py-3 md:py-5 rounded-xl font-bold transition-all ${
                    formData.issue === i
                      ? 'bg-black text-[#d4af37]'
                      : 'bg-white text-gray-400 border'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            <textarea
              value={formData.comment}
              placeholder="ספר לנו קצת יותר..."
              className="w-full p-4 md:p-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 h-32 md:h-48 resize-none outline-none focus:ring-2 focus:ring-[#d4af37]"
              onChange={e =>
                setFormData({
                  ...formData,
                  comment: e.target.value
                })
              }
            />

            <button
              onClick={handleSubmit}
              disabled={isSending}
              className="w-full bg-[#1a1a1a] text-[#d4af37] py-5 md:py-8 rounded-2xl font-black text-xl md:text-2xl shadow-xl flex justify-center items-center gap-3 active:scale-95 transition-all"
            >
              {isSending ? <Loader2 className="animate-spin" /> : "שלח משוב ישיר להנהלה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theme, setTheme] = useState('dark');

  const isDark = theme === 'dark';

  const themeStyles = {
    root: isDark ? 'bg-[#0b0b0f] text-white' : 'bg-slate-100 text-slate-950',
    header: isDark ? 'bg-slate-950/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-950',
    panel: isDark ? 'bg-slate-950/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-950',
    panelAlt: isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-950',
    card: isDark ? 'bg-slate-950/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-950',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    infoBox: isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-950',
    iconButton: isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-950 text-white hover:bg-slate-900'
  };

  const statCardClass = `${themeStyles.card} p-5 rounded-3xl shadow-2xl border flex flex-col gap-4 hover:shadow-slate-800 transition-shadow`;
  const panelClass = `${themeStyles.panel} rounded-[32px] shadow-2xl p-6 border`;
  const panelAltClass = `${themeStyles.panelAlt} rounded-[32px] shadow-2xl p-6 border`;
  const infoBoxClass = `${themeStyles.infoBox} rounded-3xl p-5 backdrop-blur-sm border flex flex-col gap-3`;

  const buildStats = (feedbacks) => {
    const normalizedFeedbacks = feedbacks.map(item => {
      const dateValue = item.createdAt || item.date || new Date().toISOString();

      return {
        ...item,
        rating: Number(item.rating || 0),
        issue: item.issue || 'אחר',
        comment: item.comment || '',
        phone: item.phone || '',
        name: item.name || 'אנונימי',
        date: new Date(dateValue).toLocaleString('he-IL')
      };
    });

    const total = normalizedFeedbacks.length;

    const avgRating = total
      ? (
          normalizedFeedbacks.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
        ).toFixed(1)
      : 0;

    const issues = normalizedFeedbacks.reduce((acc, item) => {
      const issue = item.issue || 'אחר';
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});

    return {
      feedbacks: normalizedFeedbacks,
      stats: {
        total,
        avgRating,
        issues
      }
    };
  };

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);

      const response = await fetch(`${API_BASE_URL}/api/feedbacks`);

      if (!response.ok) {
        throw new Error('שגיאה בטעינת המשובים');
      }

      const feedbacks = await response.json();
      const statsPayload = buildStats(feedbacks);

      setData(statsPayload);
      setError(null);
    } catch (err) {
      setError(err.message || 'שגיאה בחיבור לשרת');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-red-50 text-red-600 font-bold" dir="rtl">
        שגיאה בחיבור לשרת: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#d4af37] text-2xl animate-pulse font-black italic" dir="rtl">
        טוען נתונים...
      </div>
    );
  }

  const issueData = Object.entries(data.stats.issues).map(([name, value]) => ({
    name,
    value
  }));

  const ratingData = [1, 2, 3, 4, 5].map(rate => ({
    rating: `${rate}★`,
    count: data.feedbacks.filter(f => Number(f.rating) === rate).length
  }));

  const trendData = [...data.feedbacks]
    .slice(0, 12)
    .reverse()
    .map((f, index) => ({
      label: f.date.split(',')[0],
      rating: Number(f.rating),
      index: index + 1
    }));

  const positivePercent = data.stats.total
    ? Math.round(
        (data.feedbacks.filter(f => Number(f.rating) >= 4).length / data.stats.total) * 100
      )
    : 0;

  const bestIssue = issueData.reduce(
    (best, current) => current.value > best.value ? current : best,
    { name: 'אין נתונים', value: 0 }
  );

  return (
    <div className={`min-h-screen w-full ${themeStyles.root} flex flex-col overflow-x-hidden transition-colors duration-500`} dir="rtl">
      <header className={`w-full ${themeStyles.header} backdrop-blur-xl border-b p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6 md:px-12 sticky top-0 z-50 transition-colors duration-500`}>
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-14 md:w-20" />

          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Bashert Admin
            </h1>

            <p className={`text-sm mt-1 ${themeStyles.muted}`}>
              לוח בקרה מרכזי הכולל עדכון חי של נתוני משובים
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={fetchStats}
            className="px-5 py-3 bg-[#d4af37] text-slate-950 rounded-2xl font-bold uppercase tracking-[0.18em] hover:bg-[#c19f31] transition flex items-center justify-center gap-2"
          >
            {isRefreshing ? 'מרענן...' : 'רענון נתונים'}
          </button>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`px-5 py-3 rounded-2xl font-bold uppercase tracking-[0.18em] transition ${themeStyles.iconButton}`}
          >
            {isDark ? '☀️ Light' : '🌑 Dark'}
          </button>

          <button
            onClick={onLogout}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              isDark
                ? 'border border-white/10 bg-slate-900/90 text-white hover:bg-slate-800'
                : 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-50'
            }`}
          >
            יציאה
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <StatCard
            cardClass={statCardClass}
            title="משובים"
            value={data.stats.total}
            description="סה״כ משובים"
            color="bg-gradient-to-br from-sky-500 to-indigo-600"
          />

          <StatCard
            cardClass={statCardClass}
            title="דירוג ממוצע"
            value={data.stats.avgRating}
            description="מבוסס על נתונים חיים"
            color="bg-gradient-to-br from-amber-500 to-orange-600"
          />

          <StatCard
            cardClass={statCardClass}
            title="חיוביות"
            value={`${positivePercent}%`}
            description="משובים 4-5 כוכבים"
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />

          <StatCard
            cardClass={statCardClass}
            title="קטגוריה מובילה"
            value={bestIssue.name}
            description={`${bestIssue.value} משובים`}
            color="bg-gradient-to-br from-violet-500 to-fuchsia-600"
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className={panelClass}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.muted}`}>
                  חלוקת נושאים
                </p>

                <h2 className="text-3xl font-black mt-2">
                  איפה צריך לפעול עכשיו?
                </h2>
              </div>

              <span className={`text-sm ${themeStyles.muted}`}>
                מתעדכן בכל 5 שניות
              </span>
            </div>

            <div className="h-[260px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={108}
                    paddingAngle={4}
                  >
                    {issueData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => [`${value} משובים`, 'נושא']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={panelClass}>
            <div className="mb-6">
              <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.muted}`}>
                חלוקת דירוגים
              </p>

              <h2 className="text-3xl font-black mt-2">
                כמות לפי דירוג
              </h2>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingData}
                  margin={{ top: 10, right: 0, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.16)'}
                  />

                  <XAxis
                    dataKey="rating"
                    tick={{ fill: isDark ? '#cbd5e1' : '#4b5563', fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fill: isDark ? '#cbd5e1' : '#4b5563', fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)' }}
                    formatter={(value) => [`${value} משובים`, 'כמות']}
                  />

                  <Bar
                    dataKey="count"
                    fill="#d4af37"
                    radius={[12, 12, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={panelClass}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.muted}`}>
                  מגמת דירוגים
                </p>

                <h2 className="text-3xl font-black mt-2">
                  דירוגים אחרונים
                </h2>
              </div>

              <span className={`text-sm ${themeStyles.muted}`}>
                עדכונים חמים
              </span>
            </div>

            <div className="h-[260px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.18)'}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fill: isDark ? '#cbd5e1' : '#4b5563', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />

                  <YAxis
                    domain={[1, 5]}
                    tick={{ fill: isDark ? '#cbd5e1' : '#4b5563', fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip formatter={(value) => [`${value}★`, 'דירוג']} />

                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#d4af37"
                    strokeWidth={4}
                    dot={{ fill: '#d4af37' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className={panelClass}>
            <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.muted}`}>
              מה חדש?
            </p>

            <h2 className="text-3xl font-black mt-2">
              סיכום מהיר
            </h2>

            <div className="mt-8 space-y-4">
              <div className={infoBoxClass}>
                <p className={themeStyles.muted}>משובים חיוביים</p>
                <p className="text-4xl font-black text-[#d4af37]">
                  {positivePercent}%
                </p>
              </div>

              <div className={infoBoxClass}>
                <p className={themeStyles.muted}>הקטגוריה המובילה</p>
                <p className="text-2xl font-black">
                  {bestIssue.name}
                </p>
              </div>

              <div className={infoBoxClass}>
                <p className={themeStyles.muted}>עדכון אחרון</p>
                <p className="text-2xl font-black">
                  {data.feedbacks[0]?.date || 'אין נתונים'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={panelAltClass}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${themeStyles.muted}`}>
                ביקורות אחרונות
              </p>

              <h2 className="text-3xl font-black mt-2">
                סקירה מהירה של נתונים חיים
              </h2>
            </div>

            <p className={themeStyles.muted}>
              הנתונים מתעדכנים אוטומטית ברקע.
            </p>
          </div>

          {data.feedbacks.length === 0 ? (
            <div className="text-center py-16 text-xl font-bold">
              עדיין אין משובים להצגה.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.feedbacks.map(f => (
                <div
                  key={f.id}
                  className={`${themeStyles.panel} rounded-3xl p-5 shadow-lg border`}
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                      <p className={`text-xs uppercase tracking-[0.3em] ${themeStyles.muted}`}>
                        {f.issue}
                      </p>

                      <h3 className="text-xl font-black mt-2">
                        {f.name}
                      </h3>
                    </div>

                    <span className="px-3 py-2 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] font-bold text-sm">
                      {f.rating}★
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed mb-4 min-h-[84px] ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {f.comment || 'לא נכתבה תגובה'}
                  </p>

                  <div className={`flex items-center justify-between text-[11px] uppercase tracking-[0.2em] ${
                    isDark ? 'text-slate-500' : 'text-slate-600'
                  }`}>
                    <span>{f.phone}</span>
                    <span>{f.date.split(',')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, description, color, cardClass }) => (
  <div className={cardClass}>
    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg ${color} text-white text-xl font-black`}>
      {title.charAt(0)}
    </div>

    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {title}
      </p>

      <h2 className="text-3xl font-black mt-2">
        {value}
      </h2>

      {description && (
        <p className="mt-2 text-sm text-slate-400">
          {description}
        </p>
      )}
    </div>
  </div>
);

export default function App() {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin-authenticated');

    if (savedAuth === 'true') {
      setAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = async (password) => {
    setLoginError(null);

    if (password !== ADMIN_PASSWORD) {
      setLoginError('סיסמה שגויה');
      return;
    }

    setAdminAuthenticated(true);
    sessionStorage.setItem('admin-authenticated', 'true');
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setLoginError(null);
    sessionStorage.removeItem('admin-authenticated');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerView />} />

        <Route
          path="/admin"
          element={
            <AdminRoute
              authenticated={adminAuthenticated}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
              loginError={loginError}
            />
          }
        />
      </Routes>
    </Router>
  );
}