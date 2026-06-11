import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Kolkata'
});

/** Live local time in IST, updated each minute. */
export default function useLocalTime() {
  const [time, setTime] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}
