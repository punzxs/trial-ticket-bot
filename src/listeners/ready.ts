import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type Bot from '../lib/structures/Client';

@ApplyOptions<Listener.Options>({
  event: Events.ClientReady,
  name: 'Client Ready',
})
export class ClientReadyListener extends Listener {
  public run(client: Bot) {
    this.container.logger.info(`Logged in as ${client.user?.tag}`);
  }
}
