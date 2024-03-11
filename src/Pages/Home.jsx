import { useState, useEffect } from 'react'
import LineChart from '../Components/Charts/LineChart'
import PieChart from '../Components/Charts/PieChart'
import Nav from '../Nav'
import { db } from '../firebaseConfig'
import { ref, onValue } from 'firebase/database'
import { useNavigate } from 'react-router-dom'

function Home({ Toggle }) {
    const [productsCount, setProductsCount] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [outOfStockCount, setOutOfStockCount] = useState(0)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const productsRef = ref(db, 'products')
        const unsubscribe = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const productsData = snapshot.val()
                const productsArray = Object.entries(productsData).map(([key, value]) => ({
                    key,
                    ...value
                }))
                setProducts(productsArray.slice(0, 4))
                setProductsCount(Object.keys(productsData).length) 

                let lowStock = 0
                let outOfStock = 0
                productsArray.forEach(product => {
                    if (product.quantity < 5 && product.quantity != 0) {
                        lowStock++
                    }
                    if (product.quantity == 0) {
                        outOfStock++
                    }
                })
                setLowStockCount(lowStock)
                setOutOfStockCount(outOfStock)
            }
            setLoading(false)
        })
    
        return () => {
            unsubscribe()
        }
    }, [])

    const calculateTotalValue = (product) => {
        const matchingProduct = products.find((p) => p.key === product.key)
        if (matchingProduct) {
            return matchingProduct.unitPrice * product.quantity
        }
        return 0
    }

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Home" />
            {loading ? ( 
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="container-fluid">
                    <div className="row g-1 m-2 ">
                        <div className="col-md-3 p-1">
                            <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div>
                                    <h3 className='fs-2'>{productsCount}</h3>
                                    <p className='fs-5'>Products</p>
                                </div>
                                <i className="bi bi-cart-plus p-3 fs-1"></i>
                            </div>
                        </div>
                        <div className="col-md-3 p-1">
                            <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div>
                                    <h3 className='fs-2'>{lowStockCount}</h3>
                                    <p className='fs-5'>Low stock</p>
                                </div>
                                <i className="bi bi-cart-dash p-3 fs-1"></i>
                            </div>
                        </div>
                        <div className="col-md-3 p-1">
                            <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div>
                                    <h3 className='fs-2'>{outOfStockCount}</h3>
                                    <p className='fs-5'>Out of Stock</p>
                                </div>
                                <i className="bi bi-cart-x p-3 fs-1"></i>
                            </div>
                        </div>
                        <div className="col-md-3 p-1">
                            <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div>
                                    <h3 className='fs-2'>40</h3>
                                    <p className='fs-5'>Sales</p>
                                </div>
                                <i className="bi bi-receipt p-3 fs-1"></i>
                            </div>
                        </div>
                    </div>
                    <div className='row m-2'>
                        <table className="table caption-top table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
                            <caption className="text-white fs-4">Inventory</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Product ID</th>
                                    <th scope="col">Product Name</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                     <tr key={product.key} onClick={() => navigate("/inventory")}>
                                        <th scope="row">{product.key}</th>
                                        <td>{product.name}</td>
                                        <td>{product.quantity}</td>
                                        <td>{calculateTotalValue(product)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" className="text-center p-0">
                                        <button className="btn" onClick={() => navigate("/inventory")}>
                                            Show More
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row">
                        <div className="col-12 col-md-8 p-3 my-2">
                            <LineChart />
                        </div>
                        <div className="col-12 col-md-4 p-3 my-2">
                            <PieChart />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home
