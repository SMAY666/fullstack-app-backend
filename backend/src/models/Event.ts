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
    
    @ Column({type: 'date'})
    public dateOfTheBegining: string;

    @Column({type: 'date'})
    public dateOfTheEnd: string;

    @Column({readonly: true})
    public status: string; // Open / Close
}
