const patterns = [
  { name: "bcrypt", mode: 3200, format: "bcrypt modular crypt", pattern: /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, confidence: "high", note: "Recognized by the $2a$, $2b$, or $2y$ prefix." },
  { name: "Argon2", mode: 34000, format: "Argon2 modular format", pattern: /^\$argon2(id|i|d)\$[^$]+\$[^$]+\$[^$]+\$[^$]+$/, confidence: "high", note: "Recognized by the Argon2 prefix and parameter structure." },
  { name: "scrypt", mode: 8900, format: "scrypt modular format", pattern: /^\$scrypt\$[^$]+\$[^$]+\$[^$]+\$[^$]+$/, confidence: "high", note: "Recognized by the scrypt prefix and parameter structure." },
  { name: "md5crypt", mode: 500, format: "md5crypt modular format", pattern: /^\$1\$[./A-Za-z0-9]{0,8}\$[./A-Za-z0-9]{22}$/, confidence: "high", note: "Recognized by the $1$ prefix." },
  { name: "sha512crypt", mode: 1800, format: "sha512crypt modular format", pattern: /^\$6\$[^$]+\$[./A-Za-z0-9]{86}$/, confidence: "high", note: "Recognized by the $6$ prefix." },
  { name: "WPA-PBKDF2-PMKID+EAPOL", mode: 22000, format: "hashcat hc22000", pattern: /^[a-f0-9]{32}\*[a-f0-9]{32}\*[a-f0-9]{12}\*[a-f0-9]{2,}$/i, confidence: "high", note: "Looks like a hashcat WPA PMKID/EAPOL line." },
  { name: "NetNTLMv2", mode: 5600, format: "challenge-response", pattern: /^[^:]+::[^:]*:[a-f0-9]{16}:[a-f0-9]{32}:[a-f0-9]+$/i, confidence: "high", note: "Recognized as a NetNTLMv2 challenge-response line." },
  { name: "MD4", mode: 900, format: "hexadecimal", pattern: /^[a-f0-9]{32}$/i, confidence: "possible", note: "32 hexadecimal characters; indistinguishable from MD5 or NTLM by shape alone." },
  { name: "MD5", mode: 0, format: "hexadecimal", pattern: /^[a-f0-9]{32}$/i, confidence: "possible", note: "32 hexadecimal characters; indistinguishable from MD4 or NTLM by shape alone." },
  { name: "NTLM", mode: 1000, format: "hexadecimal", pattern: /^[a-f0-9]{32}$/i, confidence: "possible", note: "32 hexadecimal characters; indistinguishable from MD4 or MD5 by shape alone." },
  { name: "SHA-1", mode: 100, format: "hexadecimal", pattern: /^[a-f0-9]{40}$/i, confidence: "high", note: "40 hexadecimal characters." },
  { name: "SHA-224", mode: 1300, format: "hexadecimal", pattern: /^[a-f0-9]{56}$/i, confidence: "high", note: "56 hexadecimal characters." },
  { name: "SHA-256", mode: 1400, format: "hexadecimal", pattern: /^[a-f0-9]{64}$/i, confidence: "high", note: "64 hexadecimal characters." },
  { name: "SHA-384", mode: 10800, format: "hexadecimal", pattern: /^[a-f0-9]{96}$/i, confidence: "high", note: "96 hexadecimal characters." },
  { name: "SHA-512", mode: 1700, format: "hexadecimal", pattern: /^[a-f0-9]{128}$/i, confidence: "high", note: "128 hexadecimal characters." },
  { name: "DEScrypt", mode: 1500, format: "Unix DES crypt", pattern: /^[./0-9A-Za-z]{13}$/, confidence: "possible", note: "13-character Unix crypt candidate; short formats can be ambiguous." }
];

module.exports = { patterns };