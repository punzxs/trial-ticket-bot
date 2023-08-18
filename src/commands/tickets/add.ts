import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { TextChannel } from 'discord.js';
@ApplyOptions<Command.Options>({
  name: 'add',
  description: 'Add an user to the ticket',
})
export class AddCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
    });
  }

  public override registerApplicationCommands(
    registry: ChatInputCommand.Registry
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('The user to add')
              .setRequired(true)
          ),
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

    const user = interaction.options.getUser('user')!;
    const member = (await interaction.guild?.members.fetch())?.get(user.id);

    const isTicket = await this.container.db.findTicketById(
      interaction.channelId
    );
    if (!isTicket)
      return interaction.reply({
        content: '> The channel is not a ticket.',
        ephemeral: true,
      });

    if (user.bot)
      return interaction.reply({
        content: '> You can not add a bot.',
        ephemeral: true,
      });

    if (user.id === interaction.user.id)
      return interaction.reply({
        content: '> You can not add yourself.',
        ephemeral: true,
      });

    if (member?.permissions.has('Administrator'))
      return interaction.reply({
        ephemeral: true,
        content: '> The user is an administrator.',
      });

    if (member?.permissionsIn(interaction.channelId).has('ViewChannel'))
      return interaction.reply({
        content: `> The user is already in the channel.`,
        ephemeral: true,
      });

    (interaction.channel as TextChannel).edit({
      permissionOverwrites: [
        {
          id: user.id,
          allow: [
            'ViewChannel',
            'SendMessages',
            'ReadMessageHistory',
            'AttachFiles',
          ],
        },
      ],
    });

    return interaction.reply({
      content: `> <@${user.id}> has been added to the ticket by <@${interaction.user.id}>`,
    });
  }
}
