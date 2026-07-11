export type Role = "admin" | "staff";

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";
export type JobStatus = "scheduled" | "done" | "canceled";
export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";
export type ServiceType = "house" | "office" | "store" | "str" | "other";
export type DocKind = "quote" | "invoice";
export type DocStatus = "draft" | "sent" | "paid" | "overdue" | "accepted" | "declined";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  cleaning_type: string | null;
  kids: string | null;
  pets: string | null;
  frequency: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  client_id: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  client_id: string | null;
  title: string;
  service_type: ServiceType;
  scheduled_at: string | null;
  duration_min: number | null;
  status: JobStatus;
  recurrence: Recurrence;
  assigned_to: string | null;
  price: number | null;
  notes: string | null;
  created_at: string;
}

export interface CrmDocument {
  id: string;
  kind: DocKind;
  number: string | null;
  client_id: string | null;
  job_id: string | null;
  issue_date: string | null;
  due_date: string | null;
  status: DocStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  document_id: string;
  description: string;
  qty: number;
  unit_price: number;
  amount: number;
}
