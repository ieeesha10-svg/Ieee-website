import React from "react";
import { Link } from "react-router-dom";
import Button from "../Button";

export default function EventsListCard({
  type = "upcoming",
  id,
  image,
  badge,
  title,
  dateTime,
  description,
  isRegistered,
}) {
  const isUpcoming = type === "upcoming";

  const formattedDate =
    dateTime && typeof dateTime === "object"
      ? dateTime.day
      : dateTime;

  return (
    <div className="flex flex-col bg-card dark:bg-[#0F172A] border border-border rounded-3xl overflow-hidden h-full">
      <div className="relative h-50 md:h-60 overflow-hidden">
        {isRegistered && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-green-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
            Registered
          </div>
        )}
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">
              {title?.charAt(0) || "E"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6 flex-1">
        {isUpcoming ? (
          <span className="self-start rounded-full py-1.5 px-3 text-xs font-medium bg-primary/20 text-primary">
            {badge}
          </span>
        ) : (
          <span className="self-start rounded-full py-1.5 px-3 text-xs font-medium bg-[#16A34A]/20 text-[#16A34A] dark:bg-primary-light/20 dark:text-primary-light">
            Completed
          </span>
        )}

        <h3 className="font-bold text-xl text-foreground capitalize font-black">
          {title}
        </h3>

        <span className="text-sm text-muted">{formattedDate}</span>

        <p
          className={`text-sm text-muted flex-1 line-clamp-3 ${isUpcoming && "mb-4"}`}
        >
          {description}
        </p>

        {isUpcoming ? (
          <Link
            to={`/events/${id}`}
            state={{ image, title, description }}
            className="mt-auto"
          >
            <Button
              variant="default"
              className="w-full"
            >
              {isRegistered ? "View Details" : "Join Now"}
            </Button>
          </Link>
        ) : (
          <Link
            to={`/events/${id}/details`}
            state={{ image, title, description }}
            className="mt-auto"
          >
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
