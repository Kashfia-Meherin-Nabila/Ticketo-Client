"use client";

import { Button, Card } from "@heroui/react";
// import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaMapPin, FaUserSecret } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import { TiTicket } from "react-icons/ti";

const EventCard = ({ event }) => {
  const router = useRouter();

  return (
    <Card
      className="
        overflow-hidden
        bg-slate-900/60
        border border-white/10
        backdrop-blur-xl
        hover:border-indigo-500/40
        transition-all
        duration-300
        hover:-translate-y-1
        shadow-xl
      "
    >
      {/* IMAGE */}

      <div className="relative">
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-52 object-cover"
        />

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-semibold">
            {event.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold capitalize">
            {event.status}
          </span>
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">

        <h3 className="text-xl font-bold text-white line-clamp-1">
          {event.title}
        </h3>

        <div className="mt-4 space-y-3">

          {/* DATE */}

          <div className="flex items-center gap-3 text-sm">
            <FaCalendarDays
              size={17}
              className="text-indigo-400 shrink-0"
            />

            <span className="text-slate-300">
              {event.date}
            </span>
          </div>

          {/* LOCATION */}

          <div className="flex items-center gap-3 text-sm">
            <FaMapPin
              size={17}
              className="text-indigo-400 shrink-0"
            />

            <span className="text-slate-300 line-clamp-1">
              {event.location}
            </span>
          </div>

          {/* TICKET */}

          <div className="flex items-center gap-3 text-sm">
            <TiTicket
              size={17}
              className="text-indigo-400 shrink-0"
            />

            <span className="text-slate-300">
              {Number(event.ticketPrice) === 0
                ? "Free"
                : `৳${event.ticketPrice}`}
            </span>
          </div>

          {/* SEATS */}

          <div className="flex items-center gap-3 text-sm">
            <FaUserSecret
              size={17}
              className="text-indigo-400 shrink-0"
            />

            <span className="text-slate-300">
              {event.seats} seats
            </span>
          </div>
        </div>

        {/* BUTTON */}

        <Button
          onPress={() =>
            router.push(`/events/${event._id}`)
          }
          className="
            w-full
            mt-5
            bg-indigo-600
            hover:bg-indigo-500
            text-white
            font-semibold
          "
          radius="lg"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;