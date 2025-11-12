import { http } from "./http";

export interface Officer {
  officerId: string;
  name: string;
  email: string;
  role: string;
  departmentName: string;
  isApproved: boolean;
  proofDocumentPath?: string;
}

export interface CitizenInfo {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  complaintCount: number;
}

export async function getAllOfficers(): Promise<Officer[]> {
  const { data } = await http.get<Officer[]>("/Officer");
  return data;
}

export async function getAllCitizens(): Promise<CitizenInfo[]> {
  const { data } = await http.get<CitizenInfo[]>("/Citizen");
  return data;
}

export async function approveOfficer(officerId: string): Promise<void> {
  await http.put(`/Officer/${officerId}/approve`);
}

export async function denyOfficer(officerId: string): Promise<void> {
  await http.delete(`/Officer/${officerId}/deny`);
}

export async function getOfficerByUserId(userId: number): Promise<Officer> {
  const { data } = await http.get<Officer>(`/Officer/user/${userId}`);
  return data;
}

export async function assignComplaint(complaintId: number, officerId: string): Promise<void> {
  await http.post("/ComplaintAssignment/assign", { 
    ComplaintId: complaintId, 
    OfficerId: officerId 
  });
}

export async function deleteOfficer(officerId: string): Promise<void> {
  await http.delete(`/Officer/${officerId}`);
}