// eslint linebreak-style: ["error", "windows"]
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';


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

    @Column()
    public description: string;

    @Column()
    public documentsCount: number;
}
