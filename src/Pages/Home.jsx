import { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { ref, onValue } from 'firebase/database'
import Nav from '../Components/Navigation/Nav'
import { useNavigate, Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'

function Home({ Toggle }) {
    const [productsCount, setProductsCount] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [outOfStockCount, setOutOfStockCount] = useState(0)
    const [salesCount, setSalesCount] = useState(0)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const productsRef = ref(db, 'products')
        const salesRef = ref(db, 'sales')
        const unsubscribeProducts = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const productsData = snapshot.val()
                const productsArray = Object.entries(productsData).map(([key, value]) => ({
                    key,
                    ...value
                }))
                productsArray.sort((a, b) => b.quantity - a.quantity)

                setProducts(productsArray)
                setProductsCount(productsArray.length) 

                let lowStock = 0
                let outOfStock = 0
                productsArray.forEach(product => {
                    if (product.quantity < 5 && product.quantity !== 0) {
                        lowStock++
                    }
                    if (product.quantity === 0) {
                        outOfStock++
                    }
                })
                setLowStockCount(lowStock)
                setOutOfStockCount(outOfStock)
            }
            setLoading(false)
        })

        const unsubscribeSales = onValue(salesRef, (snapshot) => {
            if (snapshot.exists()) {
                const salesData = snapshot.val()
                const salesCount = Object.keys(salesData).length
                setSalesCount(salesCount)
            } else {
                setSalesCount(0)
            }
        })
    
        return () => {
            unsubscribeProducts()
            unsubscribeSales()
        }
    }, [])

    const chartData = {
        labels: products.map(product => product.name),
        datasets: [
            {
                label: 'Quantity',
                data: products.map(product => product.quantity),
                backgroundColor: products.map(product => {
                    return product.quantity >= 5 ? 'rgba(32, 138, 89, 1)' : 'rgba(255, 193, 7, 1)'
                }),
            },
        ],
    }
    
    const chartOptions = {
        scales: {
            x: {
                ticks: {
                    
                    color: 'rgba(0, 0, 0, 1)'
                },
            },
            y: {
                ticks: {
                    title: { display: false},
                    color: 'rgba(0, 0, 0, 1)'
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false, 
        height: 500,
        plugins: {
            legend: {
              display: false
            }
        }
    }

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Home" />
            {loading ? ( 
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
                    <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="container-fluid">
                    <div className="row g-1 m-1">
                        <div className="col-md-3 py-1 px-2 shadow" style={{ animation: 'fadeIn 0.2s ease-out forwards', opacity: 0 }}>
                            <Link to="/products" className="text-decoration-none text-dark">
                                <div className="p-3 bg-white d-flex justify-content-around align-items-center rounded zoom-on">
                                    <div>
                                        <h3 className='fs-2'>{productsCount}</h3>
                                        <p className='fs-5'>Products</p>
                                    </div>
                                    <i className="bi bi-cart-plus p-3 fs-1 text-success"></i>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3 py-1 px-2 shadow" style={{ animation: 'fadeIn 0.4s ease-out forwards', opacity: 0 }}>
                            <Link to="/inventory" className="text-decoration-none text-dark">
                                <div className="p-3 bg-white d-flex justify-content-around align-items-center rounded zoom-on">
                                    <div>
                                        <h3 className='fs-2'>{lowStockCount}</h3>
                                        <p className='fs-5'>Low stock</p>
                                    </div>
                                    <i className="bi bi-cart-dash p-3 fs-1 text-warning"></i>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3 py-1 px-2 shadow" style={{ animation: 'fadeIn 0.6s ease-out forwards', opacity: 0 }}>
                            <Link to="/inventory" className="text-decoration-none text-dark">
                                <div className="p-3 bg-white d-flex justify-content-around align-items-center rounded zoom-on">
                                    <div>
                                        <h3 className='fs-2'>{outOfStockCount}</h3>
                                        <p className='fs-5'>Out of stock</p>
                                    </div>
                                    <i className="bi bi-cart-x p-3 fs-1 text-danger"></i>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3 py-1 px-2 shadow" style={{ animation: 'fadeIn 0.8s ease-out forwards', opacity: 0 }}> 
                            <Link to="/sales" className="text-decoration-none text-dark">
                                <div className="p-3 bg-white d-flex justify-content-around align-items-center rounded zoom-on">
                                    <div>
                                        <h3 className='fs-2'>{salesCount}</h3>
                                        <p className='fs-5'>Sales</p>
                                    </div>
                                    <i className="bi bi-receipt p-3 fs-1 text-primary"></i>
                                </div>
                            </Link>
                        </div>
                    </div>
                    <div className="row g-2 m-2 fadein">
                        <h4 className="text-white fs-4">Inventory Level</h4>
                        <div className="col-12 p-3 bg-white shadow rounded" style={{height:"450px"}}>
                                <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
