"use client";

import { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  MessageSquare, 
  CheckCircle2, 
  Loader2,
  BookOpen,
  ArrowLeft,
  Activity
} from "lucide-react";

function UsageStats() {
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  const fetchUsage = async () => {
    try {
      const response = await fetch("http://localhost:8000/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error("Failed to fetch usage", error);
    }
  };

  useEffect(() => {
    fetchUsage();
    
    // Listen for custom refresh events
    const handleRefresh = () => fetchUsage();
    window.addEventListener("refresh-usage", handleRefresh);
    
    const interval = setInterval(fetchUsage, 30000); // Refresh every 30s
    
    return () => {
      window.removeEventListener("refresh-usage", handleRefresh);
      clearInterval(interval);
    };
  }, []);

  if (!usage) return null;

  const percentage = Math.min(100, (usage.used / usage.limit) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full max-w-xs fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-sm">
        <Activity className="w-4 h-4 text-blue-600" />
        <span>שימוש במכסה (Tokens)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 font-medium">
        <span>{usage.used.toLocaleString()} בשימוש</span>
        <span>מתוך {usage.limit.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{
    content_score: number;
    language_score: number;
    total_score?: number;
    hebrew_feedback: string;
  } | null>(null);
  
  const handleEvaluate = async () => {
    if (!prompt || !essay) return;
    setIsEvaluating(true);
    setStatus("מתחיל ניתוח...");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          assignment_text: prompt, 
          user_essay: essay 
        }),
      });

      if (!response.ok) throw new Error("שגיאה בתקשורת עם השרת");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("לא ניתן לקרוא את תגובת השרת");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("{")) {
            try {
              const data = JSON.parse(line);
              setResult(data);
              // Trigger a refresh of the usage stats after completion
              window.dispatchEvent(new CustomEvent("refresh-usage"));
            } catch (e) {
              console.error("Failed to parse JSON chunk", e);
            }
          } else {
            setStatus(line);
          }
        }
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      setStatus("אירעה שגיאה בתהליך ההערכה. וודאו שהשרת פועל.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center w-full">
      <UsageStats />
      {/* Hero Section */}
      <section className="w-full bg-white border-b border-slate-200 py-16 md:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            הערכת חיבור פסיכומטרי, <br className="hidden sm:block" /> ברמת הדיוק של המרכז הארצי
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            מערכת KtivaAI מנתחת את מטלת הכתיבה שלך באופן מקיף, בעזרת טכנולוגיית בינה מלאכותית שתוכננה במיוחד כדי לחקות את מחוון ההערכה הרשמי.
          </p>
        </div>
      </section>

      {/* The Brain / Agentic Flow Section */}
      <section className="w-full py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">איך זה עובד? "המוח" שמאחורי הקלעים</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              בניגוד לכלי בינה מלאכותית רגילים, KtivaAI לא מסתפקת בבקשה אחת. המערכת מבוססת על מודל סוכנים (Agents) המדמה את תהליך הבדיקה האנושי:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">מעריך תוכן (Content Critic)</h3>
              <p className="text-slate-600 leading-relaxed">
                סוכן המתמקד בלעדית בממד התוכן. בוחן את עושר הטיעונים, הרלוונטיות, והביקורתיות שבהצגת הדברים בהתאם לסולם הציון הרשמי.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">מעריך לשון (Language Critic)</h3>
              <p className="text-slate-600 leading-relaxed">
                סוכן הבוחן את ממד הלשון. מנתח את משלב השפה, תקינות התחביר, מורכבות ההבעה, והדיוק הסמנטי על פי דרישות המרכז הארצי.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start space-y-4">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">סינתזה (Synthesizer)</h3>
              <p className="text-slate-600 leading-relaxed">
                הסוכן המסכם מאחד את ההערכות של שני המבקרים, מונע סתירות, ומגבש ציון סופי ומנומק בסולם של 1 עד 6 לכל ממד.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="w-full py-16 px-4 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">ההבדל בין KtivaAI ל-ChatGPT</h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                כלים כמו ChatGPT מספקים משוב כללי, ולעיתים קרובות מפספסים את הדקויות של סולם ה-1 עד 6 שבו משתמשים בבחינה הפסיכומטרית.
              </p>
              <p>
                KtivaAI, לעומת זאת, מאומנת במיוחד לפעול על פי <strong className="text-slate-900 font-semibold">שיטת הניקוד בעלת 12 הנקודות</strong> של המרכז הארצי, ומפרידה בצורה מוחלטת בין הערכת התוכן להערכת הלשון, כך שתקבלו שיקוף מדויק של הציון הצפוי בבחינה.
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 w-full bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>הערכה מופרדת לתוכן ולשון (1-6)</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>סימולציה של צוות בודקים אנושי</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>משוב אקדמי בהתאם למחוון הרשמי</span>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Form Section */}
      <section className="w-full py-20 px-4 bg-slate-50 flex justify-center">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">שלחו חיבור להערכה</h2>
            <p className="text-slate-600">
              הזינו את מטלת הכתיבה ואת החיבור שכתבתם, והמערכת תנתח אותם עבורכם.
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label htmlFor="prompt" className="block text-sm font-semibold text-slate-900">
                מטלת הכתיבה (הנושא)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="הדביקו כאן את השאלה או הטקסט של מטלת הכתיבה..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-y min-h-[120px]"
                dir="auto"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="essay" className="block text-sm font-semibold text-slate-900">
                החיבור שלך
              </label>
              <textarea
                id="essay"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="הדביקו כאן את החיבור שכתבתם (25-30 שורות)..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-y min-h-[300px]"
                dir="auto"
              />
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !prompt || !essay}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isEvaluating 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : (!prompt || !essay)
                    ? "bg-blue-50 text-blue-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow active:scale-[0.99]"
              }`}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5" />
                  <span>שלח להערכה</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="p-8 border-t border-slate-100 bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                תוצאות ההערכה
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                  <div className="text-sm text-slate-500 mb-1">ציון תוכן</div>
                  <div className="text-3xl font-black text-blue-600">{result.content_score}/6</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                  <div className="text-sm text-slate-500 mb-1">ציון לשון</div>
                  <div className="text-3xl font-black text-indigo-600">{result.language_score}/6</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3">משוב מפורט:</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap" dir="rtl">
                  {result.hebrew_feedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
