module.exports = {

"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/lib/api.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// API client for communicating with the Django backend
__turbopack_context__.s({
    "ApiClient": (()=>ApiClient),
    "UserStorage": (()=>UserStorage)
});
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/quantserver';
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}/${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
    // Check if username is unique
    static async checkUsernameUniqueness(username) {
        const response = await this.request(`check-uniqueness?username=${encodeURIComponent(username)}`, {
            method: 'GET'
        });
        // If Status is "Positive", the user doesn't exist (username is unique)
        return response.Status === 'Positive';
    }
    // Register a new user
    static async registerUser(name, email, username, publicKey, password) {
        const response = await this.request('register-user', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                username,
                public_key: publicKey,
                password
            })
        });
        return response.Status === 'Positive';
    }
    // Get user's public key
    static async getUserPublicKey(username) {
        const response = await this.request(`get-public-key?username=${encodeURIComponent(username)}`, {
            method: 'GET'
        });
        if (response.Status === 'Positive') {
            return {
                name: response.Name,
                publicKey: response['Public Key']
            };
        }
        return null;
    }
    // Login with email or username
    static async loginUser(identifier, password) {
        return this.request('login-user', {
            method: 'POST',
            body: JSON.stringify({
                identifier,
                password
            })
        });
    }
    // Send an email (receiver/sender can be email or username)
    static async sendEmail(receiverIdentifier, senderIdentifier, encryptedSubject, encryptedBody, password) {
        const response = await this.request('post-email', {
            method: 'POST',
            body: JSON.stringify({
                reciever_username: receiverIdentifier,
                sender_username: senderIdentifier,
                subject: encryptedSubject,
                body: encryptedBody,
                password
            })
        });
        return response.Status === 'Positive';
    }
    // Get user's inbox (identifier can be email or username)
    static async getInbox(identifier, password) {
        const response = await this.request(`get-inbox?username=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`, {
            method: 'GET'
        });
        if (response.Status === 'Positive') {
            return response.Emails || [];
        }
        return [];
    }
    // Clear user's inbox (identifier can be email or username)
    static async clearInbox(identifier, password) {
        const response = await this.request('clear-inbox', {
            method: 'POST',
            body: JSON.stringify({
                username: identifier,
                password
            })
        });
        return response.Status === 'Positive';
    }
}
class UserStorage {
    static STORAGE_KEY = 'quantsec_user_data';
    // Store user data securely
    static storeUserData(userData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to store user data:', error);
            throw new Error('Failed to store user data');
        }
    }
    // Retrieve user data
    static getUserData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to retrieve user data:', error);
            return null;
        }
    }
    // Check if user is logged in
    static isLoggedIn() {
        return this.getUserData() !== null;
    }
    // Get current user
    static getCurrentUser() {
        return this.getUserData();
    }
    // Clear user data (logout)
    static clearUserData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear user data:', error);
        }
    }
    // Update user data (e.g., after key import/export)
    static updateUserData(updates) {
        const currentData = this.getUserData();
        if (currentData) {
            const updatedData = {
                ...currentData,
                ...updates
            };
            this.storeUserData(updatedData);
        }
    }
}
}}),
"[project]/src/lib/crypto.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Crypto utilities for the Quantum Secure Email Client
// Uses Web Crypto API for AES-256, HMAC-SHA256, and scrypt for key derivation
// Uses real Crystal-Kyber via backend API
__turbopack_context__.s({
    "CryptoUtils": (()=>CryptoUtils),
    "RealKyber": (()=>RealKyber),
    "decrypt": (()=>decrypt),
    "encrypt": (()=>encrypt)
});
class CryptoUtils {
    // Generate random bytes
    static async randomBytes(length) {
        return crypto.getRandomValues(new Uint8Array(length));
    }
    // Convert ArrayBuffer to base64
    static arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for(let i = 0; i < bytes.byteLength; i++){
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    // Convert base64 to ArrayBuffer
    static base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for(let i = 0; i < binaryString.length; i++){
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    // Convert string to ArrayBuffer
    static stringToArrayBuffer(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str).buffer;
    }
    // Convert ArrayBuffer to string
    static arrayBufferToString(buffer) {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }
    // Derive key using scrypt (using scrypt-js library)
    static async deriveKey(password, salt, keyLength = 32) {
        // Import scrypt-js dynamically
        const { scrypt } = await __turbopack_context__.r("[project]/node_modules/scrypt-js/scrypt.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
        const passwordBuffer = this.stringToArrayBuffer(password);
        const derivedKey = await scrypt(new Uint8Array(passwordBuffer), salt, 16384, 8, 1, keyLength);
        return derivedKey;
    }
    // AES-256 encryption using Web Crypto API with secure IV
    static async aesEncrypt(plaintext, passkey) {
        const salt = await this.randomBytes(16);
        const iv = await this.randomBytes(16); // ✅ Secure random IV
        const key = await this.deriveKey(passkey, salt);
        // Import the key
        const cryptoKey = await crypto.subtle.importKey('raw', key, {
            name: 'AES-CBC'
        }, false, [
            'encrypt'
        ]);
        // Pad the plaintext to 16-byte blocks
        const paddedText = this.pad(plaintext);
        const plaintextBuffer = this.stringToArrayBuffer(paddedText);
        // Encrypt
        const encryptedBuffer = await crypto.subtle.encrypt({
            name: 'AES-CBC',
            iv
        }, cryptoKey, plaintextBuffer);
        return {
            cipher_text: this.arrayBufferToBase64(encryptedBuffer),
            salt: this.arrayBufferToBase64(salt),
            iv: this.arrayBufferToBase64(iv) // ✅ Include IV in output
        };
    }
    // AES-256 decryption using Web Crypto API with IV
    static async aesDecrypt(encryptedData, passkey) {
        const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt));
        const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv)); // ✅ Use provided IV
        const key = await this.deriveKey(passkey, salt);
        // Import the key
        const cryptoKey = await crypto.subtle.importKey('raw', key, {
            name: 'AES-CBC'
        }, false, [
            'decrypt'
        ]);
        const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.cipher_text);
        // Decrypt
        const decryptedBuffer = await crypto.subtle.decrypt({
            name: 'AES-CBC',
            iv
        }, cryptoKey, encryptedBuffer);
        const decryptedText = this.arrayBufferToString(decryptedBuffer);
        return this.unpad(decryptedText);
    }
    // HMAC-SHA256 - ✅ Proper HMAC implementation
    static async hmacSha256(data, key) {
        const keyBuffer = this.stringToArrayBuffer(key);
        const dataBuffer = this.stringToArrayBuffer(data);
        const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, {
            name: 'HMAC',
            hash: 'SHA-256'
        }, false, [
            'sign'
        ]);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
        return this.arrayBufferToBase64(signature);
    }
    // SHA-256 hash
    static async sha256(data) {
        const dataBuffer = this.stringToArrayBuffer(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return this.arrayBufferToBase64(hashBuffer);
    }
    // Pad string to 16-byte blocks
    static pad(s) {
        const blockSize = 16;
        const remainder = s.length % blockSize;
        const paddingNeeded = blockSize - remainder;
        return s + ' '.repeat(paddingNeeded);
    }
    // Unpad string
    static unpad(s) {
        return s.trim();
    }
}
class RealKyber {
    static API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/quantserver';
    // Generate real Kyber keypair via backend
    static async keygen() {
        const response = await fetch(`${this.API_BASE_URL}/kyber-keygen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to generate Kyber keypair');
        }
        const data = await response.json();
        if (data.Status === 'Positive') {
            return {
                publicKey: data.public_key,
                privateKey: data.private_key
            };
        } else {
            throw new Error(data.Message || 'Key generation failed');
        }
    }
    // Encrypt using real Kyber via backend
    static async encrypt(message, receiverPublicKey) {
        const response = await fetch(`${this.API_BASE_URL}/kyber-encrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                receiver_public_key: receiverPublicKey
            })
        });
        if (!response.ok) {
            throw new Error('Failed to encrypt message');
        }
        const data = await response.json();
        if (data.Status === 'Positive') {
            return data.encrypted_data;
        } else {
            throw new Error(data.Message || 'Encryption failed');
        }
    }
    // Decrypt using real Kyber via backend
    static async decrypt(tag, concatenatedString, username) {
        const response = await fetch(`${this.API_BASE_URL}/kyber-decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tag,
                concatenated_string: concatenatedString,
                username
            })
        });
        if (!response.ok) {
            throw new Error('Failed to decrypt message');
        }
        const data = await response.json();
        if (data.Status === 'Positive') {
            return data.decrypted_message;
        } else {
            throw new Error(data.Message || 'Decryption failed');
        }
    }
}
async function encrypt(message, receiverKyberPublicKey) {
    return await RealKyber.encrypt(message, receiverKyberPublicKey);
}
async function decrypt(tag, concatenatedString, username) {
    return await RealKyber.decrypt(tag, concatenatedString, username);
}
}}),
"[project]/src/app/compose/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ComposePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Box/Box.js [app-ssr] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-ssr] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-ssr] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Container/Container.js [app-ssr] (ecmascript) <export default as Container>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Alert/Alert.js [app-ssr] (ecmascript) <export default as Alert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Paper/Paper.js [app-ssr] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CircularProgress$2f$CircularProgress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircularProgress$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CircularProgress/CircularProgress.js [app-ssr] (ecmascript) <export default as CircularProgress>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Chip/Chip.js [app-ssr] (ecmascript) <export default as Chip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/esm/Send.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Person$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/esm/Person.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$CheckCircle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/esm/CheckCircle.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Error$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/esm/Error.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/crypto.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
function ComposePage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [userData, setUserData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Form data
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [subject, setSubject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Validation
    const [recipientError, setRecipientError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [subjectError, setSubjectError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [messageError, setMessageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Recipient validation
    const [recipientValidating, setRecipientValidating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recipientValid, setRecipientValid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recipientName, setRecipientName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const data = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UserStorage"].getUserData();
        if (!data) {
            router.push('/login');
            return;
        }
        setUserData(data);
    }, [
        router
    ]);
    const validateRecipient = async (identifier)=>{
        if (!identifier.trim()) {
            setRecipientError('Recipient email or username is required');
            setRecipientValid(null);
            return;
        }
        setRecipientValidating(true);
        setRecipientError('');
        try {
            const userInfo = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiClient"].getUserPublicKey(identifier);
            if (userInfo) {
                setRecipientValid(true);
                setRecipientName(userInfo.name);
                setRecipientError('');
            } else {
                setRecipientValid(false);
                setRecipientError('User not found');
                setRecipientName(null);
            }
        } catch (err) {
            setRecipientValid(false);
            setRecipientError('Failed to validate recipient');
            setRecipientName(null);
        } finally{
            setRecipientValidating(false);
        }
    };
    const handleRecipientChange = (value)=>{
        setRecipient(value);
        setRecipientValid(null);
        setRecipientName(null);
        // Clear previous timeout
        if (window.recipientValidationTimeout) {
            clearTimeout(window.recipientValidationTimeout);
        }
        // Debounce validation
        window.recipientValidationTimeout = setTimeout(()=>{
            if (value.trim()) {
                validateRecipient(value);
            }
        }, 500);
    };
    const validateForm = ()=>{
        let isValid = true;
        // Reset errors
        setRecipientError('');
        setSubjectError('');
        setMessageError('');
        // Validate recipient
        if (!recipient.trim()) {
            setRecipientError('Recipient email or username is required');
            isValid = false;
        } else if (recipientValid === false) {
            setRecipientError('Invalid recipient');
            isValid = false;
        }
        // Validate subject
        if (!subject.trim()) {
            setSubjectError('Subject is required');
            isValid = false;
        }
        // Validate message
        if (!message.trim()) {
            setMessageError('Message is required');
            isValid = false;
        }
        return isValid;
    };
    const handleSend = async ()=>{
        if (!validateForm() || !userData) {
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Get recipient's public key
            const recipientInfo = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiClient"].getUserPublicKey(recipient);
            if (!recipientInfo) {
                setError('Recipient not found');
                return;
            }
            // Encrypt subject and message
            const encryptedSubject = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(subject, recipientInfo.publicKey);
            const encryptedBody = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(message, recipientInfo.publicKey);
            // Send the email
            const success = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiClient"].sendEmail(recipient, userData.email || userData.username, JSON.stringify(encryptedSubject), JSON.stringify(encryptedBody), userData.password);
            if (success) {
                setSuccess(`Message sent successfully to ${recipientName || recipient}!`);
                // Clear form
                setRecipient('');
                setSubject('');
                setMessage('');
                setRecipientValid(null);
                setRecipientName(null);
            } else {
                setError('Failed to send message. Please try again.');
            }
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Send email error:', err);
        } finally{
            setLoading(false);
        }
    };
    const handleKeyDown = (e)=>{
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSend();
        }
    };
    if (!userData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__["Container"], {
            maxWidth: "md",
            sx: {
                mt: 4
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/src/app/compose/page.tsx",
                lineNumber: 193,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/compose/page.tsx",
            lineNumber: 192,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__["Container"], {
        maxWidth: "md",
        sx: {
            mt: 4
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
            sx: {
                p: 4
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "h4",
                    gutterBottom: true,
                    children: "Compose Email"
                }, void 0, false, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 201,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "body2",
                    color: "text.secondary",
                    sx: {
                        mb: 4
                    },
                    children: "Send an encrypted message to another user"
                }, void 0, false, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 204,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__["Alert"], {
                    severity: "error",
                    sx: {
                        mb: 2
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 209,
                    columnNumber: 11
                }, this),
                success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__["Alert"], {
                    severity: "success",
                    sx: {
                        mb: 2
                    },
                    children: success
                }, void 0, false, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 215,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        mt: 2
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            fullWidth: true,
                            label: "To (Email or Username)",
                            value: recipient,
                            onChange: (e)=>handleRecipientChange(e.target.value),
                            error: !!recipientError,
                            helperText: recipientError,
                            margin: "normal",
                            disabled: loading,
                            InputProps: {
                                endAdornment: recipientValidating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CircularProgress$2f$CircularProgress$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CircularProgress$3e$__["CircularProgress"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/app/compose/page.tsx",
                                    lineNumber: 233,
                                    columnNumber: 17
                                }, void 0) : recipientValid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$CheckCircle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    color: "success"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/compose/page.tsx",
                                    lineNumber: 235,
                                    columnNumber: 17
                                }, void 0) : recipientValid === false ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Error$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    color: "error"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/compose/page.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, void 0) : null
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 222,
                            columnNumber: 11
                        }, this),
                        recipientName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Chip$2f$Chip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Person$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/app/compose/page.tsx",
                                lineNumber: 244,
                                columnNumber: 21
                            }, void 0),
                            label: recipientName,
                            color: "primary",
                            variant: "outlined",
                            sx: {
                                mt: 1
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 243,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            fullWidth: true,
                            label: "Subject",
                            value: subject,
                            onChange: (e)=>setSubject(e.target.value),
                            error: !!subjectError,
                            helperText: subjectError,
                            margin: "normal",
                            disabled: loading
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 253,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            fullWidth: true,
                            label: "Message",
                            value: message,
                            onChange: (e)=>setMessage(e.target.value),
                            error: !!messageError,
                            helperText: messageError,
                            margin: "normal",
                            multiline: true,
                            rows: 8,
                            disabled: loading,
                            onKeyDown: handleKeyDown,
                            placeholder: "Type your message here... (Ctrl+Enter to send)"
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 265,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 220,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        mt: 4,
                        display: 'flex',
                        gap: 2
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "contained",
                            startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$esm$2f$Send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/app/compose/page.tsx",
                                lineNumber: 284,
                                columnNumber: 24
                            }, void 0),
                            onClick: handleSend,
                            disabled: loading || recipientValid !== true,
                            size: "large",
                            children: loading ? 'Sending...' : 'Send Message'
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 282,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            variant: "outlined",
                            onClick: ()=>router.push('/'),
                            disabled: loading,
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 292,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 281,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Box$2f$Box$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        mt: 4,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "subtitle2",
                            gutterBottom: true,
                            children: "🔒 Message Security"
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 303,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "body2",
                            color: "text.secondary",
                            children: "• Your message will be encrypted using the recipient's public key • Only the recipient can decrypt and read the message • Message integrity is verified using HMAC-SHA256 • The server cannot read your encrypted messages"
                        }, void 0, false, {
                            fileName: "[project]/src/app/compose/page.tsx",
                            lineNumber: 306,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/compose/page.tsx",
                    lineNumber: 302,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/compose/page.tsx",
            lineNumber: 200,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/compose/page.tsx",
        lineNumber: 199,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__3cb3b797._.js.map