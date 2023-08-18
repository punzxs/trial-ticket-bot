import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from '@sapphire/framework';
import {
  ButtonInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  Interaction,
  type TextChannel,
} from 'discord.js';
import { createTicket } from '../lib/utils/tickets';

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.deferUpdate().catch(() => {});

    if (interaction.customId === 'create-ticket') {
      const ticket = await createTicket(interaction);
      interaction.followUp({
        content: `Ticket created! <#${ticket.id}>`,
        ephemeral: true,
      });
    } else if (interaction.customId === 'confirm-close-ticket') {
      const embed = new EmbedBuilder()
        .setColor('#abcdef')
        .setDescription(
          `<@${interaction.user.id}>, are you sure to close the ticket?`
        )
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        });

      const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('close-ticket')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔒')
      );

      const msg = await interaction.followUp({
        embeds: [embed],
        components: [row],
      });
      const collector = msg.createMessageComponentCollector({
        filter: (u: Interaction) => u.user.id === interaction.user.id,
        idle: 1000 * 60,
      });

      collector.on('collect', async (int: ButtonInteraction) => {
        if (int.customId === 'close-ticket') {
          const data = await this.container.db.getTicketData(
            interaction.channelId
          );

          const embed = new EmbedBuilder()
            .setColor('#abcdef')
            .setDescription(
              `The ticket has been closed by <@${interaction.user.id}>`
            )
            .addFields({
              name: 'Ticket Information',
              value: `> **ID:** ${data.ticketId.toLocaleString()}\n> **Created:** <t:${Math.floor(
                data.created / 1000
              )}:F>\n> **User:** <@${data.userId}>\n> **Claimed by:** <@${
                data.claimedBy! ?? 'Nobody'
              }>`,
            })
            .setTimestamp();

          const channel = int.guild?.channels.cache.get(
            int.channelId
          ) as TextChannel;
          const members = channel?.members;

          members.forEach((member) => {
            channel.edit({
              permissionOverwrites: [
                {
                  id: member.id,
                  deny: ['ViewChannel'],
                },
                {
                  id: int.guild?.roles.everyone.id!,
                  deny: ['ViewChannel'],
                },
              ],
            });
          });

          const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setLabel('Delete ticket')
              .setStyle(ButtonStyle.Secondary)
              .setCustomId('confirm-delete-ticket')
              .setEmoji('❌')
          );

          int.channel?.send({
            embeds: [embed],
            components: [row],
          });

          msg!.delete()!;
          collector.stop();
        }
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          msg!.delete()!;
        }
      });
    } else if (interaction.customId === 'confirm-delete-ticket') {
      const embed = new EmbedBuilder()
        .setColor('#abcdef')
        .setDescription(
          `<@${interaction.user.id}>, are you sure to delete the ticket?`
        )
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        });

      const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('delete-ticket')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❌')
      );

      const msg = await interaction.followUp({
        embeds: [embed],
        components: [row],
      });

      const collector = msg.createMessageComponentCollector({
        filter: (u: Interaction) => u.user.id === interaction.user.id,
        idle: 1000 * 60,
      });

      collector.on('collect', async (inn: ButtonInteraction) => {
        if (inn.customId === 'delete-ticket') {
          const embed = new EmbedBuilder()
            .setColor('#abcdef')
            .setDescription(`Deleting the ticket in 5 seconds...`)
            .setAuthor({
              name: inn.user.username,
              iconURL: inn.user.displayAvatarURL(),
            });

          inn.reply({ embeds: [embed] });
          setTimeout(() => {
            inn.channel!.delete()!;
            collector.stop();
          }, 1000 * 5);
        }
      });

      collector.on('end', (_collected, reason) => {
        if (reason === 'idle') {
          msg!.delete()!;
        }
      });
    }
  }
}
