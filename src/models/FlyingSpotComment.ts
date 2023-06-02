import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    BeforeCreate,
} from 'sequelize-typescript';
import FlyingSpot from './FlyingSpot';

@Table
export default class FlightSpotComment extends Model {
    // Message Id Primary Key
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    messageId!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    // Created At
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    createdAt!: Date;

    @ForeignKey(() => FlyingSpot)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    flyingSpotId!: string;

    @BelongsTo(() => FlyingSpot)
    flyingSpot!: FlyingSpot;

    @BeforeCreate
    static setCreatedAt(comment: FlightSpotComment) {
        comment.createdAt = new Date();
    }
}