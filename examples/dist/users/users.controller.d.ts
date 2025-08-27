import { UsersService, User } from './users.service';
export interface CreateUserDto {
    name: string;
    email: string;
}
export interface UpdateUserDto {
    name: string;
    email: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | undefined>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | undefined>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
