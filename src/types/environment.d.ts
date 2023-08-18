export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DISCORD_TOKEN: string;
      readonly GUILD_ID: string;
      readonly MONGO_URI: string;
      readonly NODE_ENV: 'development' | 'production';
    }
  }
}
