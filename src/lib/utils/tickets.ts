import { container } from '@sapphire/framework';
import {
  Interaction,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export const createTicket = async (interaction: Interaction) => {
  const channel = await interaction.guild?.channels.create({
    type: ChannelType.GuildText,
    name: `ticket-`,
    permissionOverwrites: [
      {
        id: interaction.user.id,
        allow: [
          'ViewChannel',
          'SendMessages',
          'ReadMessageHistory',
          'AttachFiles',
        ],
      },
      {
        id: interaction.guild.roles.everyone.id,
        deny: ['ViewChannel'],
      },
    ],
  })!;

  const data = await container.db.addTicket(
    interaction.guildId!,
    interaction.user.id,
    Date.now(),
    channel.id
  );

  channel.setName(`ticket-${data}`);

  const embed = new EmbedBuilder()
    .setColor('#abcdef')
    .setThumbnail(interaction.user.displayAvatarURL())
    .setAuthor({
      name: `${interaction.user.username}'s ticket`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(
      `Welcome <@${interaction.user.id}> to your ticket. The team will answer you as soon as possible.\n\nClick the button to close the ticket.`
    );

  const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
    new ButtonBuilder()
      .setCustomId('confirm-close-ticket')
      .setLabel('🔒')
      .setStyle(ButtonStyle.Secondary)
  );

  channel.send({
    embeds: [embed],
    components: [row],
    content: `<@${interaction.user.id}>`,
  });

  return channel;
};
