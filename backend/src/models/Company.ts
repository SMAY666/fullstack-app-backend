// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck


import {Column, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "./User";

export class Company {
    @PrimaryGeneratedColumn()
        id: number;

    @Colum()
        owner: User

    @Column()
        name: string;

    @Column()
        description: string;

    @Column
        email: string;

}
