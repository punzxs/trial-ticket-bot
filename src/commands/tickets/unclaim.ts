import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
@ApplyOptions<Command.Options>({
  name: 'unclaim',
  description: 'Unclaim a ticket',
})
export class UnclaimCommand extends Command {
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
    if (!interaction.memberPermissions?.has('Administrator'))
      return interaction.reply({
        content:
          '> Administrator permissions are required to execute this command.',
        ephemeral: true,
      });

    const channelId = interaction.channelId!;
    const isTicket = await this.container.db.findTicketById(channelId);
    if (!isTicket)
      return interaction.reply({
        content: '> The channel is not a ticket.',
        ephemeral: true,
      });

    const claimed = await this.container.db.alreadyClaimed(channelId);
    if (!claimed)
      return interaction.reply({
        content: '> The ticket is not claimed.',
        ephemeral: true,
      });

    const data = await this.container.db.getTicketData(channelId);
    if (data.claimedBy !== interaction.user.id)
      return interaction.reply({
        content: '> You did not claim this ticket.',
        ephemeral: true,
      });

    await this.container.db.claimTicket(channelId, null);

    interaction.channel?.send(
      `> <@${interaction.user.id}> unclaimed the ticket.`
    );
    return interaction.reply({
      ephemeral: true,
      content: 'Ticket unclaimed!',
    });
  }
}
