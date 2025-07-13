import React, { useState, useEffect } from 'react';
import {
    fetchUserCalendars,
    fetchEventsForCalendar,
    parseCalendarEvent,
    parseCalendarListEvent
} from '@/lib/fetchers';
import {
    Card,
    CardBody,
    CardHeader
} from "@heroui/card";
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { User } from "@heroui/user";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Tooltip } from "@heroui/tooltip";
import { formatEventDate, getAvatarUrl } from '@/lib/utils';


interface UserCalendarsListProps {
    loggedInUserPubkey: string;
}

const LocationIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="currentColor" />
    </svg>
);

const UserCalendarsList = ({ loggedInUserPubkey }: UserCalendarsListProps) => {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [selectedCalendar, setSelectedCalendar] = useState<any | null>(null);
    const [eventsInCalendar, setEventsInCalendar] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch the list of calendars on component mount
    useEffect(() => {
        const loadCalendars = async () => {
            if (!loggedInUserPubkey) return;
            try {
                setLoading(true);
                await fetchUserCalendars(loggedInUserPubkey, (rawEvents) => {
                    const parsed = rawEvents.map(parseCalendarListEvent);
                    console.log(parsed);
                    setCalendars(parsed);
                });
            } catch (err) {
                console.error("Failed to fetch calendars:", err);
                setError("Could not retrieve your calendars.");
            } finally {
                setLoading(false);
            }
        };
        loadCalendars();
    }, [loggedInUserPubkey]);

    useEffect(() => {
        const loadEvents = async () => {
            if (!selectedCalendar) return;

            try {
                setIsLoadingDetails(true);
                setEventsInCalendar([]);
                await fetchEventsForCalendar(selectedCalendar, (rawEvents) => {
                    const parsed = rawEvents.map(parseCalendarEvent);
                    console.log(parsed)
                    setEventsInCalendar(parsed);
                });
            } catch (err) {
                console.error("Failed to fetch events for calendar:", err);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        loadEvents();
    }, [selectedCalendar]);


    const handleCalendarPress = (calendar: any) => {
        setSelectedCalendar(calendar);
        onOpen();
    };
    
    if (loading) {
        return (
            <div className="flex flex-col items-center p-8">
                <Spinner label="Loading Your Calendars..." color="primary" />
            </div>
        );
    }

    return (
        <>
            <Card className="max-w-screen w-full mx-auto" shadow="lg">
                <CardHeader className="p-6">
                    <h2 className="text-2xl font-bold text-foreground w-full text-center">My Calendars</h2>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                    {error && <p className="text-danger text-center">{error}</p>}
                    {calendars.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {calendars.map(cal => (
                                <Card isPressable isHoverable key={cal.id} onPress={() => handleCalendarPress(cal)}>
                                    <CardBody className="text-center justify-center">
                                        <p className="font-semibold text-foreground">{cal.title}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-default-500 text-center">You haven't created any calendars yet.</p>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(close) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-2xl font-bold">
                                {selectedCalendar?.title}
                            </ModalHeader>
                            <ModalBody>
                                {isLoadingDetails ? (
                                    <div className="flex justify-center items-center h-64">
                                        <Spinner label="Loading calendar events..." />
                                    </div>
                                ) : (
                                    <Accordion selectionMode="multiple" variant="splitted">
                                        {eventsInCalendar.map(event => (
                                            <AccordionItem key={event.id} aria-label={event.title} title={event.title}>
                                                <div className="flex flex-col gap-4 p-2">
                                                    <p className="text-primary font-semibold">{formatEventDate(event)}</p>
                                                    <p className="text-default-700">{event.summary}</p>
                                                    {event.location && (
                                                        <div className="flex items-center text-sm text-default-500">
                                                            <LocationIcon className="mr-2" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-2">
                                                        {event.hashtags.map((tag: any, index: any) => (
                                                            <Chip key={index} color="default" variant="flat" size="sm">#{tag}</Chip>
                                                        ))}
                                                    </div>
                                                    {event.participants && event.participants.length > 0 && (
                                                        <>
                                                            <Divider className="my-2" />
                                                            <h4 className="font-semibold text-foreground">Participants</h4>
                                                            <div className="flex flex-col gap-3">
                                                                {event.participants.map((p: any) => (
                                                                    <User key={p.pubkey} name={p.pubkey.substring(0, 10) + '...'} description={p.role || 'Attendee'} avatarProps={{ src: getAvatarUrl(p.pubkey) }}/>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={close}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default UserCalendarsList;