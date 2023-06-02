import { inject, injectable, named } from "inversify";
import { IMessageHandler, MessageHandlingContext } from "../abstractions/IMessageHandler";
import { LocationMessageHandler } from "./LocationMessageHandler";
import { TYPES } from "../symbols";

@injectable()
export class HistoryMessageHandler implements IMessageHandler {
    private readonly _next: IMessageHandler;

    constructor(
        @inject(TYPES.IMessageHandler) @named(TYPES.Handlers.LocationMessageHandler) next: IMessageHandler
    ) {
        this._next = next;
    }

    public async handle(context: MessageHandlingContext): Promise<void> {
        if (!context.IncludeHistory) {
            return;
        }

        const allMessages = [];

        allMessages.push(...context.Messages);

        let message = context.Messages[0];

        while (message.reference?.messageId) {
            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId!);
            
            allMessages.push(repliedMessage);

            message = repliedMessage;
        }

        context.Messages = allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        await this._next.handle(context);
    }
}