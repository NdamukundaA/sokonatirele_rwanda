
export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
}

export const dummyUsers: User[] = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe'
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User'
  },
  {
    id: 3,
    email: 'test@example.com',
    password: 'test123',
    fullName: 'Test User'
  }
];
