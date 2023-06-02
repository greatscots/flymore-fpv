import "reflect-metadata";

// Use DotEnv to load environment variables from .env file
// https://www.npmjs.com/package/dotenv
import * as dotenv from "dotenv";
dotenv.config();

import { container } from "./container";
import { IBackgroundService } from "./abstractions/IBackgroundService";
import { TYPES } from "./symbols";
import { database } from "./database";

async function main() {
    await database.authenticate();
    await database.sync({ force: true });

    const discordService = container.get<IBackgroundService>(TYPES.IBackgroundService);

    discordService.start();
}

void main();