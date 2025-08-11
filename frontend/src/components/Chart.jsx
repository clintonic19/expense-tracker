import React from 'react'
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import Title from "./Title"

const Chart = ({data}) => {
  return (
    <div className='flex-1 w-full'>
      <Title title = 'Transactions Activities'/>
      <ResponsiveContainer width = "100%" height={400} className='mt-4'>
        <LineChart data={data} height={300} width={500}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" padding={{ left: 20, right: 20 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="uv" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart
