import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import { onValue, ref } from 'firebase/database'
import { db } from '../../firebaseConfig'

Chart.register(...registerables)

function YearlyLineChart() {
  const chartRef = useRef(null)
  const [salesData, setSalesData] = useState([])

  useEffect(() => {
    const salesRef = ref(db, 'sales')

    const fetchData = () => {
      const fetchSalesData = (snapshot) => {
        const monthlySales = {
          January: 0,
          February: 0,
          March: 0,
          April: 0,
          May: 0,
          June: 0,
          July: 0,
          August: 0,
          September: 0,
          October: 0,
          November: 0,
          December: 0
        }

        snapshot.forEach((childSnapshot) => {
          const saleData = childSnapshot.val()
          const dateTime = saleData.dateTime
          const month = new Date(dateTime).toLocaleString('default', { month: 'long' })
          const totalPrice = saleData.totalPrice
          // Aggregate total sales for each month
          monthlySales[month] += totalPrice
        })

        // Convert monthlySales object to array of sales data
        return Object.values(monthlySales)
      }

      onValue(salesRef, (snapshot) => {
        const salesData = fetchSalesData(snapshot)
        setSalesData(salesData)
      }, (error) => {
        console.error("Error fetching sales data:", error)
      })
    }

    fetchData()

    return () => {
      const unsubscribeSales = onValue(salesRef, () => {})
      unsubscribeSales()
    }
  }, [])

  useEffect(() => {
    let chartInstance = null

    if (chartRef.current) {
      chartInstance = chartRef.current.chartInstance
      if (chartInstance) {
        const canvas = chartInstance.canvas
        canvas.remove()
      }
    }
  }, [salesData])

  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Sales(₱)',
        data: salesData,
        borderColor: 'rgb(52, 100, 228)',
        tension: 0.3,
        backgroundColor: "rgba(52, 100, 228, 0.6)",
        fill: "origin"
      },
    ],
    scales: {
      x: {
        type: 'category',
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      }
    }
  }

  return <Line ref={chartRef} data={chartData} />
}

export default YearlyLineChart
