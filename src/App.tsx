import React, { useState } from 'react';
import { Button, Card, Input, Badge } from './components/ui/Base';
import RegistrationForm from './components/RegistrationForm';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, GraduationCap, ArrowRight, UserCheck, Loader2, Lock, CheckCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [studentAction, setStudentAction] = useState<'home' | 'register' | 'check'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminAuthenticated(true);
        setView('admin');
        setShowAdminLogin(false);
      } else {
        setLoginError(data.message || 'Verification failed');
      }
    } catch (err) {
      setLoginError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'admin' && isAdminAuthenticated) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setStudentAction('home')} className="flex items-center gap-3 transition-all hover:opacity-80">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-slate-900 leading-tight tracking-tighter">CHERCHER</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Secondary School</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-[10px] items-center font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 px-3 py-2 rounded-lg transition-all hidden sm:flex"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              Admin Portal
            </button>
            <Button size="sm" onClick={() => setStudentAction('register')}>ENROLL NOW</Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="py-16 px-4">
        <AnimatePresence mode="wait">
          {studentAction === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-10">
                <div className="space-y-6">
                   <Badge variant="success">AY 2026 Admissions Open</Badge>
                   <h2 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] decoration-blue-600">
                     The <span className="text-blue-600">Standard</span> of Excellence.
                   </h2>
                   <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                     Join Ethiopia's most prestigious secondary institution. Elevating academic rigor and leadership for the next generation of global citizens.
                   </p>
                </div>

                <div className="flex flex-wrap gap-4">
                   <Button size="lg" className="h-16 px-10 bg-slate-900 shadow-xl shadow-slate-900/20" onClick={() => setStudentAction('register')}>
                     ADMISSION FORM <ArrowRight className="ml-3 w-5 h-5" />
                   </Button>
                   <Button variant="outline" size="lg" className="h-16 px-10" onClick={() => setStudentAction('check')}>
                     TRACK STATUS
                   </Button>
                </div>

                <div className="flex gap-12 pt-10 border-t border-slate-200">
                   <div className="space-y-1">
                     <p className="text-3xl font-black text-slate-900 tabular-nums">4.5K</p>
                     <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Enrolled</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-3xl font-black text-slate-900 tabular-nums">98%</p>
                     <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Graduation</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-3xl font-black text-slate-900 tabular-nums">1.2:1</p>
                     <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Faculty Ratio</p>
                   </div>
                </div>
              </div>

              <div className="relative group">
                 <div className="absolute -inset-8 bg-blue-600/5 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                 <div className="relative bg-white p-3 rounded-[2rem] border border-slate-200 shadow-2xl transform transition-transform duration-500 hover:-rotate-1">
                    <img 
                      src="https://images.unsplash.com/photo-1523050853064-9a36d2460670?q=80&w=1000&auto=format&fit=crop" 
                      alt="Chercher Campus" 
                      className="rounded-[1.5rem] w-full"
                    />
                    <div className="absolute -bottom-6 -right-6 lg:-right-12">
                       <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-800 text-white flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase italic">Fast</div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest">Digital First</p>
                             <p className="text-[10px] text-slate-400">Apply in under 5 minutes</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}


          {studentAction === 'register' && (
            <motion.div 
               key="register"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
            >
              {registeredId ? (
                <Card className="max-w-xl mx-auto p-12 text-center space-y-6">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                     <h2 className="text-3xl font-black text-slate-900">Success!</h2>
                     <p className="text-slate-500">Your application has been submitted successfully.</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Your Tracking ID</p>
                      <p className="text-4xl font-black text-blue-600 font-mono tracking-tighter">{registeredId}</p>
                      <p className="text-xs text-slate-500 pt-2 italic">Save this ID to check your status later.</p>
                   </div>
                   <Button className="w-full h-12" onClick={() => setStudentAction('home')}>Return Home</Button>
                </Card>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <Button variant="ghost" onClick={() => setStudentAction('home')} className="mb-4">← Back to Overview</Button>
                  </div>
                  <RegistrationForm onComplete={(id) => setRegisteredId(id)} />
                </div>
              )}
            </motion.div>
          )}

          {studentAction === 'check' && (
            <motion.div 
              key="check"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Button variant="ghost" onClick={() => setStudentAction('home')}>← Back to Overview</Button>
              </div>
              <StudentDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm"
            >
              <Card className="p-8 shadow-2xl ring-1 ring-black/5">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-600/30">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-900">Admin Portal</h3>
                    <p className="text-sm text-slate-500">Authorized personnel only</p>
                  </div>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <Input 
                      type="password" 
                      placeholder="Security Password" 
                      required 
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="text-center h-12 text-lg"
                      error={loginError}
                      autoFocus
                    />
                    <Button type="submit" className="w-full h-12" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Dashboard'}
                    </Button>
                  </form>
                  
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Access is logged for security
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
         <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
            <div className="flex items-center justify-center gap-3 grayscale opacity-50">
               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xs">C</div>
               <span className="font-bold text-slate-900 tracking-tighter">CHERCHER SECONDARY</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Chercher, Ethiopia. Empowering the next generation through academic excellence and innovative leadership. 
            </p>
            <div className="flex justify-center gap-8 border-t border-slate-100 pt-8 mt-8">
               <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
                  <p className="text-sm text-slate-600">+251 939 393 939</p>
               </div>
               <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
                  <p className="text-sm text-slate-600">Chercher, ETH</p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
