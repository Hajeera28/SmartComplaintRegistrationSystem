import { http } from "./http";
import type { Complaint, CreateComplaintRequest } from "../types/Complaint";

export async function createComplaint(req: CreateComplaintRequest): Promise<Complaint> {
  console.log('Creating complaint with data:', req);
  
  const formData = new FormData();
  formData.append("Title", req.title);
  formData.append("Description", req.description);
  formData.append("Location", req.location);
  formData.append("CitizenId", req.citizenId);
  formData.append("DepartmentId", req.departmentId.toString());
  formData.append("CategoryId", req.categoryId.toString());
  if (req.image) {
    formData.append("Image", req.image);
  }

  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const { data } = await http.post<Complaint>("/Complaint", formData, {
    headers: {
      'Content-Type': undefined // Let browser set it automatically
    }
  });
  
  console.log('Complaint created successfully:', data);
  return data;
}

export async function getComplaintsByCitizen(citizenId: string): Promise<Complaint[]> {
  console.log('Fetching complaints for citizen:', citizenId);
  const { data } = await http.get<Complaint[]>(`/Complaint/citizen/${citizenId}`);
  console.log('Complaints fetched:', data);
  return data;
}

export async function getComplaintsByOfficer(officerId: string): Promise<Complaint[]> {
  const { data } = await http.get<Complaint[]>(`/Complaint/officer/${officerId}`);
  return data;
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const { data } = await http.get<Complaint[]>("/Complaint");
  return data;
}

export async function getComplaintById(complaintId: number): Promise<Complaint> {
  const { data } = await http.get<Complaint>(`/Complaint/${complaintId}`);
  return data;
}

export async function getDepartments(): Promise<any[]> {
  const { data } = await http.get<any[]>("/Department");
  return data;
}

export async function getCategories(): Promise<any[]> {
  const { data } = await http.get<any[]>("/Category");
  return data;
}

export async function updateComplaintStatus(
  complaintId: number,
  statusId: number,
  officerRemarks?: string,
  officerImage?: File
): Promise<Complaint> {
  const formData = new FormData();
  formData.append("ComplaintId", complaintId.toString());
  formData.append("StatusId", statusId.toString());
  if (officerRemarks) {
    formData.append("OfficerRemarks", officerRemarks);
  }
  if (officerImage) {
    formData.append("OfficerImage", officerImage);
  }

  const { data } = await http.put<Complaint>(`/Complaint/${complaintId}/status`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return data;
}