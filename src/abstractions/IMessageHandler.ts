import { Message } from "discord.js";
import { Coordinates } from "../types/Coordinates";
import FlyingSpot from "../models/FlyingSpot";

export type MessageHandlingContext = {
    IncludeHistory: boolean;
    Messages: Message[];
    Coordinates?: Coordinates;
    flyingSpotId?: string;
    isNewFlyingSpot?: boolean;
};

export interface IMessageHandler {
    handle(context: MessageHandlingContext): Promise<void>;
}