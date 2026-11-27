import { useState } from 'react';

/** Flag image from flagcdn.com. Shows the two-letter code if the image cannot load. */
export default function CountryFlag({ iso }) {
  const [failedIso, setFailedIso] = useState(null);
  const code = iso.toLowerCase();

  return (
    <span className="grid place-items-center w-5 h-[15px] shrink-0 overflow-hidden rounded-sm bg-stone-100">
      {failedIso === iso ? (
        <span className="text-[9px] font-semibold leading-none text-mute">{iso}</span>
      ) : (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailedIso(iso)}
        />
      )}
    </span>
  );
}
