import { Container } from "inversify";
import { DiscordService } from "./services/DiscordService";
import { TYPES } from "./symbols";
import { IBackgroundService } from "./abstractions/IBackgroundService";
import { IMessageHandler } from "./abstractions/IMessageHandler";
import { LocationMessageHandler } from "./handlers/LocationMessageHandler";
import { HistoryMessageHandler } from "./handlers/HistoryMessageHandler";
import { CrawlChannelCommand } from "./commands/CrawlChannelCommand";
import { ICommand } from "./abstractions/ICommand";
import { LocationDescriptionHandler } from "./handlers/LocationDescriptionHandler";
import { ISummaryService } from "./abstractions/ISummaryService";
import { GptSummaryService } from "./services/GptSummaryService";
import { IFlyingSpotRepository, FlyingSpotRepository } from "./repositories/FlyingSpotRepository";

const container = new Container();

// Bind BackgroundServices
container.bind<IBackgroundService>(TYPES.IBackgroundService).to(DiscordService).inSingletonScope();

// Bind MessageHandlers
container.bind<IMessageHandler>(TYPES.IMessageHandler).to(HistoryMessageHandler).inRequestScope().whenTargetNamed(TYPES.Handlers.HistoryMessageHandler);
container.bind<IMessageHandler>(TYPES.IMessageHandler).to(LocationMessageHandler).inRequestScope().whenTargetNamed(TYPES.Handlers.LocationMessageHandler);
container.bind<IMessageHandler>(TYPES.IMessageHandler).to(LocationDescriptionHandler).inRequestScope().whenTargetNamed(TYPES.Handlers.LocationDescriptionHandler);

// Bind Commands
container.bind<ICommand>(TYPES.ICommand).to(CrawlChannelCommand).inSingletonScope();

// Bind Infrastructure
container.bind<ISummaryService>(TYPES.ISummaryService).to(GptSummaryService).inSingletonScope();


// Bind Repositories
container.bind<IFlyingSpotRepository>(TYPES.IFlyingSpotRepository).to(FlyingSpotRepository).inSingletonScope();

export { container };