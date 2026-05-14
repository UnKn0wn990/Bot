# Discord Bot

A modular Discord bot with self-contained "objects" (features).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in your `.env`:
- `BOT_TOKEN` — from [Discord Developer Portal](https://discord.com/developers/applications)
- `CLIENT_ID` — your bot's Application ID
- `GUILD_ID` — your server's ID (right-click server → Copy Server ID)

### 3. Discord bot permissions
In the Developer Portal, enable these **Privileged Gateway Intents**:
- Server Members Intent
- Voice States (auto-granted)

Bot needs these permissions in your server:
- Send Messages, Send Messages in Threads
- Connect, Speak (for voice)
- Manage Roles (to read role members)

### 4. Register slash commands
```bash
node deploy-commands.js
```

### 5. Start the bot
```bash
node index.js
```

---

## Objects

### 🔔 Summon
| Command | Description |
|---|---|
| `/setsummonmsg <message>` | Set the DM message sent when summoning |
| `/summon @user` | DM the target user with the summon message |

### 📞 The Call
| Command | Description |
|---|---|
| `/setcall <name>` | Create/edit a call (opens a form) |
| `/deletecall <name>` | Delete a call |
| `/listcalls` | List all configured calls |

A **call** watches for a role joining a VC, then DMs all members of another role.

### 🎙️ Stay
| Command | Description |
|---|---|
| `/stay <channel>` | Bot joins and stays in a voice channel |
| `/unstay` | Bot leaves the stayed channel |
| `/stayrole @role` | Set which role triggers audio |
| `/staysound <url>` | Set audio file URL (catbox.moe, GitHub raw, etc.) |
| `/staytts <message>` | Set TTS message |
| `/staymode sound\|tts` | Choose whether to play sound or TTS |

---

## Adding a New Object

1. Create `objects/yourobject/`
2. Add `commands.js` — export array of `{ data, execute }` objects
3. Add `events.js` — export array of `{ name, execute }` objects
4. Add `index.js` — export `{ commands, events }`

The loader picks it up automatically. No other files need to change.

---

## Data Storage

Settings are saved as JSON files in `data/`:
- `data/summon.json`
- `data/calls.json`
- `data/stay.json`
