// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Employee} from './Employee';

@Entity('events')
export class Event extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @Column({type: 'timestamptz'})
    public dateBegin: Date;

    @Column({type: 'timestamptz'})
    public dateEnd: Date;

    @Column()
    public status: string; // Open / Close / In Process

    @ManyToOne(() => Employee, (employee) => employee.id, {nullable: true})
    public issuedFor: Employee | null;
}
