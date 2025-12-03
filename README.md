# All-in-One Full Bot (Spotify-only)

This repository is an **all-in-one** Discord bot scaffold modeled after features from Wick, Bloxlink (Discord verification), Reaction Roles bots, and Appy (application forms). It uses Spotify API for music metadata and plays **Spotify preview URLs only** (30s). **No YouTube playback.**

Included features:
- Slash command handler and event system
- Music: /play, /queue, /skip, /stop — uses Spotify `preview_url` where available (30s previews)
- Verification: /verify to give a configured role
- Reaction roles: /rr setup message -> add reaction-role mappings; reacts add/remove assign roles
- Application forms: /application create, /application add_dropdown, /application send, modal completion -> DM flows to applicant & staff review channel
- Giveaways scaffold (start/end giveaways using discord-giveaways)
- Stats logger: logs uptime, memory, ping periodically to configured channel
- Persistence: simple SQLite DB + JSON files for config
- Railway-ready: Procfile included. Use `.env` to configure keys.

Limitations & Notes:
- Spotify does not allow streaming of full tracks. The bot uses the `preview_url` provided by Spotify (usually 30 seconds). If a track has no preview, playback is not possible for that track.
- This is a scaffold. Customize commands, permissions, security checks, and DB usage to your needs.
- Make sure to fill `.env` before running and run `npm install`.

## Quick start
1. Copy `.env.example` → `.env` and fill values.
2. `npm install`
3. `npm run register` (to register slash commands; use GUILD_ID for rapid testing)
4. `npm start`

