import React, { useState } from 'react';
import { Button, Input, Card, Badge } from './ui/Base';
import { db, collection, query, where, handleFirestoreError, OperationType } from '../lib/firebase';
import { getDocs } from 'firebase/firestore';
import { Search, Loader2, User, GraduationCap, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Registration } from '../types';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError(null);
    setRegistration(null);

    try {
      const q = query(collection(db, 'registrations'), where('tracking_id', '==', trackingId.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('No application found with this Tracking ID.');
      } else {
        const doc = querySnapshot.docs[0];
        setRegistration({ id: doc.id, ...doc.data() } as Registration);
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, 'registrations');
      setError('An error occurred while fetching your application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <div className="inline-block p-1 bg-slate-200 rounded-full mb-2">
           <Badge variant="default">Student Access Portal</Badge>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">Track Admission</h2>
        <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">Enter your Tracking ID to view the current status of your registration and class placement.</p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <Input 
            placeholder="Tracking ID (CH-XXXXXX)" 
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            className="flex-grow border-none bg-transparent focus:ring-0 text-lg font-bold placeholder:font-normal"
          />
          <Button type="submit" disabled={loading} className="h-12 px-6">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="ml-2">VERIFY</span>
          </Button>
        </form>
      </div>

      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </Card>
      )}

      {registration && (
        <Card className="animate-in fade-in zoom-in-95 duration-500 overflow-visible relative">
          <div className="absolute -top-4 -right-4">
             <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Status</p>
                {registration.status === 'Approved' && <Badge variant="success">Approved</Badge>}
                {registration.status === 'Rejected' && <Badge variant="danger">Rejected</Badge>}
                {registration.status === 'Pending Review' && <Badge variant="warning">Pending Review</Badge>}
             </div>
          </div>

          <div className="bg-white p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="space-y-8 flex-grow">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    {registration.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{registration.full_name}</h3>
                    <p className="text-sm text-slate-400 font-bold tracking-widest uppercase mt-2">Registration ID: {registration.tracking_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Record</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          G
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target Grade</p>
                          <p className="font-extrabold text-slate-900">Grade {registration.promoted_grade}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          A
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Year Average</p>
                          <p className="font-extrabold text-slate-900">{registration.average}% Score</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Info</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Signed On</p>
                          <p className="font-extrabold text-slate-900">{format(registration.created_at.toDate(), 'PPP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                         <User className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personal</p>
                            <p className="font-extrabold text-slate-900">{registration.sex}, {registration.age}Y</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 space-y-6">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placement Result</h4>
                 <div className="aspect-square bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600/5 scale-0 group-hover:scale-100 transition-transform duration-700" />
                    {registration.status === 'Approved' ? (
                      <>
                        <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-green-500/20">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-1 relative">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Class</p>
                          <p className="text-6xl font-black text-slate-900 tracking-tighter">{registration.class_assignment || 'TBD'}</p>
                        </div>
                      </>
                    ) : registration.status === 'Rejected' ? (
                      <>
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <div className="space-y-2 relative">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Application Declined</p>
                          <p className="text-[10px] text-slate-500 font-bold italic">Check reason with office</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                        <div className="space-y-2 relative">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Reviewing Case</p>
                          <p className="text-[10px] text-slate-500 font-bold">Please check back later</p>
                        </div>
                      </>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
