import { http } from "./http";

export interface CitizenProfile {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
}

export interface OfficerProfile {
  officerId: string;
  name: string;
  email: string;
  state: string;
  role: string;
  departmentName: string;
}

export async function getCitizenProfile(citizenId: string): Promise<CitizenProfile> {
  const payload = { citizenId };
  const { data } = await http.post<CitizenProfile>('/Citizen/profile', payload);
  return data;
}

export async function updateCitizenProfile(citizenId: string, profile: Partial<CitizenProfile>): Promise<CitizenProfile> {
  const payload = { citizenId, ...profile };
  const { data } = await http.put<CitizenProfile>('/Citizen/update', payload);
  return data;
}

export async function getOfficerProfile(officerId: string): Promise<OfficerProfile> {
  const payload = { officerId };
  const { data } = await http.post<OfficerProfile>('/Officer/profile', payload);
  return data;
}

export async function updateOfficerProfile(officerId: string, profile: Partial<OfficerProfile>): Promise<OfficerProfile> {
  const payload = { officerId, ...profile };
  const { data } = await http.put<OfficerProfile>('/Officer/update', payload);
  return data;
}