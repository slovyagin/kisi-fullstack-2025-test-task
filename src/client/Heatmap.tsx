import {memo, use, useMemo} from "react";
import {Heatmap as HeatmapType} from "../types.ts";

const LOCATION_NAME = 'Kisi Stockholm Office'
const fetchHeatmap = fetch('/api/heatmap/unlock')
  .then<HeatmapType>(res => {
    if (!res.ok) {
      throw new Error(`Failed to fetch heatmap: ${res.status}`);
    }

    return res.json();
  });

/**
 * Create 12 timeline slots (0, 2, 4, ... 22 hours)
 */
const Timeline = memo(function Timeline() {
  return <div className="flex justify-end text-gray">
    {[...Array(12)].map((_, i) => {
      const hour = i * 2;

      return (
        <div key={i} className="w-16 grid items-center px-1 pt-1 border-t-1 -mt-px">
          {/* Convert 24h format to 12h format */}
          {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
          {hour >= 12 ? 'PM' : 'AM'}
        </div>
      );
    })}
  </div>
})

export function Heatmap() {
  const heatmap = use(fetchHeatmap)

  /**
   * Calculate the maximum value across all hours in the heatmap
   * Used to normalize the color intensity
   */
  const maxValue = useMemo(() => Math.max(...heatmap.flatMap(({hours}) => hours)), [heatmap])

  /**
   * Format the date range for display (e.g., "Jan 1 - Jan 7, 2025")
   */
  const userFriendlyDateRange: string = useMemo(() => {
    const dateList = heatmap.map(({date}) => new Date(date))

    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      // @ts-expect-error Intl.DateTimeFormat.prototype.formatRange might not be typed yet in some TS versions
    }).formatRange(dateList[0], dateList[dateList.length - 1])
  }, [heatmap])

  return <>
    <div className="flex items-center">
      <div className="grid">
        <p className="not-print:hidden text-6xl font-normal mb-4">{LOCATION_NAME}</p>
        <p className="text-3xl font-bold print:text-xl print:font-normal">Weekly Place Analytics</p>
        <p className="text-base text-gray print:hidden">
          Discover practical information on your facility usage patterns, user behavior, and security trends.
        </p>
        <p aria-hidden className="not-print:hidden text-xl">{userFriendlyDateRange}</p>
      </div>
      <div className="ml-auto print:hidden">
        <a
          href='/export-pdf'
          className="border-1 border-blue rounded py-2 px-8 appearance-none hover:bg-blue/20 text-lg text-blue"
        >
          Export
        </a>
      </div>
    </div>
    <div
      className="not-print:border not-print:border-gray/50 not-print:p-8 print:pt-6 print:pb-8 bg-white not-print:rounded-lg  print:border-y print:border-y-gray w-fit grid gap-4">
      <p className="text-base flex items-center gap-2 print:text-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="inline fill-blue h-4 aspect-square">
          <rect width="100%" height="100%"/>
        </svg>
        <span>
          Unique users unlock heatmap in {LOCATION_NAME} for
          {" "}
          {userFriendlyDateRange}
				</span>
      </p>
      <div className="grid tabular-nums">
        {
          heatmap.map((day, rowIndex) => <div key={day.date} className="flex items-center">
            <div className="text-gray pr-2 border-e-1 border-e-black h-full items-center flex text-nowrap">
              {day.date}
            </div>

            <div className="flex justify-end">
              {day.hours.map(
                (count, cellIndex) => {
                  /**
                   * Calculate color intensity based on count relative to max value
                   * Lower intensity = darker color (more events)
                   */
                  const intensity = Math.max(((maxValue - count) / maxValue - 0.05) * 100, 0);

                  /**
                   * Alternating ROW shading for better readability
                   */
                  const rowShade = rowIndex % 2 === 0 ? 97 : 95;

                  /**
                   * Alternating COL shading for better readability
                   */
                  const pairIndex = Math.floor(cellIndex / 2);
                  const pairShade = pairIndex % 2 === 0 ? 3 : 1;

                  /**
                   * Final CELL color
                   */
                  const filler = rowShade + pairShade;

                  return <div
                    key={cellIndex}
                    aria-label={`${count} events`}
                    className="aspect-square w-8 grid place-items-center"
                    style={{
                      /**
                       * CSS color-mix for dynamic coloring based on events count
                       */
                      backgroundColor: `color-mix(in srgb, var(--color-blue), white ${count ? intensity : filler}%)`,

                      /**
                       * Ensure text is readable by using white text on dark backgrounds
                       */
                      color: count / maxValue > 0.5 ? 'var(--color-white)' : 'var(--color-black)',
                    }}
                  >
                    {/* Format large numbers with K suffix (e.g., 1000 → 1K) just in case */}
                    {count >= 1000 ? `${(count / 1000).toFixed()}K` : count || null}
                  </div>;
                }
              )}
            </div>
          </div>)
        }
        <Timeline/>
      </div>
      <p className="text-gray">Timezone: Stockholm (GMT+01:00)</p>
    </div>
  </>
}
