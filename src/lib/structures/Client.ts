import { SapphireClient, container } from '@sapphire/framework';
import { ActivityType } from 'discord.js';
import { join } from 'path';
import Database from './Database';

export default class Bot extends SapphireClient {
  constructor() {
    super({
      intents: ['Guilds', 'GuildMembers'],
      presence: {
        status: 'dnd',
        activities: [
          {
            name: 'Development',
            type: ActivityType.Listening,
          },
        ],
      },
      baseUserDirectory: join(__dirname, '..', '..'),
    });
    container.db = new Database();
  }

  public async initialize() {
    await this.login();
    container.db.connect(process.env.MONGO_URI!);
  }
}

// Extending container to add database variable
declare module '@sapphire/pieces' {
  interface Container {
    db: Database;
  }
}
