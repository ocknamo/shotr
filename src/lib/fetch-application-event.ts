import { type Event, SimplePool } from "nostr-tools";

export interface FetchConfig {
  pool: SimplePool;
  relays: string[];
  appKind: number;
  yourPubkey: string;
  tagKey: string;
  timeoutSec: number;
}

export function fetchApplicationEvent(
  contentId: string,
  config: FetchConfig,
): Promise<Event | null> {
  const { pool, relays, appKind, yourPubkey, tagKey, timeoutSec } = config;
  const sub = pool.sub(relays, [
    {
      kinds: [appKind],
      authors: [yourPubkey],
      [`#${tagKey}` as any]: [contentId],
    },
  ]);

  return new Promise<Event | null>((resolve, reject) => {
    sub.on("event", (event) => {
      if (!!event) {
        resolve(event);
      }
      sub.close();
    });

    setTimeout(() => {
      resolve(null);
    }, timeoutSec * 1000);
  });
}
