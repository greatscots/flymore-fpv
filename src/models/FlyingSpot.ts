import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    BeforeCreate,
    BeforeUpdate,
    BeforeDestroy,
} from 'sequelize-typescript';
import FlightSpotComment from './FlyingSpotComment';
import { Sequelize, UUIDV4 } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { SafetyClassification } from '../enums/SafetyClassification';

@Table
export default class FlyingSpot extends Model {
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    safetyClassification!: SafetyClassification;

    @Column(DataType.GEOMETRY('POINT'))
    location!: any;

    static setLocation = (lat: number, long: number) => {
        return Sequelize.literal(`ST_GeomFromText('POINT(${lat} ${long})', 4326)`);
    }

    // Created At
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    createdAt!: Date;

    // Updated At
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    updatedAt!: Date;

    // Deleted At
    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    deletedAt!: Date;

    @HasMany(() => FlightSpotComment)
    comments!: FlightSpotComment[];

    @BeforeCreate
    static setCreatedAt(flyingSpot: FlyingSpot) {
        flyingSpot.id = uuid();
        flyingSpot.createdAt = new Date();
    }

    @BeforeUpdate
    static setUpdatedAt(flyingSpot: FlyingSpot) {
        flyingSpot.updatedAt = new Date();
    }

    @BeforeDestroy
    static setDeletedAt(flyingSpot: FlyingSpot) {
        flyingSpot.deletedAt = new Date();
    }
    
    // Add Comment
    addComment(comment: FlightSpotComment) {
        this.comments.push(comment);
    }
}