import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface DateRenderProps {
  unix: number;
}

const DateRender: React.FC<DateRenderProps> = React.memo(({ unix }) => {
  const [hover, setHover] = React.useState<boolean>(false);

  return (
    <>
      <span
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {hover
          ? dayjs.unix(unix).format("MMMM D, YYYY hh:mm")
          : dayjs.unix(unix).fromNow()}
      </span>
    </>
  );
});

DateRender.displayName = "DateRender";

export default DateRender;