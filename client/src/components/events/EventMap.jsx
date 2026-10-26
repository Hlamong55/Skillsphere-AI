
import { FiExternalLink, FiMapPin } from "react-icons/fi";

import {
  getEventMapsUrl,
  getEventMapEmbed,
} from "../../utils/eventHelpers";

const EventMap = ({ location }) => {
  if (!location?.trim()) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <FiMapPin className="text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">
          Event Location
        </h3>
      </div>

      <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#0B1120]">
        <iframe
          title={`Map of ${location}`}
          src={getEventMapEmbed(location)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      <a
        href={getEventMapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200  transition-colors"
      >
        <FiExternalLink />
        Open in Google Maps
      </a>
    </section>
  );
};

export default EventMap;
