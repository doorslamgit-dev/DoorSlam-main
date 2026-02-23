#!/usr/bin/env bash
# scripts/dev-start.sh — Start the full Doorslam dev environment
#
# Starts:
#   1. FastAPI AI Tutor backend (port 8000)
#   2. Vite frontend dev server  (port 5173, proxies /api/ai-tutor → 8000)
#
# Usage:
#   ./scripts/dev-start.sh          # start both servers
#   ./scripts/dev-start.sh --api    # start API only
#   ./scripts/dev-start.sh --vite   # start Vite only

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$REPO_ROOT/ai-tutor-api"
VENV_PYTHON="$API_DIR/venv/bin/python"
VENV_UVICORN="$API_DIR/venv/bin/uvicorn"

# Colours
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_PID=""

cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  [[ -n "$API_PID" ]] && kill "$API_PID" 2>/dev/null && echo "  Stopped FastAPI (PID $API_PID)"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ---------------------------------------------------------------------------
# Preflight checks
# ---------------------------------------------------------------------------
preflight() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}Node.js not found. Install Node v20+.${NC}" && exit 1
  fi

  if [[ ! -f "$VENV_PYTHON" ]]; then
    echo -e "${RED}Python venv not found at $API_DIR/venv${NC}"
    echo "  Run: cd $API_DIR && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt"
    exit 1
  fi

  if [[ ! -f "$API_DIR/.env" ]]; then
    echo -e "${RED}Missing $API_DIR/.env — copy from .env.example and fill in secrets.${NC}" && exit 1
  fi
}

# ---------------------------------------------------------------------------
# Start FastAPI
# ---------------------------------------------------------------------------
start_api() {
  echo -e "${GREEN}Starting AI Tutor API (port 8000)...${NC}"
  cd "$API_DIR"
  "$VENV_UVICORN" src.main:app --reload --port 8000 &
  API_PID=$!
  cd "$REPO_ROOT"

  # Wait for health check
  local tries=0
  while [[ $tries -lt 15 ]]; do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
      echo -e "${GREEN}  API ready — http://localhost:8000/health${NC}"
      return 0
    fi
    sleep 1
    tries=$((tries + 1))
  done
  echo -e "${RED}  API failed to start within 15s. Check logs above.${NC}"
  exit 1
}

# ---------------------------------------------------------------------------
# Start Vite
# ---------------------------------------------------------------------------
start_vite() {
  echo -e "${GREEN}Starting Vite dev server (port 5173)...${NC}"
  cd "$REPO_ROOT"
  npx vite --host
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
MODE="${1:-all}"

preflight

case "$MODE" in
  --api)
    start_api
    echo -e "${GREEN}API running. Press Ctrl+C to stop.${NC}"
    wait "$API_PID"
    ;;
  --vite)
    start_vite
    ;;
  *)
    start_api
    start_vite
    ;;
esac
