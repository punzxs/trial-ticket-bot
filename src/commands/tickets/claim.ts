import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
@ApplyOptions<Command.Options>({
  name: 'claim',
  description: 'Claim a ticket',
})
export class ClaimCommand extends Command {
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
    if (claimed)
      return interaction.reply({
        content: '> The ticket is already claimed.',
        ephemeral: true,
      });

    interaction.channel?.send(
      `> <@${interaction.user.id}> claimed the ticket.`
    );

    await this.container.db.claimTicket(channelId, interaction.user.id);
    return interaction.reply({
      ephemeral: true,
      content: 'Ticket claimed!',
    });
  }
}
