type LogChannel =
  | 'app'
  | 'config'
  | 'loot'
  | 'reward'
  | 'combat'
  | 'stage'
  | 'train'
  | 'ad'
  | 'save';

type LogSink = (level: 'info' | 'warn' | 'error', channel: LogChannel, message: string, data?: unknown) => void;

let sink: LogSink = (level, channel, message, data) => {
  const prefix = `[${level}] ${channel}: ${message}`;
  if (level === 'error') {
    console.error(prefix, data ?? '');
    return;
  }

  if (level === 'warn') {
    console.warn(prefix, data ?? '');
    return;
  }

  console.info(prefix, data ?? '');
};

export const Log = {
  setSink(nextSink: LogSink): void {
    sink = nextSink;
  },

  info(channel: LogChannel, message: string, data?: unknown): void {
    sink('info', channel, message, data);
  },

  warn(channel: LogChannel, message: string, data?: unknown): void {
    sink('warn', channel, message, data);
  },

  error(channel: LogChannel, message: string, data?: unknown): void {
    sink('error', channel, message, data);
  },
};
