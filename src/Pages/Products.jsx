import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { ref, onValue, remove, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebaseConfig'

function Products({ Toggle }) {
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const [editProductId, setEditProductId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unitPrice: '',
        quantity: '' 
    })
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const productsRef = ref(db, 'products')
        const unsubscribe = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const productsArray = []
                snapshot.forEach((childSnapshot) => {
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

    const generateProductKey = () => {
        return Math.floor(1000 + Math.random() * 9000).toString()
    }

    const handleAdd = async (e) => {
        e.preventDefault()
    
        try {
            const productsRef = ref(db, 'products')
            let productData = {
                name: formData.name,
                description: formData.description,
                unitPrice: formData.unitPrice,
                quantity: formData.quantity,
                timeStamp: serverTimestamp()
            };
    
            if (editMode) {
                await update(ref(db, `products/${editProductId}`), productData);
                setConfirmationMessage('Product updated successfully.');
            } else {
                let productKey = generateProductKey();
                while (products.some((product) => product.key === productKey)) {
                    productKey = generateProductKey();
                }
                await update(productsRef, {
                    [productKey]: productData
                });
                setConfirmationMessage('Product added successfully.');
            }
    
            setEditMode(false);
            setEditProductId('');
            setShowForm(false);
            setFormData({
                name: '',
                description: '',
                unitPrice: '',
                quantity: 0
            });
        } catch (err) {
            setErrorMessage('Error adding/updating product.')
            console.error('Error adding/updating product: ', err)
        }
    }
    

    const handleEdit = (id) => {
        setEditProductId(id)
        const productToEdit = products.find((product) => product.key === id)
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                unitPrice: productToEdit.unitPrice,
                quantity: productToEdit.quantity
            })
            setEditMode(true)
            setShowForm(true)
        } else {
            console.error('Product not found with ID:', id)
        }
    }

    const handleDelete = (id) => {
        setEditProductId(id)
        setShowDeleteConfirmation(true)
    }

    const confirmDelete = async () => {
        try {
            await remove(ref(db, 'products/' + editProductId))
            setConfirmationMessage('Product deleted successfully.')
            console.log('Product with ID ', editProductId, ' successfully deleted')

            setProducts((prevProducts) => prevProducts.filter((product) => product.key !== editProductId))
        } catch (error) {
            setErrorMessage('Error deleting product.')
            console.error('Error deleting product: ', error)
        } finally {
            setEditProductId('')
            setShowDeleteConfirmation(false)
        }
    }

    const handleCloseForm = () => {
        setFormData({
            name: '',
            description: '',
            unitPrice: '',
            quantity: 0
        })
        setEditMode(false)
        setEditProductId('')
        setShowForm(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Products"/>
            <section className="p-3">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                        <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row d-flex">
                            <div className="col-6">
                                <button onClick={() => setShowForm(true)} className="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#productForm">Add Product</button>
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
                                <table className="table  table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
                                    <thead>
                                        <tr>
                                            <th scope='col'>Product ID</th>
                                            <th scope='col'>Product Name</th>
                                            <th scope='col'>Description</th>
                                            <th scope='col'>Unit Price</th>
                                            <th scope='col'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='table-striped'>
                                    {products.filter(product => {
                                        const productDataString = Object.values(product).join(' ').toLowerCase();
                                        return productDataString.includes(searchQuery.toLowerCase());
                                        }).map(product => (
                                            <tr key={product.key}>
                                                <td>{product.key}</td>
                                                <td>{product.name}</td>
                                                <td>{product.description}</td>
                                                <td>{product.unitPrice}</td>
                                                <td>
                                                    <button onClick={() => handleEdit(product.key)} className="btn btn-success me-2">Edit</button>
                                                    <button onClick={() => handleDelete(product.key)} className="btn btn-danger">Delete</button>
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

            {showForm && (
                <div className="modal fade show d-block" id="productForm">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editMode ? 'Edit Product' : 'Add Product'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mb-3" placeholder="Name" required />
                                    <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control mb-3" placeholder="Description" required />
                                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="form-control mb-3" placeholder="Unit Price" required />
                                    {!editMode && <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control mb-3" placeholder="Quantity" required />}
                                    {editMode && <input type="hidden" name="quantity" value={formData.quantity} />}
                                    <div className="d-grid my-3 shadow">
                                        <button type="submit" className="btn btn-primary login-btn">{editMode ? 'Update' : 'Submit'}</button>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirmation && (
                <div className="modal fade show d-block" id="deleteConfirmationModal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirmation(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this product?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

export default Products
