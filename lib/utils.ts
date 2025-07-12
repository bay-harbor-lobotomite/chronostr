import {Client, Filter, Kind, KindStandard, Event, EventId, Timestamp, PublicKey, Duration, loadWasmAsync, Keys, SubscribeAutoCloseOptions, SingleLetterTag, Alphabet} from "@rust-nostr/nostr-sdk";
import {relays, eventKinds, rsvpKind} from "./constants";


export async function fetchRSVPs(eventId: string, callback: any) {
    await loadWasmAsync();
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();

    //get rsvps
    const tg = SingleLetterTag.lowercase(Alphabet.E);
    let filter = new Filter().kind(new Kind(rsvpKind)).customTag(tg, eventId)
    const events1 = await client.fetchEvents(filter, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);
    callback(eventsVecJson);
}

export async function fetchUserRSVPEvents(pubkey: string, callback: any) {
    await loadWasmAsync();  
    let client = new Client();
    for (const relay of relays) {
        await client.addRelay(relay)
    }
    await client.connect();
    //get rsvps
    let filterRsvp = new Filter().kind(new Kind(rsvpKind)).author(PublicKey.parse(pubkey))
    const events1 = await client.fetchEvents(filterRsvp, Duration.fromSecs(10));
    let eventsVec = events1.toVec();
    let eventsVecJson = eventsVec.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson);

    //now fetch the events for which the user has RSVPed
    let parsedRsvpEvents = eventsVecJson.map((event) => parseRSVPEvent(event));
    let filterEvents = new Filter().kinds(eventKinds.map((kind) => new Kind(kind))).ids(parsedRsvpEvents.map((rsvp) => EventId.parse(rsvp.e)));
    const events2 = await client.fetchEvents(filterEvents, Duration.fromSecs(10));
    let eventsVec2 = events2.toVec();
    let eventsVecJson2 = eventsVec2.map((event) => JSON.parse(event.asJson()))
    console.log(eventsVecJson2);
    callback(eventsVecJson2)
}

export async function fetchAllEvents(callback: (events: any) => void) {
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
    callback(eventsVecJson);
}

export async function fetchUserEvents(pubkey: string, callback: (events: any) => void) {
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
    callback(eventsVecJson);
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