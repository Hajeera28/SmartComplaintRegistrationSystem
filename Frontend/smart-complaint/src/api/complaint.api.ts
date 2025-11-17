import { http } from "./http";
import type { Complaint, CreateComplaintRequest } from "../types/Complaint";

export async function createComplaint(req: CreateComplaintRequest): Promise<Complaint> {
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

  const { data } = await http.post<Complaint>("/Complaint", formData, {
    headers: {
      'Content-Type': undefined // Let browser set it automatically
    }
  });
  
  return data;
}

export async function getComplaintsByCitizen(citizenId: string): Promise<Complaint[]> {
  const payload = { citizenId };
  const { data } = await http.post<Complaint[]>('/Complaint/citizen', payload);
  return data;
}

export async function getComplaintsByOfficer(officerId: string): Promise<Complaint[]> {
  const payload = { officerId };
  const { data } = await http.post<Complaint[]>('/Complaint/officer', payload);
  return data;
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const { data } = await http.get<Complaint[]>("/Complaint");
  return data;
}

export async function getComplaintById(complaintId: number): Promise<Complaint> {
  const payload = { complaintId };
  const { data } = await http.post<Complaint>('/Complaint/details', payload);
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

  const { data } = await http.put<Complaint>('/Complaint/status', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return data;
}