// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {Role} from './Role';


@Entity('user')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
        public id: number;

    @Column()
        public firstName: string;

    @Column()
        public middleName: string;

    @Column()
       public lastName: string;

    @Column()
        public role: Role;

    @Column({
        unique: true,
        transformer: {
            to: (value: string) => value.toLowerCase(),
            from: (value: string) => value
        }
    })
        public email: string;

    @Column()
        public password: string;
}
