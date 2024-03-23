import { Pie } from "react-chartjs-2"

const labels = ["January", "February", "March", "April", "May", "June"]

const data = {
    labels: labels,
    datasets: [
        {
            label: "Sales",
            backgroundColor: "rgb(0, 0, 30)",
            borderColor: "#fff",
            data: [1, 0, 3, 1, 2, 10],
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
