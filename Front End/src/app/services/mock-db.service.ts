import { Injectable } from '@angular/core';

export interface DBUser {
  mobileNumber: string;
  fullName: string;
  emailAddress: string;
  userRole: 'Seller' | 'buyer';
  isRegistered: boolean; // true if completed registration wizard
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDatabaseService {
  private readonly STORAGE_KEY = 'apccb_mock_postgres_vector_db';

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    console.log('⚡ [PostgreSQL] Connecting to postgres://apccb_user:***@localhost:5432/apccb_db...');
    console.log('⚙️ [Vector DB] Initializing pgvector extension for semantic user search...');
    
    // Seed some initial existing users for testing if database is empty
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const initialUsers: DBUser[] = [
        {
          mobileNumber: '9876543210',
          fullName: 'Bhaskar',
          emailAddress: 'bhaskar@apccb.org',
          userRole: 'Seller',
          isRegistered: true,
          createdAt: new Date().toISOString()
        },
        {
          mobileNumber: '8888888888',
          fullName: 'Rajesh Kumar',
          emailAddress: 'rajesh@buyer.com',
          userRole: 'buyer',
          isRegistered: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialUsers));
      console.log('📦 [PostgreSQL] Database seeded with default users.');
    } else {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        try {
          const users = JSON.parse(data);
          let modified = false;
          users.forEach((u: any) => {
            if (u.userRole === 'individual' || u.userRole === 'Individual') {
              u.userRole = 'Seller';
              modified = true;
            }
            if (u.mobileNumber === '+919876543210') {
              u.mobileNumber = '9876543210';
              modified = true;
            }
            if (u.mobileNumber === '+918888888888') {
              u.mobileNumber = '8888888888';
              modified = true;
            }
          });
          if (modified) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  getUsers(): DBUser[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: DBUser[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // CREATE User (Signup)
  createUser(user: Omit<DBUser, 'isRegistered' | 'createdAt'>): void {
    console.log(`📥 [PostgreSQL] INSERT INTO users (full_name, mobile_number, email, role, is_registered) VALUES ('${user.fullName}', '${user.mobileNumber}', '${user.emailAddress}', '${user.userRole}', false);`);
    console.log(`🧠 [Vector DB] Creating semantic vector embedding for user ${user.fullName} (${user.mobileNumber})...`);
    
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.mobileNumber === user.mobileNumber);
    
    const newUser: DBUser = {
      ...user,
      isRegistered: false,
      createdAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    
    this.saveUsers(users);
  }

  // READ User (Login / Check)
  getUser(mobileNumber: string): DBUser | null {
    console.log(`🔍 [PostgreSQL] SELECT * FROM users WHERE mobile_number = '${mobileNumber}';`);
    console.log(`🧠 [Vector DB] Performing similarity search for query vector matching '${mobileNumber}'...`);
    
    const users = this.getUsers();
    
    // 1. Try exact match
    let user = users.find(u => u.mobileNumber === mobileNumber);
    if (user) return user;
    
    // 2. Try match after stripping prefix +91
    if (mobileNumber.startsWith('+91')) {
      const stripped = mobileNumber.substring(3);
      user = users.find(u => u.mobileNumber === stripped);
      if (user) return user;
    }
    
    // 3. Try prepending +91 if database stores prefixed but query is 10-digits
    if (mobileNumber.length === 10 && !mobileNumber.startsWith('+')) {
      const prefixed = '+91' + mobileNumber;
      user = users.find(u => u.mobileNumber === prefixed);
      if (user) return user;
    }
    
    return null;
  }

  // UPDATE User Registration Status (Final Submit)
  completeRegistration(mobileNumber: string): void {
    console.log(`📤 [PostgreSQL] UPDATE users SET is_registered = true WHERE mobile_number = '${mobileNumber}';`);
    
    const users = this.getUsers();
    const user = users.find(u => u.mobileNumber === mobileNumber);
    if (user) {
      user.isRegistered = true;
      this.saveUsers(users);
      console.log(`✅ [PostgreSQL] Registration marked complete for user ${user.fullName} (${mobileNumber}).`);
    }
  }
}

