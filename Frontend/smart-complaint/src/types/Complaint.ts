export interface Complaint {
  complaintId: number;
  title: string;
  description: string;
  location: string;
  departmentName: string;
  categoryName: string;
  complaintStatus: string;
  createdAt: string;
  updatedAt?: string;
  officerRemarks?: string;
  imagePath?: string;
  officerImagePath?: string;
  assignedOfficerId?: string;
  hasGrievance: boolean;
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  location: string;
  citizenId: string;
  departmentId: number;
  categoryId: number;
  image?: File;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  departmentId: number;
}