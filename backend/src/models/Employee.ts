// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Company} from './Company';

@Entity('eployees')
export class Employee extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;
    @ManyToOne(type => Company, company => company.id)
    @Column()
    public company: Company;

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
