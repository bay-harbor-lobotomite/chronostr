# Chronostr: An NIP 52 MiniApp

**Chronostr** is a YakiHonne miniapp that reimagines event scheduling and discovery through the power of the Nostr protocol. It provides a censorship-resistant, decentralized platform where users can create, share, discover, and RSVP to events without relying on a central server.
This project leverages Nostr's NIP-52 for calendar events.

## Features

-   **Decentralized Event Feed:** Discover public events posted by users across the Nostr network.
-   **Seamless Event Creation:** An intuitive form to create two types of calendar events as defined by NIP-52:
    -   **Time-based Events:** For occurrences at a specific date and time (e.g., meetings, parties).
    -   **Date-based Events:** For all-day or multi-day occasions (e.g., conferences, vacations).
-   **Interactive RSVP System:** Attend, decline, or mark yourself as tentative for any public event. All RSVPs are themselves Nostr events, making them open and verifiable.
-   **Personal Event Dashboard:** A dedicated view for users to see a list of all the events they have created.
-   **Attendee Management:** Event organizers can instantly view a list of all RSVPs and their statuses directly from the event card.

## Tech Stack

-   **Framework:** React/ Next.js
-   **UI Library:** NextUI
-   **Styling:** Tailwind CSS
-   **Nostr Integration:** smart-widget-handler from YakiHonne, @rust-nostr/nostr-sdk (via WebAssembly)
-   **Language:** TypeScript

## Usage Flow

The application is designed around two primary user journeys: the **Event Attendee** and the **Event Organizer**.

### 1. As an Event Attendee

1.  **Discover:** The user opens the application and is immediately presented with a grid of upcoming public events fetched from various Nostr relays.
2.  **Explore:** They click on an event card that looks interesting. A modal window appears, showing rich details like the event image, full description, date, time, and location.
3.  **RSVP:** If the user is not the event's creator, they see buttons to respond. They click **"Accept"**.
4.  **Confirm:** A Nostr event of `kind: 31925` (RSVP) is created, signed, and published to the network. The UI provides instant feedback on the successful RSVP.

### 2. As an Event Organizer

1.  **Create:** The user navigates to the "Create Event" page. They fill out the form, choosing between a time-based or date-based event and providing details like a title, summary, image URL, and location.
2.  **Publish:** Upon hitting "Create Event," a Nostr event of `kind: 31922` or `kind: 31923` is created, signed, and published.
3.  **Manage:** The user can visit the "My Events" page to see a list of events they have created.
4.  **View RSVPs:** They click on one of their events. In the modal footer, they see a **"View RSVPs"** button. Clicking this opens a popover that fetches all RSVPs for that event and displays a scrollable list of attendees and their statuses.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18.x or later)
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/chronostr.git
    cd chronostr
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
