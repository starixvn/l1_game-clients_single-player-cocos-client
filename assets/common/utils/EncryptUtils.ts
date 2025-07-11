import { Base64 } from "base64-string";

console.log("[EncryptUtils] Loading EncryptUtils module...");

export default class EncryptUtils {
    static base64: Base64;

    public static base64Decode(data: string): string {
        console.log("🔐 [EncryptUtils] Base64 decoding data:", data);
        if (!this.base64) {
            console.log("🔐 [EncryptUtils] Initializing Base64 instance for decoding");
            this.base64 = new Base64();
        }
        const decodedData = this.base64.decode(data);
        console.log("🔐 [EncryptUtils] Base64 decoded result:", decodedData);
        return decodedData;
    }

    public static base64Encode(data: string): string {
        console.log("🔐 [EncryptUtils] Base64 encoding data:", data);
        if (!this.base64) {
            console.log("🔐 [EncryptUtils] Initializing Base64 instance for encoding");
            this.base64 = new Base64();
        }
        const encodedData = this.base64.encode(data);
        console.log("🔐 [EncryptUtils] Base64 encoded result:", encodedData);
        return encodedData;
    }
}

console.log("[EncryptUtils] EncryptUtils module loaded successfully");
