// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck


import {BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './User';

@Entity('companies')
export class Company extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public owner: string;

    @Column()
    public name: string;

    @Column()
    public description: string;

    @Column()
    public email: string;
}
