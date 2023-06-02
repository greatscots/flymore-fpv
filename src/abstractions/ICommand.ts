import { Message } from "discord.js";

export interface ICommand {
    name: string;
    description: string;
    execute(interaction: Message): Promise<void>;
}