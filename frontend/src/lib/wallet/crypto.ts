export type EncryptedPayload = {
    version: 1;
    cipherText: string; // base64
    iv: string;         // base64
    salt: string;       // base64
    iterations: number; // PBKDF2 iterations (>= 100_000)
};

const ITERATIONS = 200_000;

function toBase64(input: Uint8Array | ArrayBuffer): string {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}

function fromBase64(str: string): Uint8Array<ArrayBuffer> {
    const binaryStr = atob(str);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}

async function deriveKey(
    password: string,
    salt: Uint8Array<ArrayBuffer>,
    iterations: number,
): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

export async function encryptSecret(
    secret: string,
    password: string,
): Promise<EncryptedPayload> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt, ITERATIONS);
    const cipherBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(secret),
    );
    return {
        version: 1,
        cipherText: toBase64(cipherBuf),
        iv: toBase64(iv),
        salt: toBase64(salt),
        iterations: ITERATIONS,
    };
}

export async function decryptSecret(
    payload: EncryptedPayload,
    password: string,
): Promise<string> {
    const salt = fromBase64(payload.salt);
    const iv = fromBase64(payload.iv);
    const key = await deriveKey(password, salt, payload.iterations);
    const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        fromBase64(payload.cipherText),
    );
    return new TextDecoder().decode(plainBuf);
}
