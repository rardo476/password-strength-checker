# ShieldCheck — Password Strength Checker

A privacy-first, interactive password strength checker and cryptographically secure password generator. Built using HTML, CSS, and JavaScript; no dependencies or backend.

## Features
- Live password strength meter and security checklist
- Show/hide password
- Random password generator using `crypto.getRandomValues` with rejection sampling
- Mobile-friendly interface
- No password transmission, analytics, local storage, or cookies

## Running locally
Open `index.html` in a browser. Clipboard copying works best over HTTPS (as on GitHub Pages) or localhost.

## GitHub Pages
Repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## Security notes and limitations
- The checker uses simple heuristics, **not** a professional password-cracking model or a guarantee of password security.
- Entropy is a rough character-set estimate and can significantly overestimate predictable, human-chosen passwords.
- Test with dummy passwords, not real account passwords.
- Passwords are processed only in browser memory, with no network calls, persistent storage, third-party scripts, or external fonts.
- The generator uses a cryptographically secure RNG with unbiased sampling and includes at least one character from each enabled character group.
- Clipboard contents may remain accessible to other applications after copying.
- GitHub Pages serves the static site via HTTPS; this does not protect against malicious browser extensions or compromised devices.

## Suggested manual tests
1. Empty password displays “Not tested”.
2. `password123` is very weak.
3. A long random generated password rates strong.
4. Show/hide works; strength updates as you type.
5. Generate changes password and respects length and selected options.
6. Copy works on GitHub Pages (HTTPS).
7. Layout works on a narrow mobile screen.
