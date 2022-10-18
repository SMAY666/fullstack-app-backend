// eslint linebreak-style: ["error", "windows"]

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Customer} from './Customers';


@Entity('documents')
export class Document extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public type: string;

    @ManyToOne(() => Customer, (customer) => customer.id)
    public customer: Customer;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @Column({type: 'date'})
    public dateOfBegin: string;

    @Column({type: 'date'})
    public dateOfEnd: string;
}
