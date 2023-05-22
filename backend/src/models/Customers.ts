// eslint linebreak-style: ["error", "windows"]
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Employee} from './Employee';


@Entity('customers')
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public fullName: string;

    @Column()
    public phoneNumber: string;

    @Column({unique: true})
    public email: string;

    @Column({nullable: true})
    public type: string;

    @Column()
    public description: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    public assignedEmployee: Employee;

    @Column()
    public documentsCount: number;
}
