import { Base64 } from "base64-string";

export default class EncryptUtils {
    static base64: Base64;
    public static base64Decode(data: string): string {
        if (!this.base64) {
            this.base64 = new Base64();
        }
        return this.base64.decode(data);
    }

    public static base64Encode(data: string): string {
        if (!this.base64) {
            this.base64 = new Base64();
        }
        return this.base64.encode(data);
    }
}
