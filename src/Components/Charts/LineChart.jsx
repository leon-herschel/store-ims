import { Line } from "react-chartjs-2"

const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const data = {
    labels: labels,
    datasets: [
        {
            label: "Sales",
            backgroundColor: "rgb(0, 0, 30)",
            borderColor: "rgb(0, 0, 30)",
            data: [33, 44, 46, 40, 50, 38, 45, 44, 36, 52, 43, 49],
        },
    ],
}

function LineChart() {
  return (
    <div className="p-3 bg-white rounded overflow-auto">
        <Line data={data}></Line>
    </div>
  )
}

export default LineChart
