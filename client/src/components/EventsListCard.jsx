import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import Button from './Button'
import ImageSkeleton from './ImageSkeleton.jsx';

export default function EventsListCard({ type = "upcoming", id, image, badge, title, dateTime, attendees, description }) {
	const [imgLoaded, setImgLoaded] = useState(false);
  const isUpcoming = type === "upcoming"

  const formattedDate = dateTime && typeof dateTime === "object"
    ? `${dateTime.day} \u00b7 ${dateTime.time}`
    : dateTime

  return (
    <div className="flex flex-col bg-card dark:bg-[#0F172A] border border-border rounded-3xl overflow-hidden h-full">
      <div className="relative h-50 md:h-60 overflow-hidden">
      	{!imgLoaded && <ImageSkeleton />}
				<img
          src={image}
					onLoad={() => setImgLoaded(true)}
          alt={title}
          className="w-full h-full object-cover"
        />
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

        <h3 className="font-bold text-xl text-foreground">{title}</h3>

        {isUpcoming ? (
          <span className="text-sm text-muted">{formattedDate}</span>
        ) : (
          <span className="text-sm text-muted">{attendees} Attendees</span>
        )}

        <p className={`text-sm text-muted flex-1 ${isUpcoming && "mb-4"}`}>{description}</p>

        {isUpcoming && (
          <Link to={`/events/${id}`} state={{ image, title, description }} className='mt-auto'>
	          <Button variant="default" className="bg-primary-dark text-white w-full">
	          	Join Now
	          </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
