import {Client, Filter, Kind, KindStandard, Event, Timestamp, PublicKey, Duration, loadWasmAsync, Keys, SubscribeAutoCloseOptions} from "@rust-nostr/nostr-sdk";
import {relays, eventKinds} from "./constants";

export async function fetchAllEvents(setEvents: (events: any) => void) {
    await loadWasmAsync();

    let client = new Client();

    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get calendar events
    let filter1 = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).since(Timestamp.fromSecs(Date.now() / 1000 - 60 * 60 * 24 * 30)).limit(20); // last 30 days
    const events1 = await client.fetchEvents(filter1, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    setEvents(eventsVecJson);
}

export async function fetchUserEvents(pubkey: string, setEvents: (events: any) => void) {
    await loadWasmAsync();

    let client = new Client();

    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get calendar events
    let filter1 = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).author(PublicKey.parse(pubkey))
    const events1 = await client.fetchEvents(filter1, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);
    setEvents(eventsVecJson);
}
export function parseCalendarEvent(eventJson: any) {
    const parsed = {
        id: eventJson.id,
        pubkey: eventJson.pubkey,
        createdAt: eventJson.created_at,
        kind: eventJson.kind,
        content: eventJson.content,
        title: '',
        summary: '',
        start: null,
        end: null,
        d: "",
        location: '',
        image: '',
        hashtags: Array<any>(), // 't' tags can be repeated
    };

    const tagMap = new Map();
    for (const tag of eventJson.tags) {
        const [key, value] = tag;
        if (tagMap.has(key)) {
            const existing = tagMap.get(key);
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                tagMap.set(key, [existing, value]);
            }
        } else {
            tagMap.set(key, value);
        }
    }

    parsed.title = tagMap.get('title') || 'Untitled Event';
    parsed.summary = tagMap.get('summary') || parsed.content; // Fallback to content
    parsed.start = tagMap.get('start');
    parsed.end = tagMap.get('end');
    parsed.location = tagMap.get('location');
    parsed.image = tagMap.get('image');
    parsed.d = tagMap.get('d') || '';
    
    const hashtags = tagMap.get('t');
    if (hashtags) {
        parsed.hashtags = Array.isArray(hashtags) ? hashtags : [hashtags];
    }

    return parsed;
}
export function parseRSVPEvent(eventJson: any) {
    const parsed = {
        id: eventJson.id,
        pubkey: eventJson.pubkey,
        createdAt: eventJson.created_at,
        kind: eventJson.kind,
        content: eventJson.content,
        e: '',
        a: '',
        d: "",
        status: '',
        fb: '',
        p: ''
    };

    const tagMap = new Map();
    for (const tag of eventJson.tags) {
        const [key, value] = tag;
        if (tagMap.has(key)) {
            const existing = tagMap.get(key);
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                tagMap.set(key, [existing, value]);
            }
        } else {
            tagMap.set(key, value);
        }
    }

    parsed.e = tagMap.get('e') || '';
    parsed.a = tagMap.get('a') || ''; 
    parsed.status = tagMap.get('status') || '';
    parsed.fb = tagMap.get('fb') || '';
    parsed.p = tagMap.get('p') || '';
    parsed.d = tagMap.get('d') || '';

    return parsed;
}

export const getSHA256Hash = async (input: string) => {
  const textAsBuffer = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
  return hash;
};