import { config } from 'dotenv';
import { container } from '@sapphire/framework';
config();

import Bot from './lib/structures/Client';
const main = async () => {
  const client = new Bot();
  try {
    await client.initialize();
  } catch (err) {
    container.logger.fatal(err);
    client.destroy();
    process.exit(1);
  }
};

main();
process.on('unhandledRejection', (error) => {
  container.logger.error(error);
});
