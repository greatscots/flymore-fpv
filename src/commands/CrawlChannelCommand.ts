import { Interaction, Message } from "discord.js";
import { ICommand } from "../abstractions/ICommand";
import { injectable } from "inversify";
import { LocationService } from "../services/LocationService";
import { IMessageHandler, MessageHandlingContext } from "../abstractions/IMessageHandler";
import { container } from "../container";
import { TYPES } from "../symbols";
import { LocationMessageHandler } from "../handlers/LocationMessageHandler";

@injectable()
export class CrawlChannelCommand implements ICommand {
    name = 'flymore-crawl';
    description = 'Crawl a channel for messages';
    public async execute(message: Message): Promise<void> {
        // Get all messages in message channel
        const messages = [...await message.channel.messages.fetch()].map(([_, msg]) => msg);

        const getContextWithLocation = async (msg: Message): Promise<MessageHandlingContext> => {
            const location = await LocationService.getLocation(msg.content);

            const followingMessages: Message[] = [];

            this.traverseUp(msg, followingMessages, messages);

            return {
                Messages: [ msg, ...followingMessages].sort((a, b) => a.createdTimestamp - b.createdTimestamp),
                IncludeHistory: true,
                Coordinates: location
            };
        }

        const messagesWithLocations: MessageHandlingContext[] = await Promise.all(messages.map(async (msg) => await getContextWithLocation(msg)));

        const messageHandler = container.getNamed<IMessageHandler>(TYPES.IMessageHandler, TYPES.Handlers.LocationMessageHandler);

        for (const msg of messagesWithLocations) {
            await messageHandler.handle(msg);
        }
    }

    private traverseUp(currentMessage: Message, messages: Message[], allMessages: Message[]) {
        const parents = allMessages.filter((msg) => msg.id === currentMessage.reference?.messageId);

        if (parents.length > 0) {
            for (const parent of parents) {
                messages.push(parent);
                this.traverseUp(parent, messages, allMessages);
            }
        }
    }
}