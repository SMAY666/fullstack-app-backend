// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Company} from './Company';


export class Employee extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;
    @OneToOne(() => Company)
    @Column()
        company: Company;

    @Column()
    public firstName: string;

    @Column()
    public middleName: string;

    @Column()
    public lastName: string;

    @Column()
    public dateOfBorn: Date;

    @Column()
    public post: string;

    @Column()
    public salary: number;
}
