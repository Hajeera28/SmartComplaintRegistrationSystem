import { http } from "./http";

export interface Grievance {
  grievanceId: number;
  description: string;
  raisedDate: string;
  response?: string;
  responseDate?: string;
  complaintTitle: string;
  originalOfficerName: string;
  assignedOfficerName: string;
  grievanceStatus: string;
  officerRemarks?: string;
  imagePath?: string;
  officerImagePath?: string;
  citizenName: string;
  complaintId: number;
}

export async function getAllGrievances(): Promise<Grievance[]> {
  const { data } = await http.get<Grievance[]>("/Grievance");
  return data;
}

export async function getGrievancesByOfficer(officerId: string): Promise<Grievance[]> {
  const { data } = await http.get<Grievance[]>(`/Grievance/officer/${officerId}`);
  return data;
}

export async function getGrievancesByCitizen(citizenId: string): Promise<Grievance[]> {
  const { data } = await http.get<Grievance[]>(`/Grievance/citizen/${citizenId}`);
  return data;
}

export async function createGrievance(
  complaintId: number, 
  description: string, 
  citizenId: string
): Promise<void> {
  const formData = new FormData();
  formData.append("ComplaintId", complaintId.toString());
  formData.append("Description", description.trim());
  formData.append("CitizenId", citizenId);
  
  await http.post("/Grievance/raise", formData, {
    headers: {
      'Content-Type': undefined
    }
  });
}



export async function checkGrievanceExists(complaintId: number): Promise<boolean> {
  const { data } = await http.get<boolean>(`/Grievance/exists/${complaintId}`);
  return data;
}

export async function updateGrievanceStatus(
  grievanceId: number, 
  statusId: number, 
  remarks: string
): Promise<void> {
  const formData = new FormData();
  formData.append("GrievanceId", grievanceId.toString());
  formData.append("StatusId", statusId.toString());
  formData.append("OfficerRemarks", remarks || "");
  
  await http.put(`/Grievance/${grievanceId}/status`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
}