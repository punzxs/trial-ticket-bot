import tickets from '../models/tickets';
import { connect } from 'mongoose';

export default class Database {
  public connect(uri: string) {
    connect(uri).then(() => console.log('Connected to the database!'));
  }

  async addTicket(
    guildId: string,
    userId: string,
    date: number,
    channelId: string
  ): Promise<number> {
    const data = await tickets.find().sort({ _id: -1 })!;
    const id = data?.length! > 0 ? data![0]?.ticketId! + 1 : 1;

    await tickets.create({
      guildId: guildId,
      userId: userId,
      created: date,
      ticketId: id,
      channelId: channelId,
    });

    return id;
  }

  async findTicketById(id: string): Promise<boolean> {
    const data = await tickets.findOne({
      channelId: id,
    });

    if (data) return true;
    else return false;
  }

  async getTicketData(channelId: string): Promise<any> {
    const data = await tickets
      .findOne({
        channelId: channelId,
      })
      .lean();

    return data;
  }

  async claimTicket(channelId: string, userId: string | null) {
    await tickets.findOneAndUpdate(
      {
        channelId: channelId,
      },
      {
        claimedBy: userId,
      }
    );
  }

  async alreadyClaimed(channelId: string) {
    const data = await this.getTicketData(channelId);
    if (data.claimedBy!) return true;
    else return false;
  }
}
