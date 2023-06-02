export const TYPES = {
    IBackgroundService: Symbol.for("IBackgroundService"),
    IMessageHandler: Symbol.for("IMessageHandler"),
    ICommand: Symbol.for("ICommand"),
    ISummaryService: Symbol.for("ISummaryService"),
    IFlyingSpotRepository: Symbol.for("IFlyingSpotRepository"),
    Handlers: {
        HistoryMessageHandler: Symbol.for("HistoryMessageHandler"),
        LocationMessageHandler: Symbol.for("LocationMessageHandler"),
        LocationDescriptionHandler: Symbol.for("LocationDescriptionHandler"),
    }
};