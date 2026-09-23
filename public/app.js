const input = document.querySelector("#hash-input");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const count = document.querySelector("#char-count");
const resultCount = document.querySelector("#result-count");
const details = document.querySelector("#details");
const toast = document.querySelector("#toast");

function normalizeHash(rawInput) {
  return typeof rawInput === "string" ? rawInput.replace(/\r\n/g, "\n").trim() : "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function render(resultList) {
  resultList = Array.isArray(resultList) ? resultList : [];
  const totalMatches = resultList.reduce((total, result) => total + result.matches.length, 0);
  emptyState.hidden = resultList.length > 0;
  results.hidden = resultList.length === 0;
  resultCount.textContent = resultList.length ? `${resultList.length} HASH${resultList.length === 1 ? "" : "ES"}` : "NO MATCH";
  details.hidden = resultList.length !== 1;
  if (resultList.length === 1) {
    const result = resultList[0];
    document.querySelector("#detail-length").textContent = result.inputLength;
    document.querySelector("#detail-format").textContent = result.format;
    document.querySelector("#detail-message").textContent = result.message;
  }
  if (!resultList.length) {
    emptyState.innerHTML = '<div class="crosshair">?</div><p>No hashes found</p><span>Enter one or more non-empty lines to analyze.</span>';
  }
  results.innerHTML = resultList.map((result, index) => {
    const matches = result.matches;
    const matchMarkup = matches.length ? matches.map((match) => `<div class="candidate"><strong>${match.name}</strong><span class="confidence">${match.confidence}</span><button class="mode" type="button" data-mode="${match.mode}" title="Copy hashcat mode">-m ${match.mode}</button></div>`).join("") : '<p class="no-match">No supported pattern matched this hash.</p>';
    return `<article class="result batch-result" style="animation-delay:${index * 45}ms"><div class="hash-label">HASH ${String(index + 1).padStart(2, "0")}</div><code class="hash-value">${escapeHtml(result.hash)}</code><div class="candidate-list">${matchMarkup}</div><div class="result-meta"><span>${result.inputLength} chars · ${result.format}</span><span>${matches.length} candidate${matches.length === 1 ? "" : "s"}</span></div></article>`;
  }).join("");
  if (resultList.length > 1) document.querySelector("#detail-message").textContent = `${totalMatches} possible algorithm matches across ${resultList.length} hashes.`;
}

async function identify() {
  const hashes = input.value.split(/\r?\n/).map(normalizeHash).filter(Boolean);
  if (!hashes.length) { reset(); return; }
  resultCount.textContent = "ANALYZING...";
  try {
    const endpoint = hashes.length === 1 ? "/api/identify" : "/api/identify/batch";
    const body = hashes.length === 1 ? { hash: hashes[0] } : { hashes };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const payload = await response.json();
    const identified = hashes.length === 1 ? [payload] : payload.results;
    if (!Array.isArray(identified)) throw new Error("API returned an invalid result.");
    render(identified);
  } catch (error) {
    resultCount.textContent = "API UNAVAILABLE";
    showToast(error instanceof TypeError ? "Cannot connect to the API. Start the server with npm start." : error.message);
  }
}

function reset() {
  input.value = "";
  count.textContent = "0 characters";
  results.hidden = true;
  details.hidden = true;
  emptyState.hidden = false;
  emptyState.innerHTML = '<div class="crosshair">+</div><p>Awaiting a signature</p><span>Results will appear here after analysis.</span>';
  resultCount.textContent = "WAITING FOR INPUT";
}

input.addEventListener("input", () => { const hashes = input.value.split(/\r?\n/).map(normalizeHash).filter(Boolean); const length = hashes.reduce((total, hash) => total + hash.length, 0); count.textContent = hashes.length > 1 ? `${hashes.length} hashes · ${length} characters` : `${length} character${length === 1 ? "" : "s"}`; });
input.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") identify(); });
document.querySelector("#identify-button").addEventListener("click", identify);
document.querySelector("#clear-button").addEventListener("click", reset);
document.querySelector("#example-button").addEventListener("click", () => { input.value = "5d41402abc4b2a76b9719d911017c592"; input.dispatchEvent(new Event("input")); identify(); });
document.querySelector("#paste-button").addEventListener("click", async () => { try { input.value = await navigator.clipboard.readText(); input.dispatchEvent(new Event("input")); input.focus(); } catch { showToast("Clipboard permission was unavailable"); } });
results.addEventListener("click", async (event) => { const button = event.target.closest("[data-mode]"); if (!button) return; try { await navigator.clipboard.writeText(button.dataset.mode); showToast(`-m ${button.dataset.mode} copied`); } catch { showToast(`Hashcat mode: -m ${button.dataset.mode}`); } });