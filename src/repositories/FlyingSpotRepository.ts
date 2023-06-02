import { Op, Sequelize } from 'sequelize';
import FlyingSpot from '../models/FlyingSpot';
import { injectable } from 'inversify';
import FlyingSpotComment from '../models/FlyingSpotComment';
import { v4 as uuid } from 'uuid';
import { SafetyClassification } from '../enums/SafetyClassification';

export interface IFlyingSpotRepository {
    searchNearby(lat: number, long: number, distance: number): Promise<FlyingSpot[]>;
    create(name: string, description: string, lat: number, long: number): Promise<FlyingSpot>;
    getById(id: string): Promise<FlyingSpot | null>;
}

@injectable()
export class FlyingSpotRepository {

    async searchNearby(lat: number, long: number, radius: number = 100) {
        const flyingSpots = await FlyingSpot.findAll({
            where:
                Sequelize.where(
                    Sequelize.fn('ROUND',
                        Sequelize.cast(
                            Sequelize.fn('ST_DistanceSphere',
                                Sequelize.fn('ST_Centroid', Sequelize.col('location')),
                                Sequelize.literal(`ST_GeomFromText('POINT(${lat} ${long})', 4326)`)
                            ),
                            'numeric'), 2
                    ),
                    { [Op.lte]: radius }
                )
        });

        return flyingSpots;
    }

    async create(name: string, description: string, lat: number, long: number) {
        const flyingSpot = await FlyingSpot.create({
            id: uuid(),
            createdAt: new Date(),
            name,
            description,
            safetyClassification: null,
            location: FlyingSpot.setLocation(lat, long),
        });

        return flyingSpot;
    }

    async getById(id: string) {
        const flyingSpot = await FlyingSpot.findByPk(id, {
            include: FlyingSpotComment,
        });

        return flyingSpot;
    }
}
