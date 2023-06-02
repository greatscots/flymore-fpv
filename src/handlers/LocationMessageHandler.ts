import { Message, MessageReaction } from "discord.js";
import { IMessageHandler, MessageHandlingContext } from "../abstractions/IMessageHandler";
import { inject, injectable, named } from "inversify";
import { LocationService } from "../services/LocationService";
import { config } from "../config";
import { TYPES } from "../symbols";
import { IFlyingSpotRepository } from "../repositories/FlyingSpotRepository";
import { Reactions } from "../enums/Reactions";
import FlightSpotComment from "../models/FlyingSpotComment";

@injectable()
export class LocationMessageHandler implements IMessageHandler {
    private readonly _next: IMessageHandler;

    private readonly _flyingSpotRepository: IFlyingSpotRepository;

    constructor(
        @inject(TYPES.IMessageHandler) @named(TYPES.Handlers.LocationDescriptionHandler) next: IMessageHandler,
        @inject(TYPES.IFlyingSpotRepository) flyingSpotRepository: IFlyingSpotRepository
    ) {
        this._next = next;
        this._flyingSpotRepository = flyingSpotRepository;
    }

    async handle(context: MessageHandlingContext): Promise<void> {
        await Promise.all(context.Messages.map(async (message: Message) => {
            await this.parse(message, context);
        }));

        await this._next.handle(context);
    }

    private async parse(message: Message, context: MessageHandlingContext): Promise<void> {
        const location = await LocationService.getLocation(message.content);

        if (location) {
            console.log(`Location found: ${location.Latitude}, ${location.Longitude}`);
            context.Coordinates = location;

            const flyingSpotsNearby = await this._flyingSpotRepository.searchNearby(location.Latitude, location.Longitude, 1000);

            let flyingSpotId: string | undefined;

            if (flyingSpotsNearby.length > 0) {
                
                const existingFlyingSpot = flyingSpotsNearby[0];

                console.log(`Existing location found: ${existingFlyingSpot.name}`);

                flyingSpotId = existingFlyingSpot.id;

                message.react(Reactions.LocationUpdate);
            }
            else {
                const newFlyingSpot = await this._flyingSpotRepository.create(
                    "TBD", "TBD", location.Latitude, location.Longitude
                );

                console.log(`New location created: ${newFlyingSpot.name}`);

                flyingSpotId = newFlyingSpot.id;
                context.isNewFlyingSpot = true;

                message.react(Reactions.LocationSet);
            }

            if (flyingSpotId) {
                FlightSpotComment.bulkCreate(context.Messages.map((msg) => {
                    return {
                        messageId: msg.id,
                        content: msg.content,
                        flyingSpotId: flyingSpotId,
                        createdAt: msg.createdTimestamp,
                    };
                }), {
                    updateOnDuplicate: ['messageId']
                });

                context.flyingSpotId = flyingSpotId;

                await this._next.handle(context);
            }
        }
    }

    private hasBotReacted(msg: Message): boolean {
        return msg.reactions.cache.find((reaction: MessageReaction) => reaction.emoji.name === '🏳️')
            ?.users.cache.find((user) => user.id === config.ClientId) !== undefined;
    }
}