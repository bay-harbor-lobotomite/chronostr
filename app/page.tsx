'use client';
import {User} from "@heroui/user"
import SWHandler from 'smart-widget-handler'
import { useEffect, useState } from "react";
import {Tab, Tabs} from "@heroui/tabs";
import { fetchAllEvents, fetchUserEvents } from "@/lib/utils";
import CalendarEventList from "@/components/CalendarEventList";
import CreateCalendarEventForm from "@/components/CreateCalendarEventForm";

export default function Home() {
  const [user, setUser] = useState<any>()
  const [hostUri, setHostUri] = useState<string>("");
    useEffect(() => {
    SWHandler.client.ready();
        const listener = SWHandler.client.listen((e) => {
      console.log('Received message from parent:', e);
      
      if (e.kind === 'user-metadata') {
        setUser(e.data.user);
        setHostUri(e.data.host_origin)
      }
    });
    
    return () => listener.close();
  }, []);

  const publishNostrEvent = (event: any) => {
      if(hostUri){
        SWHandler.client.requestEventPublish(event, hostUri);
        return { success: true, eventId: event.id };
      }
  };
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <User 
      avatarProps={{
        src: user ? user.banner : ""
      }}
      name={user ? user.name : "Loading..."}
      description={user ? `${user.pubkey.slice(0, 8)}...${user.pubkey.slice(-4)}` : "Loading..."}
      />
      <Tabs aria-label="Options">
        <Tab key="View" title="View">
          <CalendarEventList fetcherFunction={fetchAllEvents} isUserView={false} loggedInUserPubkey={user? user.pubkey : ""} publishNostrEvent={publishNostrEvent}/>
        </Tab>
        <Tab key="Create" title="Create">
          <CreateCalendarEventForm publishNostrEvent={publishNostrEvent} pubkey={user? user.pubkey: ""}/>
        </Tab>
        <Tab key="My Events" title="My Events">
          <CalendarEventList fetcherFunction={fetchUserEvents} isUserView={true} loggedInUserPubkey={user? user.pubkey: ""} viewingPubkey={user ? user.pubkey : ""} publishNostrEvent={publishNostrEvent}/>
        </Tab>
      </Tabs>
    </section>
  );
}
