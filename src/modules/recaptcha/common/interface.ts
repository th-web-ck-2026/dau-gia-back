export interface RecaptchaPayload {
    token: string;
    type: "v2" | "v3";
    action?: string;
    scoreThreshold?: number;
}
