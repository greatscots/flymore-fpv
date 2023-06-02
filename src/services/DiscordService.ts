import { injectable, multiInject } from "inversify";
import { IBackgroundService } from "../abstractions/IBackgroundService";
import { Client, GatewayIntentBits, Message, MessageReaction, Events, Interaction } from "discord.js";
import { TYPES } from "../symbols";
import { IMessageHandler } from "../abstractions/IMessageHandler";
import { container } from "../container";
import { config } from "../config";
import { ICommand } from "../abstractions/ICommand";
import { HistoryMessageHandler } from "../handlers/HistoryMessageHandler";

@injectable()
export class DiscordService implements IBackgroundService {
    private readonly client = new Client({
        intents: 
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessageReactions,
        ],
    });

    private readonly commands: ICommand[];

    constructor(@multiInject(TYPES.ICommand) commands: ICommand[]) {
        this.commands = commands;
    }

    public async start(): Promise<void> {
        this.client.on(Events.ClientReady, () => {
            console.log('Bot is ready!');

            config.ClientId = this.client.user?.id!;
        });

        this.client.on(Events.MessageCreate, this.onMessageCreate.bind(this));

        this.client.login(config.BotToken);
    }

    private async onMessageCreate(msg: Message): Promise<void> {
        const messageHandler: IMessageHandler = container.getNamed<IMessageHandler>(TYPES.IMessageHandler, TYPES.Handlers.HistoryMessageHandler);
        const context = { Messages: [msg], IncludeHistory: true };

        const command = this.commands.find((cmd) => cmd.name === msg.content);

        if (!command) {
            await this.executeSafe(async () => await messageHandler.handle(context));
        }
        else {
            await this.executeSafe(async () => await command.execute(msg));
        }
    }

    private executeSafe<T>(func: () => Promise<T>): Promise<T> {
        try {
            return func();
        }
        catch (e) {
            console.error(e);
            return Promise.resolve(undefined as unknown as T);
        }
    }
}