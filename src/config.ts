export type Config = {
    BotToken: string;
    GptApiKey: string;
    ClientId?: string;
    database: {
        database: string;
        username: string;
        password: string;
        host: string;
    }
};

export const config: Config = {
    BotToken: process.env.BOT_TOKEN || "",
    GptApiKey: process.env.GPT_API_KEY || "",
    database: {
        database: process.env.DATABASE || "",
        username: process.env.DATABASE_USER || "",
        password: process.env.DATABASE_PASSWORD || "",
        host: process.env.DATABASE_HOST || "",
    }
};