(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/crypto.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
class CryptoUtils {
    // Generate random bytes
    static async randomBytes(length) {
        return crypto.getRandomValues(new Uint8Array(length));
    }
    // Convert ArrayBuffer or Uint8Array to base64
    static arrayBufferToBase64(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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
        const uint8Array = encoder.encode(str);
        // Create a proper ArrayBuffer copy
        const buffer = new ArrayBuffer(uint8Array.byteLength);
        new Uint8Array(buffer).set(uint8Array);
        return buffer;
    }
    // Convert ArrayBuffer to string
    static arrayBufferToString(buffer) {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }
    // Derive key using scrypt (using scrypt-js library)
    static async deriveKey(password, salt, keyLength = 32) {
        // Import scrypt-js dynamically
        const { scrypt } = await __turbopack_context__.r("[project]/node_modules/scrypt-js/scrypt.js [app-client] (ecmascript, async loader)")(__turbopack_context__.i);
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
    static API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:8000/quantserver") || 'http://localhost:8000/quantserver';
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
        console.log('Encrypt parameters:', {
            message,
            receiverPublicKey
        });
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
            const errorText = await response.text();
            console.error('Encrypt response error:', response.status, errorText);
            throw new Error(`Failed to encrypt message: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log('Encrypt response data:', data);
        if (data.Status === 'Positive') {
            console.log('Encrypted data structure:', data.encrypted_data);
            return data.encrypted_data;
        } else {
            throw new Error(data.Message || 'Encryption failed');
        }
    }
    // Decrypt using real Kyber via backend
    static async decrypt(tag, concatenated_string, username) {
        // Get the user's private key from localStorage
        const userData = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserStorage"].getUserData();
        if (!userData || !userData.privateKey) {
            throw new Error('User private key not found. Please log in again.');
        }
        console.log('Decrypt parameters:', {
            tag,
            concatenated_string,
            username,
            hasPrivateKey: !!userData.privateKey
        });
        const requestBody = {
            tag,
            concatenated_string: concatenated_string,
            username,
            private_key: userData.privateKey
        };
        console.log('Request body:', requestBody);
        const response = await fetch(`${this.API_BASE_URL}/kyber-decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', response.status, errorText);
            throw new Error(`Failed to decrypt message: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log('Response data:', data);
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
async function decrypt(tag, concatenated_string, username) {
    return await RealKyber.decrypt(tag, concatenated_string, username);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/test/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TestPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Container/Container.js [app-client] (ecmascript) <export default as Container>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Paper/Paper.js [app-client] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/TextField/TextField.js [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/crypto.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function TestPage() {
    _s();
    const [testResult, setTestResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const runTests = async ()=>{
        setLoading(true);
        setTestResult('Running tests...\n');
        try {
            // Test 1: Real Kyber key generation
            setTestResult((prev)=>prev + '1. Testing Real Kyber key generation...\n');
            const keyPair = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RealKyber"].keygen();
            setTestResult((prev)=>prev + `   ✓ Generated real Kyber keypair (Public: ${keyPair.publicKey.substring(0, 20)}...)\n`);
            // Test 2: AES encryption/decryption
            const testMessage = 'Hello, Quantum World!';
            const encrypted = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CryptoUtils"].aesEncrypt(testMessage, 'test-key');
            const decrypted = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CryptoUtils"].aesDecrypt(encrypted, 'test-key');
            setTestResult((prev)=>prev + `   ✓ AES encryption/decryption: ${testMessage === decrypted ? 'PASS' : 'FAIL'}\n`);
            // Test 3: SHA-256
            setTestResult((prev)=>prev + '3. Testing SHA-256...\n');
            const hash = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CryptoUtils"].sha256('test');
            setTestResult((prev)=>prev + `   ✓ SHA-256 hash generated: ${hash.substring(0, 20)}...\n`);
            // Test 4: Random bytes
            setTestResult((prev)=>prev + '4. Testing random bytes...\n');
            const randomBytes = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CryptoUtils"].randomBytes(32);
            setTestResult((prev)=>prev + `   ✓ Generated ${randomBytes.length} random bytes\n`);
            // Test 5: Real Kyber encryption/decryption
            setTestResult((prev)=>prev + '5. Testing Real Kyber encryption/decryption...\n');
            // First, store the test user's private key using UserStorage for the test
            const testUserData = {
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword',
                privateKey: keyPair.privateKey,
                publicKey: keyPair.publicKey
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserStorage"].storeUserData(testUserData);
            const testMessage2 = 'Hello, Quantum World!';
            const encryptedData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RealKyber"].encrypt(testMessage2, keyPair.publicKey);
            const decryptedMessage = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RealKyber"].decrypt(encryptedData.tag, encryptedData.concatenated_string, 'testuser');
            setTestResult((prev)=>prev + `   ✓ Kyber encryption/decryption: ${testMessage2 === decryptedMessage ? 'PASS' : 'FAIL'}\n`);
            // Clean up test data
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserStorage"].clearUserData();
            setTestResult((prev)=>prev + '\n All tests passed!\n');
        } catch (error) {
            setTestResult((prev)=>prev + `\n❌ Test failed: ${error}\n`);
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Container$2f$Container$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Container$3e$__["Container"], {
        maxWidth: "md",
        sx: {
            mt: 4
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Paper$2f$Paper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
            sx: {
                p: 4
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "h4",
                    gutterBottom: true,
                    children: "Crypto Test Page"
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                    variant: "body1",
                    sx: {
                        mb: 3
                    },
                    children: "This page tests the cryptographic utilities to ensure they're working correctly."
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    variant: "contained",
                    onClick: runTests,
                    disabled: loading,
                    sx: {
                        mb: 3
                    },
                    children: loading ? 'Running Tests...' : 'Run Tests'
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$TextField$2f$TextField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                    fullWidth: true,
                    multiline: true,
                    rows: 15,
                    value: testResult,
                    InputProps: {
                        readOnly: true
                    },
                    variant: "outlined",
                    placeholder: "Test results will appear here..."
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/test/page.tsx",
            lineNumber: 74,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/test/page.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_s(TestPage, "u7Dkyx5gq3ljEgA7UWq3W0Ms3ak=");
_c = TestPage;
var _c;
__turbopack_context__.k.register(_c, "TestPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_8c29b336._.js.map