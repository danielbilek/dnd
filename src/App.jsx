import {useState} from "react";
import {DndContext, useDraggable, useDroppable} from "@dnd-kit/core";


function App() {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    newDate.setHours(0, 0, 0, 0)
    dates.push(newDate)
  }
  // console.log(dates)

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
      id: 'draggable',
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
    return (<div className="flex-1 w-1/7" data-date={date}>

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
      id: 'cell',
      data: {date, hour, block}
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
    console.log(event)
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
            <DndContext onDragEnd={onDragEnd}>
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
