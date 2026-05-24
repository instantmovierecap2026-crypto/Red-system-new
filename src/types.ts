export type StudentGrade = 10 | 11 | 12;

export type ApplicationStatus = 'Pending Review' | 'Approved' | 'Rejected';

export interface Registration {
  id: string;
  tracking_id: string;
  full_name: string;
  age: number;
  sex: 'Male' | 'Female';
  promoted_grade: StudentGrade;
  average: number;
  transcript_url: string;
  receipt_url: string;
  payment_method: 'CBE' | 'Sinqee Bank' | 'Telebirr';
  status: ApplicationStatus;
  class_assignment?: string;
  rejection_reason?: string;
  created_at: any; // Firestore Timestamp
}

export interface GradeSetting {
  grade: StudentGrade;
  students_per_class: number;
}

export interface ClassGroup {
  id: string;
  grade: StudentGrade;
  class_name: string;
  class_type: 'Special' | 'Regular';
  total_students: number;
}

export interface AdminLog {
  action: string;
  timestamp: any;
  ip_address: string;
}
