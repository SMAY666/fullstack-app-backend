// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';

import {Role} from './Role';


@Entity('employees')
export class Employee extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public firstName: string;

    @Column()
    public middleName: string;

    @Column()
    public lastName: string;

    @Column({type: 'date'})
    public dateOfBorn: string;

    @Column()
    public post: string;

    @Column()
    public salary: number;

    @ManyToOne(() => Role, (role) => role.id)
    public role: Role;

    @Column({
        unique: true,
        transformer:
            {
                to: (value: string) => value.toLowerCase(),
                from: (value: string) => value
            }
    })
    public email: string;

    @Column()
    public passwordHash: string;
}
