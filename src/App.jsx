import {useState} from "react";
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  useDndContext,
  useDraggable,
  useDroppable,
  useSensors
} from "@dnd-kit/core";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";


function App() {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    newDate.setHours(0, 0, 0, 0)
    dates.push(newDate)
  }

  const [surgeries, setSurgery] = useState([
    {
      id: 1,
      title: 'Sample Event',
      from: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
      to: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    }
  ])

  const Card = ({surgery}) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
      id: `draggable-${surgery.id}`,
      data: surgery
    })
    const height = (surgery.to.getTime() - surgery.from.getTime()) / 1000 / 60 / 15 * 12
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    return (<div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="relative rounded-md text-xs text-white overflow-x-hidden flex-1 px-2.5 pt-0.5 cursor-pointer bg-red-500 z-[999] false"
      style={{minHeight: height, ...style}}>
      <div className="absolute min-w-0 font-normal truncate">
        {surgery.title}
        <div className="pt-0.5">
          {surgery.from.getHours()}:{surgery.from.getMinutes()} - {surgery.to.getHours()}:{surgery.to.getMinutes()}
        </div>
      </div>
    </div>)
  }

// eslint-disable-next-line react/prop-types
  const Header = ({date}) => {
    return (<div className="flex flex-col items-center justify-start flex-1">
      <span
        className="flex items-center justify-center text-2xl transition tracking-wider text-gray-700 -mt-1 w-10 h-10 hover:bg-gray-100 rounded-full cursor-pointer">
        {date.getDate()}.{date.getMonth()}.
      </span>
    </div>)
  }

  const Timeline = () => {
    return [...Array(24)].map((_, index) => {
      return (<div key={index} className="flex items-start justify-between h-12 text-gray-500 text-xxs">
        <span className="relative text-right -top-2">{index}</span>
        <div className="relative w-2 h-12 border-t -top-px"></div>
      </div>)
    })
  }

  const Column = ({date}) => {
    const ctx = useDndContext()
    const onMouseEnter = () => {
      const {active} = ctx
      if (active) {
        const surgeryDateFrom = active.data.current.from
        const surgeryDateDiff = surgeryDateFrom.getTime() - date.getTime()
        active.data.current.from = new Date(surgeryDateFrom.getTime() - surgeryDateDiff)
        active.data.current.to = new Date(active.data.current.to.getTime() - surgeryDateDiff)
      }
    }
    return (<div onMouseEnter={onMouseEnter} className="flex-1 w-1/7" data-date={date}>

      {[...Array(24)].map((_, hour) => {
        return (<div key={hour} className="relative w-full h-12 border-b height-min">
          {[...Array(4)].map((_, block) => {
            return <Cell key={`${date}-${hour}-${block}`} block={block} hour={hour} date={date}/>
          })}
        </div>)
      })}

    </div>)
  }

  const Cell = ({date, hour, block}) => {
    date.setHours(hour)
    date.setMinutes((block) * 15)
    const matchedSurgeries = surgeries.filter(surgery => surgery.from.getTime() === date.getTime())
    const {isOver, setNodeRef} = useDroppable({
      id: `cell-${date}-${hour}-${block}`,
      data: {date: `${date}`}
    })

    const style = {
      color: isOver ? 'green' : undefined,
    };

    return (<div ref={setNodeRef} className="relative flex w-full pr-2" style={{height: '12px', ...style}}>
      {matchedSurgeries.map((surgery, index) => {
        return <Card key={index} date={date} surgery={surgery}/>
      })}
    </div>)
  }

  const onDragEnd = (event) => {
    const card = event.active
    const cell = event.over

    if (cell && card) {
      const cellDate = new Date(cell.data.current.date)
      const surgeryOriginalDateFrom = new Date(card.data.current.from)
      const diff = cellDate.getTime() - surgeryOriginalDateFrom.getTime()
      const surgeryUpdated = {
        ...card.data.current,
        from: new Date(card.data.current.from.getTime() + diff),
        to: new Date(card.data.current.to.getTime() + diff),
      }
      setSurgery(surgeries.map(surgery => surgery.id === surgeryUpdated.id ? surgeryUpdated : surgery))
    }
  }


  return (<>
    <div className="relative flex-auto">
      <div className="flex flex-col pr-3">
        <div className="flex flex-col w-full">
          {/* header */}
          <div className="flex flex-col">
            <div className="flex justify-between w-full pl-14">
              {dates.map((date, index) => {
                return (<Header key={index} date={date}/>)
              })}
            </div>

          </div>
          {/* body */}
          <div className="flex flex-auto overflow-y-scroll pt-4" style={{maxHeight: 'calc(-153px + 100vh)'}}>
            {/* timeline */}
            <div className="min-w-14">
              <Timeline/>
            </div>
            <DndContext onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
              <div className="flex-auto w-full h-full border-l flex divide-x">
                {dates.map((date, index) => {
                  return <Column key={index} date={date}/>
                })}
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  </>)
}

export default App
