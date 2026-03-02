// ============================================================
// config.js — Central configuration for WhatsApp Engineer
// ============================================================

const config = {
    // Path to Claude Code binary
    CLAUDE_BIN: process.env.CLAUDE_BIN || '/home/ubuntu/.local/bin/claude',

    // Gemini API
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',

    // Allowed phone numbers (with country code, no +)
    // Vedant: 919970870091, Kushal (Manager): 917304556268
    ALLOWED_PHONES: (process.env.ALLOWED_PHONES || '919970870091,917304556268').split(',').filter(Boolean),

    // Allowed WhatsApp group JIDs (format: 120363xxxxxxx@g.us)
    // Members of these groups can trigger the bot via @mention.
    // If empty, responds to @mentions in ANY group.
    ALLOWED_GROUPS: (process.env.ALLOWED_GROUPS || '120363423167249442@g.us').split(',').filter(Boolean),

    // Names people might use when @mentioning the bot in a group.
    // Add new aliases as team members save the contact under different names.
    BOT_ALIASES: (process.env.BOT_ALIASES || 'Koach,PLBot,8999489048,918999489048,Oliii').split(',').filter(Boolean),

    // Session defaults
    DEFAULT_WORKING_DIR: process.env.DEFAULT_WORKING_DIR || '/home/ubuntu',
    MAX_MESSAGE_LENGTH: 4000,
    CLAUDE_SESSION_TIMEOUT: 30 * 60 * 1000,

    // Knowledge Base
    GITHUB_KB_URL: process.env.GITHUB_KB_URL || '',
    KB_DIR: process.env.KB_DIR || './kb',

    // Paths
    AUTH_DIR: process.env.AUTH_DIR || './auth_info',
    DB_PATH: process.env.DB_PATH || './sessions.db',
    LOG_DIR: process.env.LOG_DIR || './logs',
};

export default config;
