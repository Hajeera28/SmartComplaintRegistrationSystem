export interface Grievance {
  grievanceId: number;
  complaintId: number;
  complaintTitle: string;
  citizenName: string;
  reason: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
  createdAt: string;
  resolvedAt?: string;
  adminRemarks?: string;
}