export interface UserBase {
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'asha_worker';
  full_name?: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserResponse extends UserBase {
  id: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
