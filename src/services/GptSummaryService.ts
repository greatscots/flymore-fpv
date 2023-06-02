import { inject, injectable } from "inversify";
import { ISummaryService } from "../abstractions/ISummaryService";
import { config } from "../config";
import { ChatClient, OpenAiModels } from "../infrastructure/ChatClient";
import { IFlyingSpotRepository } from "../repositories/FlyingSpotRepository";
import { TYPES } from "../symbols";
import { retryAsync } from 'ts-retry';
import { SafetyClassification } from "../enums/SafetyClassification";

@injectable()
export class GptSummaryService implements ISummaryService {
    private readonly _summaryClient: ChatClient;
    private readonly _safetyClient: ChatClient;
    private readonly _flyingSpotRepository: IFlyingSpotRepository;

    constructor(
        @inject(TYPES.IFlyingSpotRepository) flyingSpotRepository: IFlyingSpotRepository
    ) {
        this._summaryClient = new ChatClient(
            config.GptApiKey,
            OpenAiModels.Gpt35Turbo,
            "Basierend auf den bereitgestellten Kommentaren zu einem Standort, bitte erstellen Sie einen einzigartigen und ansprechenden Titel für diesen FPV-Drohnenflugstandort und generieren Sie eine kurze Beschreibung. Nutzen Sie die Informationen aus den Kommentaren ausschließlich und genau wie sie sind, um ein einnehmendes Bild des Standortes zu zeichnen. Erfinden Sie keine zusätzlichen Informationen oder fügen Sie keine eigenen Annahmen hinzu. Berücksichtigen Sie dabei geografische Merkmale, besondere Flugbedingungen oder herausragende Szenen, die mit einer FPV-Drohne eingefangen werden können. Bitte stellen Sie sicher, dass Ihr Ausgabeformat immer wie folgt aussieht: 'Titel: [Titel]\nBeschreibung: [Beschreibung]'.",
        );

        this._safetyClient = new ChatClient(
            config.GptApiKey,
            OpenAiModels.Gpt35Turbo,
            "Basierend auf den bereitgestellten Kommentaren zu einem FPV-Drohnenflugstandort, bewerten Sie bitte den Status des Fliegens an diesem Standort. Ihre Antwort sollte ausschließlich auf den zur Verfügung gestellten Informationen basieren und eine der folgenden drei Kategorien sein: 'Sicher', 'Ungewiss' oder 'Verboten'. Wenn die Kommentare keine eindeutigen Hinweise darauf geben, dass der Standort 'Sicher' oder 'Verboten' ist, stufen Sie den Standort bitte als 'Ungewiss' ein.",
        );

        this._flyingSpotRepository = flyingSpotRepository;
    }

    public async updateSummary(flyingSpotId: string, force: boolean): Promise<void> {
        const flyingSpot = await this._flyingSpotRepository.getById(flyingSpotId);

        if (!flyingSpot) {
            return;
        }

        const newestComment = flyingSpot.comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        if (newestComment?.createdAt.getTime() < flyingSpot.updatedAt.getTime() && !force) {
            return;
        }

        const text = flyingSpot.comments.map((comment) => comment.content).join('\n\n');

        await retryAsync(async () => {
            const summary = await this._summaryClient.generateText(text);

            const title = summary.split('\n')[0].replace('Titel: ', '');
            const description = summary.split('\n')[1].replace('Beschreibung: ', '');

            const sicherheit = await this._safetyClient.generateText(text);

            const safetyMapping = {
                'Sicher': SafetyClassification.Safe,
                'Ungewiss': SafetyClassification.Uncertain,
                'Verboten': SafetyClassification.Forbidden,
            };

            const safety = Object.keys(safetyMapping).find((key) => sicherheit.toLowerCase().includes(key.toLowerCase()));

            await flyingSpot.update({
                name: title,
                description: description,
                safetyClassification: safety,
                updatedAt: new Date(),
            });
        }, {
            maxTry: 3,
            delay: 1000,
        });
    }
}