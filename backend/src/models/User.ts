// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {Role} from './Role';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        firstName: string;

    @Column()
        middleName: string;

    @Column()
        lastName: string;

    @Column()
        role: Role;
    @Column()
        password: string

}
