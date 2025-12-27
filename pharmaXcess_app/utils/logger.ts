import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE = `${FileSystem.cacheDirectory}download_debug.log`;

async function appendLog(line: string) {
  try {
    const ts = new Date().toISOString();
    const entry = `[${ts}] ${line}\n`;

    const info = await FileSystem.getInfoAsync(LOG_FILE);
    if (info.exists) {
      const prev = await FileSystem.readAsStringAsync(LOG_FILE, { encoding: FileSystem.EncodingType.UTF8 });
      await FileSystem.writeAsStringAsync(LOG_FILE, prev + entry, { encoding: FileSystem.EncodingType.UTF8 });
    } else {
      await FileSystem.writeAsStringAsync(LOG_FILE, entry, { encoding: FileSystem.EncodingType.UTF8 });
    }
  } catch (e) {
    // if logging to file fails, swallow to avoid noisy console output
    // (we intentionally avoid console.* here to keep runtime clean)
  }
}

export default {
  append: async (msg: string) => {
    await appendLog(msg);
  },
  path: LOG_FILE,
};
