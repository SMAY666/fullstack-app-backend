// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck


import {BaseEntity, Column, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './User';

export class Company extends BaseEntity{
    @PrimaryGeneratedColumn()
        public id: number;

    @Column()
       public owner: User;

    @Column()
        public name: string;

    @Column()
        public description: string;

    @Column()
        public email: string;

}
