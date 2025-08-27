import { Injectable } from '@nestjs/common';
import { EventPublisherService } from '@logistically/events-nestjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  constructor(private readonly eventPublisher: EventPublisherService) {}

  async findAll(): Promise<User[]> {
    // Publish an event when users are fetched
    await this.eventPublisher.publish('users.fetched', {
      count: this.users.length,
      timestamp: new Date().toISOString()
    });
    
    return this.users;
  }

  async findOne(id: number): Promise<User | null> {
    const user = this.users.find(user => user.id === id);
    
    if (user) {
      // Publish an event when a specific user is fetched
      await this.eventPublisher.publish('user.fetched', {
        userId: id,
        timestamp: new Date().toISOString()
      });
    }
    
    return user || null;
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      ...userData,
    };
    
    this.users.push(newUser);
    
    // Publish an event when a new user is created
    await this.eventPublisher.publish('user.created', {
      user: newUser,
      timestamp: new Date().toISOString()
    });
    
    return newUser;
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    
    // Publish an event when a user is updated
    await this.eventPublisher.publish('user.updated', {
      userId: id,
      user: this.users[userIndex],
      timestamp: new Date().toISOString()
    });
    
    return this.users[userIndex];
  }

  async delete(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return false;
    }
    
    const deletedUser = this.users.splice(userIndex, 1)[0];
    
    // Publish an event when a user is deleted
    await this.eventPublisher.publish('user.deleted', {
      userId: id,
      user: deletedUser,
      timestamp: new Date().toISOString()
    });
    
    return true;
  }
}
