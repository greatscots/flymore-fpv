import puppeteer, { Browser } from "puppeteer";
import { Coordinates } from "../types/Coordinates";

export class LocationService {
    public static async messageContainsLocation(message: string): Promise<boolean> {
        return this.getLocation(message) !== undefined;
    }

    public static async getLocation(message: string): Promise<Coordinates | undefined> {
        return this.getLocationFromRegex(message)
            ?? this.getLocationFromUrl(message);
    }

    private static getLocationFromRegex(message: string): Coordinates | undefined {
        const regex = /(?<latitude>-?\d+(\.\d+)?),\s*(?<longitude>-?\d+(\.\d+)?)/g;
        const match = regex.exec(message);

        if (match?.groups?.latitude && match?.groups?.longitude) {
            return {
                Latitude: parseFloat(match.groups.latitude),
                Longitude: parseFloat(match.groups.longitude),
            };
        }

        return undefined;
    }

    private static _browser: Browser | undefined;

    // Get Location from Google Maps URL
    private static async getLocationFromUrl(message: string): Promise<Coordinates | undefined> {
        
        // Regex for any url
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

        const matches = [...message.matchAll(regex)].map((match) => match[0]);

        console.log(matches);

        const url = matches?.filter((match) => match?.includes("maps")).pop();

        console.log(url);

        if (!url) {
            return undefined;
        }

        const resolvedUrl = await this.resolveUrl(url);

        console.log(resolvedUrl);

        return this.getLocationFromRegex(resolvedUrl);
    }

    // Resolve shortened urls using puppeteer
    private static async resolveUrl(url: string): Promise<string> {
        if (!this._browser) {
            this._browser = await puppeteer.launch();
        }

        const page = await this._browser.newPage();
        page.goto(url);
        await page.waitForNavigation();

        try {
            return page.url();
        }
        finally {
            await page.close();
        }
    }
}