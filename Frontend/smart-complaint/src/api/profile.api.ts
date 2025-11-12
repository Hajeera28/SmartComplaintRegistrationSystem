import { http } from "./http";

export interface CitizenProfile {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
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
  const { data } = await http.get<CitizenProfile>(`/Citizen/${citizenId}`);
  return data;
}

export async function updateCitizenProfile(citizenId: string, profile: Partial<CitizenProfile>): Promise<CitizenProfile> {
  const { data } = await http.put<CitizenProfile>(`/Citizen/${citizenId}`, profile);
  return data;
}

export async function getOfficerProfile(officerId: string): Promise<OfficerProfile> {
  const { data } = await http.get<OfficerProfile>(`/Officer/${officerId}`);
  return data;
}

export async function updateOfficerProfile(officerId: string, profile: Partial<OfficerProfile>): Promise<OfficerProfile> {
  const { data } = await http.put<OfficerProfile>(`/Officer/${officerId}`, profile);
  return data;
}