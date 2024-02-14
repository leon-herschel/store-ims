import Chart from "chart.js/auto"
import { Pie } from "react-chartjs-2"

const labels = ["January", "February", "March", "April", "May", "June"]

const data = {
    labels: labels,
    datasets: [
        {
            label: "My First Dataset",
            backgroundColor: "#000",
            borderColor: "#fff",
            data: [0, 10, 5, 2, 20, 30, 45],
        },
    ],
}

function PieChart() {
  return (
    <div className="p-3 bg-white rounded overflow-auto">
        <Pie data={data}></Pie>
    </div>
  )
}

export default PieChart
