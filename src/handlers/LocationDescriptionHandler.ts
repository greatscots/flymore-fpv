import { inject, injectable } from "inversify";
import { IMessageHandler, MessageHandlingContext } from "../abstractions/IMessageHandler";
import { ISummaryService } from "../abstractions/ISummaryService";
import { TYPES } from "../symbols";


@injectable()
export class LocationDescriptionHandler implements IMessageHandler {
    private readonly _summaryService: ISummaryService;

    constructor(
        @inject(TYPES.ISummaryService) summaryService: ISummaryService
    ) {
        this._summaryService = summaryService;
    }

    public async handle(context: MessageHandlingContext): Promise<void> {
        if (!context.flyingSpotId) {
            return;
        }

        const summary = await this._summaryService.updateSummary(context.flyingSpotId, context.isNewFlyingSpot == true);
    }
}