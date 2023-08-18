import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { createTicket } from '../../lib/utils/tickets';

@ApplyOptions<Command.Options>({
  name: 'new',
  description: 'Create a ticket',
})
export class NewCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      {
        guildIds:
          process.env.NODE_ENV === 'development' ? [process.env.GUILD_ID!] : [],
      }
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const ticket = await createTicket(interaction);
    interaction.reply({
      content: `Ticket created! <#${ticket.id}>`,
      ephemeral: true,
    });
  }
}
