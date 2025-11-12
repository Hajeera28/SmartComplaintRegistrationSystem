export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description: string;
  categories?: Category[];
}