import { http } from "./http";

export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
  categories?: Category[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
  departmentId: number;
  departmentName?: string;
  description?: string;
}

export async function getAllDepartments(): Promise<Department[]> {
  const { data } = await http.get<Department[]>("/Department");
  return data;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await http.get<Department[]>("/Department");
  return data;
}

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await http.get<Category[]>("/Category");
  return data;
}

export async function addDepartment(departmentName: string, description?: string): Promise<Department> {
  const { data } = await http.post<Department>("/Department", { 
    DepartmentName: departmentName,
    Description: description || ''
  });
  return data;
}

export async function addCategory(categoryName: string, departmentId: number): Promise<Category> {
  const { data } = await http.post<Category>("/Category", { CategoryName: categoryName, DepartmentId: departmentId });
  return data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await http.delete(`/Category/${categoryId}`);
}

export async function deleteDepartment(departmentId: number): Promise<void> {
  await http.delete(`/Department/${departmentId}`);
}