// This file is overwritten at deploy time by .github/workflows/deploy.yml,
// which injects ANTHROPIC_API_KEY from the repo's GitHub Actions secrets.
// Locally (and until a deploy runs) this is empty and the Ask tab will show
// an "unavailable" message.
window.ANTHROPIC_API_KEY = '';
