import React, { useState } from 'react';
import { Button, Input, Select, Card, cn } from './ui/Base';
import { uploadToCloudinary, validateFile } from '../lib/cloudinary';
import { db, addDoc, collection, Timestamp } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle2, Upload, Loader2, AlertCircle } from 'lucide-react';
import { StudentGrade, Registration } from '../types';

export default function RegistrationForm({ onComplete }: { onComplete: (trackingId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ transcript: 0, receipt: 0 });
  const [files, setFiles] = useState<{ transcript: File | null; receipt: File | null }>({
    transcript: null,
    receipt: null
  });

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    sex: 'Male' as 'Male' | 'Female',
    promotedGrade: '10' as '10' | '11' | '12',
    average: '',
    paymentMethod: 'CBE' as 'CBE' | 'Sinqee Bank' | 'Telebirr'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'transcript' | 'receipt') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateFile(file);
        setFiles(prev => ({ ...prev, [type]: file }));
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.transcript || !files.receipt) {
      setError('Please upload both transcript and payment receipt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload files
      const transcriptUrl = await uploadToCloudinary(files.transcript, 'transcripts', (p) => setProgress(prev => ({ ...prev, transcript: p })));
      const receiptUrl = await uploadToCloudinary(files.receipt, 'receipts', (p) => setProgress(prev => ({ ...prev, receipt: p })));

      // 2. Generate Tracking ID
      const trackingId = 'CH-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // 3. Save to Firestore
      const registrationData: Partial<Registration> = {
        tracking_id: trackingId,
        full_name: formData.fullName,
        age: Number(formData.age),
        sex: formData.sex,
        promoted_grade: Number(formData.promotedGrade) as StudentGrade,
        average: Number(formData.average),
        transcript_url: transcriptUrl,
        receipt_url: receiptUrl,
        payment_method: formData.paymentMethod,
        status: 'Pending Review',
        created_at: Timestamp.now()
      };

      await addDoc(collection(db, 'registrations'), registrationData);
      onComplete(trackingId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 max-w-2xl mx-auto border-t-4 border-t-blue-600">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Registration Form</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3">Chercher Secondary School Admission Queue</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            required 
            value={formData.fullName}
            onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Age" 
              type="number" 
              required 
              value={formData.age}
              onChange={e => setFormData(p => ({ ...p, age: e.target.value }))}
            />
            <Select 
              label="Sex" 
              options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]} 
              value={formData.sex}
              onChange={e => setFormData(p => ({ ...p, sex: e.target.value as any }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Promoted To Grade" 
            options={[{ label: 'Grade 10', value: '10' }, { label: 'Grade 11', value: '11' }, { label: 'Grade 12', value: '12' }]} 
            value={formData.promotedGrade}
            onChange={e => setFormData(p => ({ ...p, promotedGrade: e.target.value as any }))}
          />
          <Input 
            label="Last Year Average (%)" 
            type="number" 
            step="0.01" 
            required 
            value={formData.average}
            onChange={e => setFormData(p => ({ ...p, average: e.target.value }))}
          />
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
            <Upload className="w-4 h-4" /> Supporting Documents
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transcript Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Student Transcript</label>
              <div className={cn(
                "relative border-2 border-dashed rounded-xl p-4 transition-all text-center",
                files.transcript ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-blue-400"
              )}>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => handleFileChange(e, 'transcript')}
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                />
                <div className="flex flex-col items-center gap-2">
                  {files.transcript ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-600">
                    {files.transcript ? files.transcript.name : 'Click to upload transcript'}
                  </span>
                </div>
              </div>
              {progress.transcript > 0 && progress.transcript < 100 && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress.transcript}%` }} />
                </div>
              )}
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Receipt</label>
              <div className={cn(
                "relative border-2 border-dashed rounded-xl p-4 transition-all text-center",
                files.receipt ? "border-green-300 bg-green-50" : "border-slate-200 hover:border-blue-400"
              )}>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => handleFileChange(e, 'receipt')}
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                />
                <div className="flex flex-col items-center gap-2">
                  {files.receipt ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-600">
                    {files.receipt ? files.receipt.name : 'Click to upload receipt'}
                  </span>
                </div>
              </div>
              {progress.receipt > 0 && progress.receipt < 100 && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress.receipt}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Payment Method Used</label>
          <div className="grid grid-cols-3 gap-3">
             {['CBE', 'Sinqee Bank', 'Telebirr'].map((method) => (
               <button
                 key={method}
                 type="button"
                 onClick={() => setFormData(p => ({ ...p, paymentMethod: method as any }))}
                 className={cn(
                   "p-3 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all",
                   formData.paymentMethod === method ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-400 hover:border-slate-300"
                 )}
               >
                 {method}
               </button>
             ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Submitting Application...
            </>
          ) : (
            'Complete Registration'
          )}
        </Button>
      </form>
    </Card>
  );
}
