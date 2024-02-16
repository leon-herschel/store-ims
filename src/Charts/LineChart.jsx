import Chart from "chart.js/auto"
import { Line } from "react-chartjs-2"

const labels = ["January", "February", "March", "April", "May", "June"]

const data = {
    labels: labels,
    datasets: [
        {
            label: "My First Dataset",
            backgroundColor: "#000",
            borderColor: "#000",
            data: [0, 10, 5, 2, 20, 30, 45],
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
