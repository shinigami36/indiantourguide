const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const VERSION = 'v1';

function deriveKey(masterKey) {
  if (!masterKey || typeof masterKey !== 'string') {
    throw new Error('ENC_MASTER_KEY is required');
  }
  return crypto.createHash('sha256').update(masterKey, 'utf8').digest();
}

function decryptSecret(payload, masterKey) {
  if (!payload || typeof payload !== 'string') {
    throw new Error('Encrypted payload is required');
  }

  const parts = payload.split(':');
  if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== VERSION) {
    throw new Error('Invalid encrypted payload format');
  }

  const [, , ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(dataB64, 'base64');

  const key = deriveKey(masterKey);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const plainBuffer = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return plainBuffer.toString('utf8');
}

module.exports = { decryptSecret };

if (require.main === module) {
  const payload = process.argv[2];

  if (!payload) {
    console.error('Usage: ENC_MASTER_KEY="..." node tools/decrypt-secret.js "enc:v1:..."');
    process.exit(1);
  }

  try {
    const plain = decryptSecret(payload, process.env.ENC_MASTER_KEY);
    console.log(plain);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
