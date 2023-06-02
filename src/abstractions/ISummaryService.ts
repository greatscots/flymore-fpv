export interface ISummaryService {
    updateSummary(flyingSpotId: string, force: boolean): Promise<void>;
}