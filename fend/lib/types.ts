export type LoginStatus = {
  isLoggedIn: boolean;
  user?: {
    id?: number;
    iss: string;
    sub: string;
    email: string;
    name: string;
  };
  error?: string;
};

// IUser.ts
export interface ILinkedUser {
  origin: string;
  user: object;
}

export interface IUser {
  id: number;
  iss?: string; // id_token.iss: 'https://accounts.google.com'
  sub?: string; // id_token.sub
  name: string;
  email: string;
  role?: string;
  linked_users?: ILinkedUser[];
  created_at: Date;
  updated_at: Date;
}

export interface IUserLink {
  link_id: string; // link_id of the source domain
  initiator: string; // domain
  destination: string; // domain
  redirect_uri: string;
  user: {
    name: string;
    email: string;
    [other: string]: string | number | boolean;
  };
}
