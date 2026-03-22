FROM node:22-slim

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install test utilities (grep, coreutils for standard bash tools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends grep coreutils bash && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy skill files (the ClauseGuard skill definition and references)
COPY .claude/ .claude/

# Copy test files (contracts, expected markers, runner scripts)
COPY tests/ tests/

# Ensure scripts are executable
RUN chmod +x tests/run-tests.sh tests/validate.sh

# API key must be provided at runtime:
#   docker run -e ANTHROPIC_API_KEY=sk-... clauseguard-tests
# Or via docker-compose with .env file
CMD ["bash", "tests/run-tests.sh"]
