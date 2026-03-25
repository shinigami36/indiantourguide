const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const VERSION = 'v1';

function deriveKey(masterKey) {
  if (!masterKey || typeof masterKey !== 'string') {
    throw new Error('ENC_MASTER_KEY is required');
  }
  return crypto.createHash('sha256').update(masterKey, 'utf8').digest();
}

function encryptSecret(plainText, masterKey) {
  if (typeof plainText !== 'string' || plainText.length === 0) {
    throw new Error('Plain text secret is required');
  }

  const key = deriveKey(masterKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return `enc:${VERSION}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

module.exports = { encryptSecret };

if (require.main === module) {
  const plainText = process.argv[2];

  if (!plainText) {
    console.error('Usage: ENC_MASTER_KEY="..." node tools/encrypt-secret.js "my-secret"');
    process.exit(1);
  }

  try {
    const encrypted = encryptSecret(plainText, process.env.ENC_MASTER_KEY);
    console.log(encrypted);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
