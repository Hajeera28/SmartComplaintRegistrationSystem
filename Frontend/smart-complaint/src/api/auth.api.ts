import { http } from "./http";

type LoginRequest = { email: string; password: string };
type LoginResponse = { token: string; username: string; role: number };

type CitizenRegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  state: string;
};

type OfficerRegisterRequest = {
  name: string;
  email: string;
  password: string;
  state: string;
  departmentId: number;
  role: number;
  proofDocument: File;
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/Token/login", req);
  return data;
}

export async function registerCitizen(req: CitizenRegisterRequest) {
  const { data } = await http.post("/Token/register/citizen", req);
  return data;
}

export async function registerOfficer(req: OfficerRegisterRequest) {
  const formData = new FormData();
  formData.append("Name", req.name);
  formData.append("Email", req.email);
  formData.append("Password", req.password);
  formData.append("State", req.state);
  formData.append("DepartmentId", req.departmentId.toString());
  formData.append("Role", req.role.toString());
  formData.append("ProofDocument", req.proofDocument);
  
  const { data } = await http.post("/Officer/register", formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return data;
}