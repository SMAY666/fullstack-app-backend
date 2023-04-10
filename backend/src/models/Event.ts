// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('events')
export class Event extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @ Column({type: 'timestamptz'})
    public dateBegin: Date;

    @Column({type: 'timestamptz'})
    public dateEnd: Date;

    @Column()
    public status: string; // Open / Close
}
