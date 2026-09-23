const { patterns } = require("./patterns");

function detectFormat(value) {
  if (/^[a-f0-9]+$/i.test(value)) return "hexadecimal";
  if (/^[A-Za-z0-9+/]+=*$/.test(value)) return "base64 or modular text";
  if (value.includes("$") || value.includes(":")) return "structured text";
  return "unknown";
}

function normalizeHash(input) {
  return input.replace(/\r\n/g, "\n").trim();
}

function identifyHash(input) {
  const hash = normalizeHash(input);
  const matches = patterns.filter((candidate) => candidate.pattern.test(hash)).map(({ name, mode, format, confidence, note }) => ({ name, mode, format, confidence, note }));
  const isAmbiguous = matches.length > 1 && matches.every((match) => match.confidence === "possible");

  return {
    inputLength: hash.length,
    format: detectFormat(hash),
    matches,
    ambiguous: isAmbiguous,
    message: hash.length === 0 ? "Enter a hash to begin." : matches.length === 0 ? "No supported pattern matched this input." : isAmbiguous ? "Several algorithms share this representation. The string alone cannot prove which one produced it." : "Pattern matched; verify the source format before using the result."
  };
}

function identifyBatch(inputs) {
  return inputs.map((input) => ({ hash: normalizeHash(input), ...identifyHash(input) }));
}

module.exports = { identifyHash, identifyBatch, detectFormat, normalizeHash };