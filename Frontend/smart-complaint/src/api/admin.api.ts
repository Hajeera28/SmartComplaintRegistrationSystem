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
  const payload = { officerId };
  await http.put('/Officer/approve', payload);
}

export async function denyOfficer(officerId: string): Promise<void> {
  const payload = { officerId };
  await http.delete('/Officer/deny', { data: payload });
}

export async function getOfficerByUserId(userId: number): Promise<Officer> {
  const payload = { userId };
  const { data } = await http.post<Officer>('/Officer/user', payload);
  return data;
}

export async function assignComplaint(complaintId: number, officerId: string): Promise<void> {
  await http.post("/ComplaintAssignment/assign", { 
    ComplaintId: complaintId, 
    OfficerId: officerId 
  });
}

export async function deleteOfficer(officerId: string): Promise<void> {
  const payload = { officerId };
  await http.delete('/Officer/delete', { data: payload });
}