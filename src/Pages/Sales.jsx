import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { ref, onValue, remove, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebaseConfig'

function Sales({ Toggle }) {
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true) 
    const [editSaleId, setEditSaleId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const salesRef = ref(db, 'sales')
        const productsRef = ref(db, 'products')

        const unsubscribeSales = onValue(salesRef, (snapshot) => {
            if (snapshot.exists()) {
                const salesArray = []
                snapshot.forEach((childSnapshot) => {
                    salesArray.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                setSales(salesArray)
                setLoading(false) 
            } else {
                setLoading(false) 
            }
        })

        const unsubscribeProducts = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const productsArray = []
                snapshot.forEach((childSnapshot) => {
                    productsArray.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                setProducts(productsArray)
            }
        })

        return () => {
            unsubscribeSales()
            unsubscribeProducts()
        }
    }, [])

    const getCurrentDate = () => {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      let month = currentDate.getMonth() + 1
      let day = currentDate.getDate()

      if (month < 10) {
          month = '0' + month
      }
      if (day < 10) {
          day = '0' + day
      }

      return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
        products: [{ productName: '', quantity: '' }],
        totalPrice: '',
        date: getCurrentDate()
    })

    const handleAdd = async (e) => {
        e.preventDefault()
    
        try {
            const salesRef = ref(db, 'sales')
            const productsRef = ref(db, 'products')
    
            await Promise.all(formData.products.map(async (product) => {
                const selectedProduct = products.find((p) => p.name === product.productName)
    
                if (!selectedProduct) {
                    throw new Error('Selected product not found.')
                }
    
                const newQuantity = parseInt(product.quantity, 10)
    
                if (newQuantity > selectedProduct.quantity) {
                    throw new Error('Quantity exceeds available inventory.')
                }
    
                const updatedQuantity = selectedProduct.quantity - newQuantity
    
                await update(salesRef, {
                    [generateSaleKey()]: {
                        productName: product.productName,
                        quantity: product.quantity,
                        totalPrice: (selectedProduct.unitPrice * product.quantity).toFixed(2),
                        date: formData.date,
                        timeStamp: serverTimestamp(),
                    },
                })
                await update(ref(db, `products/${selectedProduct.key}`), { quantity: updatedQuantity })
            }))
    
            setConfirmationMessage(editMode ? 'Sale updated successfully.' : 'Sale added successfully.')
            setEditMode(false)
            setEditSaleId('')
            setShowForm(false)
            setFormData({
                products: [{ productName: '', quantity: '' }],
                date: getCurrentDate(),
            })
        } catch (err) {
            setErrorMessage(err.message)
            console.error('Error adding/updating sale: ', err)
        }
    }
    
    const handleEdit = (id) => {
        setEditSaleId(id);
        const saleToEdit = sales.find((sale) => sale.key === id);
        if (saleToEdit) {
            const productsForSale = saleToEdit.products.map(product => ({
                productName: product.productName,
                quantity: product.quantity,
            }));
    
            setFormData({
                products: productsForSale,
                date: saleToEdit.date,
            });
            setEditMode(true);
            setShowForm(true);
        } else {
            console.error('Sale not found with ID:', id);
        }
    };

    const handleDelete = (id) => {
        setEditSaleId(id)
        setShowDeleteConfirmation(true)
    }

    const confirmDelete = async () => {
        try {
            await remove(ref(db, 'sales/' + editSaleId))
            setConfirmationMessage('Sale deleted successfully.')
            console.log('Sale with ID ', editSaleId, ' successfully deleted')

            setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
        } catch (error) {
            setErrorMessage('Error deleting sale.')
            console.error('Error deleting sale: ', error)
        } finally {
            setEditSaleId('')
            setShowDeleteConfirmation(false)
        }
    }

    const handleCloseForm = () => {
        setFormData({
            products: [{ productName: '', quantity: '' }],
            totalPrice: '',
            date: getCurrentDate()
        })
        setEditMode(false)
        setEditSaleId('')
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

    const generateSaleKey = () => {
        return Math.floor(1000 + Math.random() * 9000).toString()
    }

    const handleAddProductField = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { productName: '', quantity: '' }]
        })
    }

    const handleRemoveProductField = (index) => {
        const updatedProducts = formData.products.filter((_, i) => i !== index)
        setFormData({
            ...formData,
            products: updatedProducts
        })
    }

    const handleProductChange = (index, e) => {
        const { name, value } = e.target
        const updatedProducts = [...formData.products]
        updatedProducts[index][name] = value
        setFormData({
            ...formData,
            products: updatedProducts
        })
    }

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Sales"/>
            <div className='px-3 position-relative'>
                {confirmationMessage && (
                    <div className="alert alert-success position-absolute top-0 start-50 translate-middle" role="alert" style={{ zIndex: 1070 }}>
                        {confirmationMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger position-absolute top-0 start-50 translate-middle" role="alert" style={{ zIndex: 1070 }}>
                        {errorMessage}
                    </div>
                )}
            </div>
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
                            <button onClick={() => setShowForm(true)} className="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#saleForm">Add Sale</button>
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
                                        <th scope='col'>Sales ID</th>
                                        <th scope='col'>Product Name</th>
                                        <th scope='col'>Quantity</th>
                                        <th scope='col'>Total Price</th>
                                        <th scope='col'>Date</th>
                                        <th scope='col'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='table-striped'>
                                {sales.filter(sale => {
                                    const saleDataString = Object.values(sale).join(' ').toLowerCase()
                                    return saleDataString.includes(searchQuery.toLowerCase())
                                })
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map(sale => (
                                    <tr key={sale.key}>
                                        <td>{sale.key}</td>
                                        <td>{sale.productName}</td>
                                        <td>{sale.quantity}</td>
                                        <td>{sale.totalPrice}</td>
                                        <td>{sale.date}</td>
                                        <td>
                                            <button onClick={() => handleEdit(sale.key)} className="btn btn-success me-2">Edit</button>
                                            <button onClick={() => handleDelete(sale.key)} className="btn btn-danger">Delete</button>
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
                <div className="modal fade show d-block" id="saleForm">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editMode ? 'Edit Sale' : 'Add Sale'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    {formData.products.map((product, index) => (
                                        <div key={index} className="mb-3">
                                            <select
                                                name="productName"
                                                value={product.productName}
                                                onChange={(e) => handleProductChange(index, e)}
                                                className="form-select mb-3"
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((p) => (
                                                    <option key={p.key} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={product.quantity}
                                                onChange={(e) => handleProductChange(index, e)}
                                                className="form-control mb-3"
                                                placeholder="Quantity"
                                                required
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => handleRemoveProductField(index)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="d-grid mb-3">
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={handleAddProductField}
                                        >
                                            Add Product
                                        </button>
                                    </div>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control mb-3" required />
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
                                Are you sure you want to delete this sale?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}    

export default Sales
