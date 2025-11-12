import { http } from "./http";

export interface CitizenProfile {
  citizenId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
}

export async function getCitizenByEmail(email: string): Promise<CitizenProfile> {
  const { data } = await http.get<CitizenProfile>(`/Citizen/email/${email}`);
  return data;
}