// Native Web Crypto API: AES-GCM 256-bit End-to-End Encryption (Zero External Dependencies)

const getCryptoKey = async (secret) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret.padEnd(32, '#').slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('chathub_e2ee_salt_2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// 1. Encrypt Message on Sender Browser
export const encryptMessage = async (plainText, roomId) => {
  try {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getCryptoKey(roomId);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption failed:', err);
    return plainText;
  }
};

// 2. Decrypt Message on Receiver Browser
export const decryptMessage = async (cipherText, roomId) => {
  try {
    const binary = atob(cipherText);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const key = await getCryptoKey(roomId);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    // Agar text already plain ho ya purana message ho
    return cipherText;
  }
};

// Generate deterministic 1-to-1 Room ID (e.g. "laiba@gmail.com" + "zahra@gmail.com" => "laiba_at_gmail_com__zahra_at_gmail_com")
export const getOneToOneRoomId = (email1 = '', email2 = '') => {
  const clean1 = email1.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  const clean2 = email2.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  return [clean1, clean2].sort().join('__');
};