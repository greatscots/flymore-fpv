export class ChatClient {
    private readonly apiKey: string;
    private readonly model: string;

    private readonly systemDescription: string;

    constructor(apiKey: string, model: OpenAiModels, systemDescription: string) {
        this.apiKey = apiKey;
        this.model = model;
        this.systemDescription = systemDescription;
    }

    public async generateText(text: string): Promise<string> {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                "credentials": "include",
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                "body": JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: this.systemDescription,
                        },
                        {
                            role: "user",
                            content: text,
                        },
                    ]
                }),
            }
        );

        const json = await response.json() as ChatCompletion;

        console.log(json);

        return json.choices[0].message.content;
    }
}

export enum OpenAiModels {
    Gpt4 = 'gpt-4',
    Gpt35Turbo = 'gpt-3.5-turbo',
}

type Message = {
    role: string;
    content: string;
};

type Choice = {
    index: number;
    message: Message;
    finish_reason: string;
};

type Usage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};

type ChatCompletion = {
    id: string;
    object: string;
    created: number;
    choices: Choice[];
    usage: Usage;
};
