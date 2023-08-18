import { Schema, model } from 'mongoose';

interface Tickets {
  ticketId: number;
  guildId: string;
  userId: string;
  created: number;
  channelId: string;
  claimedBy: string;
}

export default model(
  'tickets',
  new Schema<Tickets>({
    guildId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    created: {
      type: Number,
      required: true,
    },
    ticketId: {
      type: Number,
    },
    channelId: {
      type: String,
    },
    claimedBy: {
      type: String,
    },
  })
);
