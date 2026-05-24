import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, cn } from './ui/Base';
import { 
  Users, 
  Settings, 
  FileText, 
  PieChart, 
  Search, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Download,
  Trash2,
} from 'lucide-react';
import { db, collection, query, onSnapshot, updateDoc, doc, deleteDoc, setDoc } from '../lib/firebase';
import { Registration, GradeSetting, ClassGroup } from '../types';
import { assignClasses } from '../lib/assignment';
import * as XLSX from 'xlsx';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'settings' | 'classes'>('dashboard');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [gradeSettings, setGradeSettings] = useState<GradeSetting[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const unsubReg = onSnapshot(collection(db, 'registrations'), (snapshot) => {
      setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
    });
    const unsubSettings = onSnapshot(collection(db, 'grade_settings'), (snapshot) => {
      setGradeSettings(snapshot.docs.map(d => d.data() as GradeSetting));
    });
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClassGroup)));
    });
    return () => { unsubReg(); unsubSettings(); unsubClasses(); };
  }, []);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, 'registrations', id), { status: 'Approved' });
  };

  const handleReject = async (id: string, reason: string) => {
    await updateDoc(doc(db, 'registrations', id), { status: 'Rejected', rejection_reason: reason });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteDoc(doc(db, 'registrations', id));
    }
  };

  const handleRunAssignment = async () => {
    const approved = registrations.filter(r => r.status === 'Approved');
    const settingsMap = gradeSettings.reduce((acc, curr) => ({ ...acc, [curr.grade]: curr.students_per_class }), {});
    
    const result = assignClasses(approved, settingsMap);

    // Save assignments to registrations and create class collection
    for (const reg of result.registrations) {
      await updateDoc(doc(db, 'registrations', reg.id), { class_assignment: reg.class_assignment });
    }

    // Clear old classes and add new ones
    // (In a real app we might want to do this more carefully)
    for (const cls of result.classes) {
      await setDoc(doc(db, 'classes', cls.id), cls);
    }
    alert('Smart Class Assignment Completed!');
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || r.promoted_grade.toString() === filterGrade;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'Pending Review').length,
    approved: registrations.filter(r => r.status === 'Approved').length,
    rejected: registrations.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col text-white">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl">C</div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Chercher</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Secondary School</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-4 px-2 tracking-widest">Admin Operations</div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: PieChart },
            { id: 'applications', label: 'Student Queue', icon: FileText },
            { id: 'classes', label: 'Class Assignments', icon: Users },
            { id: 'settings', label: 'Grade Settings', icon: Settings },
          ].map((item: any) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-[11px] font-bold uppercase tracking-wider",
                activeTab === item.id 
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          <div className="mt-8 text-[10px] uppercase text-slate-500 font-bold mb-4 px-2 tracking-widest">System Status</div>
          <div className="px-2 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Cloud Firestore</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Cloudinary API</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             className="w-full py-2.5 bg-slate-800 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-600 transition-colors"
             onClick={() => window.location.reload()}
           >
             LOGOUT ADMIN
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Admin Dashboard' : 
               activeTab === 'applications' ? 'Student Registration Queue' : 
               activeTab === 'classes' ? 'Academic Class Assignments' : 'System Settings'}
            </h2>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono border border-slate-200">Nahom@110108 Session</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'applications' && (
              <div className="relative">
                <Input 
                  placeholder="Search tracking ID..." 
                  className="pl-8 w-48 h-9" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={() => exportToExcel(registrations, 'Chercher_Backup')}>
              <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
            </Button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Applications', value: stats.total, color: 'blue' },
                  { label: 'Pending Review', value: stats.pending, color: 'amber' },
                  { label: 'Approved Students', value: stats.approved, color: 'green' },
                  { label: 'Rejected Applications', value: stats.rejected, color: 'red' },
                ].map((stat, i) => (
                  <Card key={i} className="p-6">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className={cn("text-3xl font-black mt-2", `text-${stat.color}-600`)}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                   <h3 className="text-lg font-bold text-slate-800 mb-6">Grade Distribution</h3>
                   <div className="space-y-6">
                     {[10, 11, 12].map(grade => {
                       const count = registrations.filter(r => r.promoted_grade === grade).length;
                       const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                       return (
                         <div key={grade} className="space-y-2">
                           <div className="flex justify-between text-sm">
                             <span className="font-bold text-slate-700">Grade {grade}</span>
                             <span className="text-slate-500">{count} Students ({percent.toFixed(1)}%)</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                             <div className="bg-blue-600 h-full" style={{ width: `${percent}%` }} />
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </Card>
                <Card className="p-6 bg-blue-600 text-white">
                   <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                   <div className="space-y-3">
                     <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none" onClick={handleRunAssignment}>
                       Run Class Assignment
                     </Button>
                     <Button variant="outline" className="w-full border-blue-400 text-white hover:bg-blue-700" onClick={() => exportToExcel(registrations, 'All_Registrations')}>
                       Export All to Excel
                     </Button>
                   </div>
                   <div className="mt-8 p-4 bg-blue-700/50 rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Assignment Logic</p>
                      <p className="text-xs mt-2 leading-relaxed opacity-80">Classes are grouped by grade, sorted by average score. Top performers assigned to 'A' special classes. Remaining distributed with gender balancing.</p>
                   </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-grow max-w-xl gap-2">
                   <div className="relative flex-grow">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <Input 
                       placeholder="Search by name or tracking ID..." 
                       className="pl-10" 
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <select 
                     className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                     value={filterGrade}
                     onChange={e => setFilterGrade(e.target.value)}
                   >
                     <option value="all">All Grades</option>
                     <option value="10">Grade 10</option>
                     <option value="11">Grade 11</option>
                     <option value="12">Grade 12</option>
                   </select>
                   <select 
                     className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                     value={filterStatus}
                     onChange={e => setFilterStatus(e.target.value)}
                   >
                     <option value="all">All Status</option>
                     <option value="Pending Review">Pending</option>
                     <option value="Approved">Approved</option>
                     <option value="Rejected">Rejected</option>
                   </select>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToExcel(filteredRegistrations, 'Filtered_Students')}>
                   <Download className="w-4 h-4 mr-2" /> Export View
                </Button>
              </div>

              <Card className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Grade/Avg</th>
                      <th className="px-6 py-4">Files</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{reg.full_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{reg.tracking_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700">Grade {reg.promoted_grade}</div>
                          <div className="text-xs text-blue-600 font-bold">{reg.average}%</div>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                           <a href={reg.transcript_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline">Transcript</a>
                           <a href={reg.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline">Receipt</a>
                        </td>
                        <td className="px-6 py-4">
                          {reg.status === 'Approved' && <Badge variant="success">Approved</Badge>}
                          {reg.status === 'Rejected' && <Badge variant="danger">Rejected</Badge>}
                          {reg.status === 'Pending Review' && <Badge variant="warning">Pending</Badge>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {reg.status === 'Pending Review' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(reg.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg" 
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) handleReject(reg.id, reason);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg" 
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDelete(reg.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800">Generated Class Groups</h3>
                 <Button onClick={handleRunAssignment}>Recalculate Assignments</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {classes.map(cls => (
                   <Card key={cls.id} className="p-6 hover:border-blue-500 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl">
                          {cls.class_name}
                        </div>
                        <Badge variant={cls.class_type === 'Special' ? 'success' : 'default'}>
                          {cls.class_type}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Class {cls.class_name}</h4>
                      <p className="text-sm text-slate-500 mt-1">Grade {cls.grade} • {cls.total_students} Students</p>
                      
                      <div className="mt-6 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+{cls.total_students - 3}</div>
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => {
                            const students = registrations.filter(r => r.class_assignment === cls.class_name);
                            exportToExcel(students, `Class_${cls.class_name}`);
                         }}>
                            Export CSV
                         </Button>
                      </div>
                   </Card>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-2xl">
                <Card className="p-6 space-y-6">
                   <h3 className="text-lg font-bold text-slate-800">Registration Settings</h3>
                   <div className="space-y-4">
                      {[10, 11, 12].map(grade => {
                        const setting = gradeSettings.find(s => s.grade === grade);
                        return (
                          <div key={grade} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                             <div>
                                <p className="font-bold text-slate-800">Grade {grade}</p>
                                <p className="text-xs text-slate-500">Maximum students per classroom</p>
                             </div>
                             <div className="flex items-center gap-3">
                                <Input 
                                  type="number" 
                                  className="w-20 text-center" 
                                  value={setting?.students_per_class || 60} 
                                  onChange={async (e) => {
                                    const val = Number(e.target.value);
                                    await setDoc(doc(db, 'grade_settings', grade.toString()), { grade, students_per_class: val });
                                  }}
                                />
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </Card>
             </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
