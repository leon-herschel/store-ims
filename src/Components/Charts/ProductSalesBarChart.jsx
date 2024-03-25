import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function ProductSalesBarChart() {
  const [productSalesData, setProductSalesData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesRef = ref(db, 'sales');
        const salesArchiveRef = ref(db, 'salesArchive');
        const productsRef = ref(db, 'products');

        const [salesSnapshot, salesArchiveSnapshot] = await Promise.all([
          get(salesRef),
          get(salesArchiveRef),
        ]);

        // Merge sales and salesArchive data
        const allSalesData = { ...salesSnapshot.val(), ...salesArchiveSnapshot.val() };
        const productOccurrences = {};

        for (const saleId in allSalesData) {
          const sale = allSalesData[saleId];
          for (const product of Object.values(sale.products)) {
            const productName = product.productName;
            productOccurrences[productName] = (productOccurrences[productName] || 0) + product.quantity; // Accumulate the quantity sold
          }
        }

        const productsSnapshot = await get(productsRef);
        const productsData = productsSnapshot.val();

        const productSalesData = Object.keys(productOccurrences)
          .map((productName) => ({
            productName,
            productQuantitySold: productOccurrences[productName],
          }))
          .sort((a, b) => b.productQuantitySold - a.productQuantitySold) // Sort by quantity (descending)
          .slice(0, 10); // Limit to top 10 products

        console.log('productSalesData:', productSalesData);

        setProductSalesData(productSalesData);
      } catch (error) {
        console.error('Error fetching product sales data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Update chartData whenever productSalesData changes
    setChartData({
      labels: productSalesData.map((product) => product.productName),
      datasets: [
        {
          label: 'Quantity Sold',
          data: productSalesData.map((product) => product.productQuantitySold),
          backgroundColor: 'rgba(52, 100, 228, 0.6)',
          borderColor: 'rgba(52, 100, 228, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [productSalesData]);

  const chartOptions = {
    indexAxis: 'y',
    elements: { bar: { borderWidth: 2 } },
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: { display: false, text: 'Quantity Sold' },
      },
      y: {
        title: { display: false, text: 'Products' },
      },
    },
  };

  return (
    <div className="product-sales-bar-chart">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default ProductSalesBarChart;
