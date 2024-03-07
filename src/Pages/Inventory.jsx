import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { db } from '../firebaseConfig'

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
        const productsRef = ref(db, 'products')
        const unsubscribe = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const productsArray = []
                snapshot.forEach(childSnapshot => {
                    productsArray.push({
                        key: childSnapshot.key, 
                        ...childSnapshot.val()
                    })
                })
                setProducts(productsArray)
                setLoading(false)
            } else {
                setLoading(false)
            }
        })

        return () => {
            unsubscribe()
        }
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
