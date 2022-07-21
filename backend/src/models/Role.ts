// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('role')
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
        public id: number;

    @Column({
        unique: true
    })
        public name: string;
}
