'use client';
import {User} from "@heroui/user"
import SWHandler from 'smart-widget-handler'
import { useEffect, useState } from "react";
import {Tab, Tabs} from "@heroui/tabs";
import { fetchAllEvents, fetchUserEvents } from "@/lib/utils";
import CalendarEventList from "@/components/CalendarEventList";
import CreateCalendarEventForm from "@/components/CreateCalendarEventForm";
import Calendars from "@/components/Calendars";

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
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 max-w-screen">
      <User 
      avatarProps={{
        src: user ? user.banner : ""
      }}
      name={user ? user.name : "Loading..."}
      description={user ? `${user.pubkey.slice(0, 8)}...${user.pubkey.slice(-4)}` : "Loading..."}
      />
      <Tabs aria-label="Options" size="sm" className="max-w-screen">
        <Tab key="Explore" title="Explore">
          <CalendarEventList isUserView={false} loggedInUserPubkey={user? user.pubkey : ""} publishNostrEvent={publishNostrEvent}/>
        </Tab>
        <Tab key="Events/RSVPs" title="Events/RSVPs">
          <CalendarEventList isUserView={true} loggedInUserPubkey={user? user.pubkey: ""} viewingPubkey={user ? user.pubkey : ""} publishNostrEvent={publishNostrEvent}/>
        </Tab>
        <Tab key="Create Events" title="+ Events">
          <CreateCalendarEventForm publishNostrEvent={publishNostrEvent} pubkey={user? user.pubkey: ""}/>
        </Tab>
        <Tab key="Create Calendar" title="+ Calendar">
          <Calendars loggedInUserPubkey={user? user.pubkey: ""} publishNostrEvent={publishNostrEvent} />
        </Tab>
      </Tabs>
    </section>
  );
}
