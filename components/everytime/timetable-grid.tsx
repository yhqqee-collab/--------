import {
  TIMETABLE_DAYS,
  TIMETABLE_END_HOUR,
  TIMETABLE_START_HOUR,
  subjectColor,
  type ClassBlock,
} from './everytime-data'

const HOUR_HEIGHT = 50
const HOURS = Array.from({ length: TIMETABLE_END_HOUR - TIMETABLE_START_HOUR }, (_, i) => TIMETABLE_START_HOUR + i)

export function TimetableGrid({ classes }: { classes: ClassBlock[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <div className="flex border-b border-[#EEE] text-[11px] text-[#777]">
        <span className="w-6 shrink-0" />
        {TIMETABLE_DAYS.map((day) => (
          <span key={day} className="flex-1 border-l border-[#EEE] py-1.5 text-center">
            {day}
          </span>
        ))}
      </div>
      <div className="flex">
        <div className="w-6 shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: HOUR_HEIGHT }}
              className="border-b border-[#F0F0F0] pr-1 pt-0.5 text-right text-[10px] text-[#888] last:border-b-0"
            >
              {hour > 12 ? hour - 12 : hour}
            </div>
          ))}
        </div>
        {TIMETABLE_DAYS.map((day, dayIndex) => (
          <div key={day} className="relative flex-1 border-l border-[#EEE]">
            {HOURS.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="border-b border-[#F0F0F0] last:border-b-0" />
            ))}
            {classes
              .filter((block) => block.day === dayIndex)
              .map((block) => (
                <div
                  key={`${block.name}-${block.start}`}
                  className="absolute inset-x-0 overflow-hidden px-1 py-1 text-white"
                  style={{
                    top: (block.start - TIMETABLE_START_HOUR) * HOUR_HEIGHT,
                    height: (block.end - block.start) * HOUR_HEIGHT,
                    backgroundColor: subjectColor(block.name),
                  }}
                >
                  <p className="break-all text-[10px] font-bold leading-tight">{block.name}</p>
                  <p className="mt-0.5 break-all text-[9px] leading-tight opacity-95">{block.room}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
