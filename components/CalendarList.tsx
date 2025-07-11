import React, { useState, useEffect } from 'react'
import { fetchAllEvents } from '@/lib/utils'
import { Event } from '@rust-nostr/nostr-sdk';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader
} from "@heroui/card";

import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { parseNostrEvent } from '@/lib/utils';
import { user } from '@heroui/theme';


const formatEventDate = (event: any) => {
    if (!event.start) return "Date not specified";

    // Kind 31923: Time-based event (Unix timestamp)
    if (event.kind === 31923) {
        const startDate = new Date(parseInt(event.start, 10) * 1000);
        return startDate.toLocaleString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    // Kind 31922: Date-based event (YYYY-MM-DD)
    if (event.kind === 31922) {
        return `All-day on ${event.start}`;
    }
    return "Invalid date";
};

const LocationIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="currentColor" />
    </svg>
);


const CalendarEventList = ({fetcherFunction, isUser, pubkey}: {fetcherFunction: any, isUser: boolean, pubkey? :string}) => {
    const [events, setEvents] = useState<any[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const loadAndParseEvents = async () => {
            try {
                if(!isUser)
                {
                    await fetcherFunction((rawEvents: any) => {
                        const parsed = rawEvents.map(parseNostrEvent);
                        setEvents(parsed);
                    });
                } else {
                    await fetcherFunction(pubkey, (rawEvents: any) => {
                        const parsed = rawEvents.map(parseNostrEvent);
                        setEvents(parsed);
                    });
                }
                } catch (err) {
                console.error("Failed during event fetch or processing:", err);
                setError("Could not retrieve or process events from relays.");
            } finally {
                setLoading(false);
            }
        };
        loadAndParseEvents();
    }, []);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner label="Contacting Nostr Relays..." color="primary" labelColor="primary" size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-danger-500 text-lg">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-bold mb-8 text-foreground">Upcoming Events</h1>
            {events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {events.map((event) => (
                        <Card shadow="lg" key={event.id} isHoverable isPressable className="w-full">
                             <CardHeader className="p-0">
                                <Image
                                    isZoomed
                                    removeWrapper
                                    alt={`Image for ${event.title}`}
                                    className="z-0 w-full h-[200px] object-cover"
                                    src={event.image || 'https://via.placeholder.com/400x200?text=No+Image'} // Placeholder
                                />
                            </CardHeader>
                            <CardBody className="p-6">
                                <p className="text-primary font-semibold text-sm mb-2">
                                    {formatEventDate(event)}
                                </p>
                                <h3 className="font-bold text-xl text-foreground mb-2 truncate" title={event.title}>
                                    {event.title}
                                </h3>
                                <p className="text-default-600 text-sm line-clamp-3">
                                    {event.summary}
                                </p>
                            </CardBody>
                            <Divider />
                            <CardFooter className="flex-col items-start p-6">
                                {event.location && (
                                    <div className="flex items-center text-sm text-default-500 mb-4">
                                        <LocationIcon className="mr-2" />
                                        <span>{event.location}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {event.hashtags.map((tag : any, index: any) => (
                                        <Chip key={index} color="default" variant="flat" size="sm">
                                            #{tag}
                                        </Chip>
                                    ))}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No Events Found</h2>
                    <p className="text-default-500 mt-2">There are no calendar events on the connected relays. Why not create one?</p>
                </div>
            )}
        </div>
    );
};

export default CalendarEventList;
