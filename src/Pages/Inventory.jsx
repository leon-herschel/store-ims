import { ref, update, get } from 'firebase/database'
import { db } from '../firebaseConfig'
import { useState, useEffect } from 'react'
import Nav from '../Nav'

function Inventory({ Toggle }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [editProductId, setEditProductId] = useState('')
    const [editQuantity, setEditQuantity] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsRef = ref(db, 'products')
                const productsSnapshot = await get(productsRef)
                if (productsSnapshot.exists()) {
                    const productsData = productsSnapshot.val()
                    const productsArray = Object.entries(productsData).map(([key, value]) => ({
                        key,
                        ...value
                    }))
                    setProducts(productsArray)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const handleEdit = (id, quantity) => {
        setEditProductId(id)
        setEditQuantity(quantity)
        setEditMode(true)
    }

    const confirmEdit = async () => {
        try {
            const productRef = ref(db, `products/${editProductId}`)
            await update(productRef, {
                quantity: editQuantity
            })
            setEditMode(false)
            setEditProductId('')
            setEditQuantity('')
            setConfirmationMessage('Quantity updated successfully.')

            const updatedProducts = products.map(product => {
                if (product.key === editProductId) {
                    return { ...product, quantity: editQuantity }
                }
                return product
            })
            setProducts(updatedProducts)
        } catch (error) {
            setErrorMessage('Error updating quantity.')
            console.error("Error updating quantity: ", error)
        }
    }

    const handleCloseEdit = () => {
        setEditMode(false)
        setEditProductId('')
        setEditQuantity('')
    }

    const handleQuantityChange = (e) => {
        setEditQuantity(e.target.value)
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const calculateTotalValue = (product) => {
        const matchingProduct = products.find((p) => p.key === product.key)
        if (matchingProduct) {
            return matchingProduct.unitPrice * product.quantity
        }
        return 0
    }

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Inventory"/>
            <section className="p-3">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                        <div className="spinner-border text-primary">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row d-flex">
                            <div className="col-6 d-flex">
                                <div className="w-50">
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <table className="table  table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
                                    <thead>
                                        <tr>
                                            <th scope='col'>Product ID</th>
                                            <th scope='col'>Product Name</th>
                                            <th scope='col'>Quantity</th>
                                            <th scope='col'>Total Value</th>
                                            <th scope='col'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='table-striped'>
                                        {products.filter(product => {
                                            const productDataString = `${product.key} ${product.name}`.toLowerCase();
                                            return productDataString.includes(searchQuery.toLowerCase());
                                        }).map(product => (
                                            <tr key={product.key}>
                                                <td>{product.key}</td>
                                                <td>{product.name}</td>
                                                <td>
                                                    {editMode && editProductId === product.key ? (
                                                        <input
                                                            type="number"
                                                            value={editQuantity}
                                                            onChange={handleQuantityChange}
                                                            className="form-control"
                                                        />
                                                    ) : (
                                                        product.quantity
                                                    )}
                                                </td>
                                                <td>
                                                    {calculateTotalValue(product)}
                                                </td>
                                                <td>
                                                    {editMode && editProductId === product.key ? (
                                                        <>
                                                            <button onClick={confirmEdit} className="btn btn-success me-2">Save</button>
                                                            <button onClick={handleCloseEdit} className="btn btn-secondary">Cancel</button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleEdit(product.key, product.quantity)} className="btn btn-primary">Edit Quantity</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <div className='px-3'>
                {confirmationMessage && (
                    <div className="alert alert-success" role="alert">
                        {confirmationMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Inventory
