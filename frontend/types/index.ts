export interface Item {
  id?: number;
  name: string;
  description?: string;
  price: number;
  created_at?: string;
}

export interface ItemCreate {
  name: string;
  description?: string;
  price: number;
}

export interface Stats {
  total_items: number;
  total_value: number;
  average_price: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
