import { UsersService, User } from './users.service';
export interface CreateUserDto {
    name: string;
    email: string;
}
export interface UpdateUserDto {
    name?: string;
    email?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
