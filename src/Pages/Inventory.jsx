import { ref, update, get } from 'firebase/database'
import { db } from '../firebaseConfig'
import { useState, useEffect } from 'react'
import Nav from '../Components/Navigation/Nav'
import UserAccessFetcher from '../UserAccessFetcher'
import { useAuth } from '../Components/Login/AuthContext'

function Inventory({ Toggle }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [editProductId, setEditProductId] = useState('')
    const [editQuantity, setEditQuantity] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [lowStockCount, setLowStockCount] = useState(0)
    const [outOfStockCount, setOutOfStockCount] = useState(0)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addQuantityValue, setAddQuantityValue] = useState('')
    const { currentUser } = useAuth()
    const [userAccess, setUserAccess] = useState(null)

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
                    productsArray.sort((a, b) => a.quantity - b.quantity)
                    
                    setProducts(productsArray)
                    updateStockCounts(productsArray)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const updateStockCounts = (productsArray) => {
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

    useEffect(() => {
        const confirmationTimeout = setTimeout(() => {
            setConfirmationMessage('')
        }, 3000)

        const errorTimeout = setTimeout(() => {
            setErrorMessage('')
        }, 3000)

        return () => {
            clearTimeout(confirmationTimeout)
            clearTimeout(errorTimeout)
        }
    }, [confirmationMessage, errorMessage])

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
            updateStockCounts(updatedProducts)
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
        const newQuantity = parseInt(e.target.value, 10)
        setEditQuantity(newQuantity)
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const calculateTotalValue = (product) => {
        const matchingProduct = products.find((p) => p.key === product.key)
        if (matchingProduct) {
            const totalValue = matchingProduct.retailPrice * product.quantity
            return totalValue.toFixed(2)
        }
        return 0
    }

    const handleAddQuantity = (id) => {
        setEditProductId(id);
        setAddQuantityValue('')
        setShowAddModal(true)
    }

    const handleAddQuantityConfirm = async () => {
        const parsedAddQuantityValue = parseInt(addQuantityValue, 10)
        if (!isNaN(parsedAddQuantityValue)) {
            try {
                const productRef = ref(db, `products/${editProductId}`)
                const currentQuantity = parseInt(products.find(product => product.key === editProductId).quantity, 10)
                const newQuantity = currentQuantity + parsedAddQuantityValue
    
                await update(productRef, {
                    quantity: newQuantity
                })
                setShowAddModal(false)
                setEditProductId('')
                setConfirmationMessage('Quantity added successfully.')
    
                const updatedProducts = products.map(product => {
                    if (product.key === editProductId) {
                        return { ...product, quantity: newQuantity }
                    }
                    return product;
                })
    
                setProducts(updatedProducts)
                updateStockCounts(updatedProducts)
                setAddQuantityValue('')
            } catch (error) {
                setErrorMessage('Error updating quantity.')
                console.error("Error updating quantity: ", error)
            }
        } else {
            setErrorMessage('Invalid quantity value.')
        }
    }
    

    const handleAddQuantityCancel = () => {
        setShowAddModal(false)
        setEditProductId('')
        setAddQuantityValue('')
    }

    return (
        <div className='px-3'>
            <UserAccessFetcher currentUser={currentUser} setUserAccess={setUserAccess} />
            <Nav Toggle={Toggle} pageTitle="Inventory"/>
            <div className='px-3 position-relative'>
                <div className="position-fixed top-1 start-50 translate-middle-x" style={{ zIndex: 1070 }}>
                    {confirmationMessage && (
                        <div className="alert alert-success fadein" role="alert">
                            {confirmationMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="alert alert-danger fadein" role="alert">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>
            <section className="p-3 fadein">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                        <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className='fadein'>
                        <div className="row d-flex">
                            <div className="col-6 d-flex justify-content-start">
                                <div className="me-3">
                                    <span className="me-1 text-light fs-4">{lowStockCount}</span>
                                    <i className="bi bi-cart-dash text-warning fs-4" data-bs-toggle="tooltip" data-bs-placement="top" title="Low stock"></i>
                                </div>
                                <div>
                                    <span className="me-1 text-light fs-4">{outOfStockCount}</span>
                                    <i className="bi bi-cart-x text-danger fs-4" data-bs-toggle="tooltip" data-bs-placement="top" title="Out of stock"></i>
                                </div>
                            </div>
                            <div className="col-6 d-flex justify-content-end">
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
                                <table className="table table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
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
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="col-2">
                                                            {product.quantity < 5 && product.quantity != 0 && (
                                                                <i className="bi bi-exclamation-triangle-fill text-warning fs-5 icon-inv ps-0" data-bs-toggle="tooltip" data-bs-placement="top" title="Low stock"></i>
                                                            )}
                                                            {product.quantity == 0 && (
                                                                <i className="bi bi-exclamation-triangle-fill text-danger fs-5 icon-inv" data-bs-toggle="tooltip" data-bs-placement="top" title="Out of stock"></i>
                                                            )}
                                                        </div>
                                                        <div className="col me-4">
                                                            {product.key}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{product.name}</td>
                                                <td>
                                                    {editMode && editProductId === product.key ? (
                                                        <input
                                                            type="number"
                                                            value={editQuantity}
                                                            onChange={handleQuantityChange}
                                                            className="form-control w-50 mx-auto"
                                                            min="0"
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
                                                            <button onClick={confirmEdit} className="btn btn-primary me-2">Save</button>
                                                            <button onClick={handleCloseEdit} className="btn btn-secondary">Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleAddQuantity(product.key, product.quantity)} className="btn btn-primary me-2">Add</button>
                                                            {userAccess !== "Member" && (
                                                                <button onClick={() => handleEdit(product.key, product.quantity)} className="btn btn-success">Edit</button>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {showAddModal && (
                            <div className="modal fadein" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                <div className="modal-dialog modal-dialog-centered" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Add Quantity</h5>
                                            <button type="button" className="btn-close" aria-label="Close" onClick={handleAddQuantityCancel}></button>
                                        </div>
                                        <div className="modal-body">
                                            <input
                                                type="number"
                                                value={addQuantityValue}
                                                onChange={(e) => setAddQuantityValue(e.target.value)}
                                                className="form-control w-50 mx-auto"
                                                min="0"
                                                placeholder="Quantity"
                                            />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={handleAddQuantityCancel}>Cancel</button>
                                            <button type="button" className="btn btn-primary" onClick={handleAddQuantityConfirm}>Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Inventory
