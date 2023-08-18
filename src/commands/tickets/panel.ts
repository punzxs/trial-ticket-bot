import { Command, ChatInputCommand } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'panel',
  description: 'Send the tickets panel',
})
export class PanelCommand extends Command {
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
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Channel to send the ticket panel')
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

    const channel = interaction.options.getChannel('channel')!;
    const botMember = (await interaction.guild?.members.fetch())?.get(
      this.container.client.user!.id
    );

    const guildChannel = interaction.guild?.channels.cache.get(channel.id)!;

    if (!guildChannel.isTextBased())
      return interaction.reply({
        content: `> You need to provide a text channel.`,
        ephemeral: true,
      });

    if (!botMember?.permissionsIn(guildChannel).has('ViewChannel'))
      return interaction.reply({ content: '> I can not view the channel.' });

    if (!botMember.permissionsIn(guildChannel).has('SendMessages'))
      return interaction.reply({
        content: '> I can not send messages in the channel.',
      });

    const embed = new EmbedBuilder()
      .setColor('#abcdef')
      .setFooter({
        text: interaction.guild?.name!,
        iconURL: interaction.guild?.iconURL()!,
      })
      .setTitle('Create a ticket')
      .setThumbnail(interaction.guild?.iconURL()!)
      .setDescription(
        'You can create a ticket clicking the button to contact our team and get support.'
      );

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setLabel('Create ticket')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎟️')
        .setCustomId('create-ticket')
    );

    guildChannel.send({ embeds: [embed], components: [row] });
    return interaction.reply({
      content: 'Ticket panel has been sent successfully',
      ephemeral: true,
    });
  }
}
