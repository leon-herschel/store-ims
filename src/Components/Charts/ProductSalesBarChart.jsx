import { useEffect, useState } from 'react'
import { db } from '../../firebaseConfig'
import { ref, onValue } from 'firebase/database'
import { Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

function ProductSalesBarChart() {
    const [productSalesData, setProductSalesData] = useState([])

    useEffect(() => {
        const fetchData = () => {
            try {
                const productsRef = ref(db, 'products')
                const salesRef = ref(db, 'sales')
                const salesArchiveRef = ref(db, 'salesArchive')

                onValue(productsRef, (snapshot) => {
                    const productsData = snapshot.val()

                    const productsSalesData = []
                    for (const productId in productsData) {
                        const productName = productsData[productId].name
                        getProductQuantitySold(productId, salesRef, salesArchiveRef).then(productQuantitySold => {
                            productsSalesData.push({ productName, productQuantitySold })
                            productsSalesData.sort((a, b) => b.productQuantitySold - a.productQuantitySold)
                            setProductSalesData(productsSalesData)
                        }).catch(error => {
                            console.error('Error fetching product quantity sold:', error)
                        })
                    }
                })
            } catch (error) {
                console.error('Error fetching product sales data:', error)
            }
        }

        fetchData()
    }, [])

    const getProductQuantitySold = async (productId, salesRef, salesArchiveRef) => {
        try {
            const productSalesSnapshot = await Promise.all([
                getSalesDataSnapshot(salesRef, productId),
                getSalesDataSnapshot(salesArchiveRef, productId)
            ])

            let totalQuantitySold = 0
            productSalesSnapshot.forEach(snapshot => {
                const salesData = snapshot.val()
                if (salesData) {
                    for (const saleId in salesData) {
                        const products = salesData[saleId].products
                        products.forEach(product => {
                            if (product.productId === productId) {
                                const quantitySold = product.quantity
                                totalQuantitySold += quantitySold
                                console.log(`Quantity sold for product with ID ${productId}: ${quantitySold}`)
                            }
                        })
                    }
                }
            })

            console.log(`Total quantity sold for product with ID ${productId}: ${totalQuantitySold}`)
            return totalQuantitySold
        } catch (error) {
            console.error('Error fetching product quantity sold:', error)
            return 0
        }
    }

    const getSalesDataSnapshot = async (ref, productId) => {
        return await ref.orderByChild('products/' + productId).equalTo(true).once('value')
    }

    const chartData = {
        labels: productSalesData.map(product => product.productName),
        datasets: [
            {
                label: 'Quantity Sold',
                data: productSalesData.map(product => product.productQuantitySold),
                backgroundColor: 'rgba(52, 100, 228, 0.6)',
                borderColor: 'rgba(52, 100, 228, 1)',
                borderWidth: 1
            }
        ]
    }

    const chartOptions = {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 2
            }
        },
        responsive: true,
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantity Sold'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Products'
                }
            }
        }
    }

    return (
        <div>
            <div>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    )
}

export default ProductSalesBarChart
