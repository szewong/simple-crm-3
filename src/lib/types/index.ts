export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
  address: Address | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company_id: string | null;
  position: string | null;
  address: Address | null;
  social_links: SocialLinks | null;
  notes: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
}

export interface DealStage {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  title: string;
  value: number | null;
  stage_id: string;
  contact_id: string | null;
  company_id: string | null;
  probability: number | null;
  expected_close_date: string | null;
  closed_at: string | null;
  close_reason: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: "call" | "email" | "meeting" | "task" | "note";
  title: string;
  description: string | null;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  content: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ContactTag {
  contact_id: string;
  tag_id: string;
}

export interface DealTag {
  deal_id: string;
  tag_id: string;
}

// Helper types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

// Relation types
export interface ContactWithCompany extends Contact {
  company: Company | null;
}

export interface ContactWithTags extends Contact {
  tags: Tag[];
}

export interface ContactWithRelations extends Contact {
  company: Company | null;
  tags: Tag[];
}

export interface DealWithStage extends Deal {
  stage: DealStage;
}

export interface DealWithRelations extends Deal {
  stage: DealStage;
  contact: Contact | null;
  company: Company | null;
  tags: Tag[];
}

export interface ActivityWithRelations extends Activity {
  contact: Contact | null;
  company: Company | null;
  deal: Deal | null;
}

export interface NoteWithRelations extends Note {
  contact: Contact | null;
  company: Company | null;
  deal: Deal | null;
}

export interface CompanyWithContacts extends Company {
  contacts: Contact[];
}

export interface CompanyWithRelations extends Company {
  contacts: Contact[];
  deals: Deal[];
}
