import Nav from '../../Components/Navigation/Nav'
import ConfirmationModal from './ConfirmationModal'
import { useState, useEffect} from 'react'
import { ref, remove, update, set, get} from 'firebase/database'
import { db } from '../../firebaseConfig'

function Sales({ Toggle }) {
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [editSaleId, setEditSaleId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false)
    const [showUndoConfirmation, setShowUndoConfirmation] = useState(false)
    const [showUnarchiveConfirmation, setShowUnarchiveConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [viewMode, setViewMode] = useState('active')
    const [showDeleteByDateModal, setShowDeleteByDateModal] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [archiveStartDate, setArchiveStartDate] = useState('')
    const [archiveEndDate, setArchiveEndDate] = useState('')
    const [showArchiveByDateModal, setShowArchiveByDateModal] = useState(false)
    const [formData, setFormData] = useState({
        products: [], 
        totalPrice: 0, 
      })

      useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            const salesSnapshot = await get(ref(db, viewMode === 'active' ? 'sales' : 'salesArchive'))
            if (salesSnapshot.exists()) {
                const salesArray = []
                salesSnapshot.forEach((childSnapshot) => {
                    salesArray.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                setSales(salesArray)
            } else {
                setSales([])
            }

            const productsSnapshot = await get(ref(db, 'products'))
            if (productsSnapshot.exists()) {
                const productsArray = []
                productsSnapshot.forEach((childSnapshot) => {
                    productsArray.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                setProducts(productsArray)
            } else {
                setProducts([])
            }

            setLoading(false)
        }

        fetchData()
    }, [viewMode])

    const handleViewModeChange = (e) => {
        setViewMode(e.target.value)
        setSearchQuery('')
    }

    const getCurrentDateTime = () => {
        const currentDate = new Date()

        const optionsDate = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
        }

        const formattedDate = currentDate.toLocaleDateString('en-US', optionsDate)

        const optionsTime = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
        }

        const formattedTime = currentDate.toLocaleTimeString('en-US', optionsTime)

        return `${formattedDate} ${formattedTime}`
    }

    const handleAdd = async (e) => {
        e.preventDefault()
    
        try {
            if (formData.products.length === 0) {
                return setErrorMessage('Please select at least one product.')
            }
            const saleKey = generateSaleKey()
            const salesRef = ref(db, `sales/${saleKey}`)
            const productsRef = ref(db, 'products')
    
            const saleData = {
                dateTime: getCurrentDateTime(),
                totalPrice: 0,
                products: [],
            }
    
            for (const productItem of formData.products) {
                const selectedProduct = products.find((product) => product.name === productItem.productName)
    
                if (!selectedProduct) {
                    return setErrorMessage('Selected product not found.')
                }
    
                if (productItem.quantity > selectedProduct.quantity) {
                    return setErrorMessage('Quantity exceeds available inventory.')
                }
    
                saleData.products.push({
                    productName: productItem.productName,
                    quantity: productItem.quantity,
                    totalPrice: selectedProduct.unitPrice * productItem.quantity,
                })
    
                saleData.totalPrice += saleData.products[saleData.products.length - 1].totalPrice
    
                await update(ref(db, `products/${selectedProduct.key}`), {
                    quantity: selectedProduct.quantity - productItem.quantity,
                })
            }
    
            await set(salesRef, saleData)
    
            setConfirmationMessage('Sale added successfully.')
            setShowForm(false)
            setFormData({
                products: [],
                totalPrice: 0,
            })

            setSales((prevSales) => [...prevSales, { key: saleKey, ...saleData }])
        } catch (err) {
            console.error('Error adding/updating sale: ', err)
        }
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setFormData({
          products: [], 
          totalPrice: 0,
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

    const handleAddProduct = () => {
        const newProductName = document.querySelector('[name="newProductName"]').value
        const newQuantity = parseInt(document.querySelector('[name="newQuantity"]').value, 10)
      
        if (!newProductName || !newQuantity) {
          return setErrorMessage('Please fill in all required fields.')
        }

        const selectedProduct = products.find((product) => product.name === newProductName)
        if (!selectedProduct) {
            return setErrorMessage('Selected product not found.')
        }

        if (newQuantity > selectedProduct.quantity) {
            return setErrorMessage('Quantity exceeds available inventory.')
        }
      
        setFormData((prevData) => ({
          ...prevData,
          products: [...prevData.products, { productName: newProductName, quantity: newQuantity }],
        }))
      
        document.querySelector('[name="newProductName"]').value = '';
        document.querySelector('[name="newQuantity"]').value = '';
      }

      const handleRemoveProduct = (indexToRemove) => {
        setFormData((prevData) => ({
            ...prevData,
            products: prevData.products.filter((_, index) => index !== indexToRemove),
        }))
    }

    const handleUndo = (id) => {
        setEditSaleId(id)
        setShowUndoConfirmation(true)
    }

    const confirmUndo = async () => {
        try {
            const saleToReverse = sales.find((sale) => sale.key === editSaleId)
            if (saleToReverse) {
                for (const productItem of saleToReverse.products) {
                    const selectedProduct = products.find((product) => product.name === productItem.productName)
                    if (selectedProduct) {
                        await update(ref(db, `products/${selectedProduct.key}`), {
                            quantity: selectedProduct.quantity + Number(productItem.quantity),
                        })
                    }
                }
                await remove(ref(db, `sales/${editSaleId}`))
                setConfirmationMessage('Sale reversed successfully.')
                setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
            } else {
                console.error('Sale not found with ID:', editSaleId)
            }
        } catch (error) {
            console.error('Error reversing transaction: ', error)
            setErrorMessage('Error reversing transaction.')
        } finally {
            setEditSaleId('')
            setShowUndoConfirmation(false)
        }
    }

    const handleArchive = (id) => {
        setEditSaleId(id)
        setShowArchiveConfirmation(true)
    }

    const confirmArchive = async () => {
    try {
        const saleToArchive = sales.find((sale) => sale.key === editSaleId)

        if (saleToArchive) {
            const archiveSaleRef = ref(db, `salesArchive/${editSaleId}`)
            const { key, ...saleDataWithoutKey } = saleToArchive
            await set(archiveSaleRef, saleDataWithoutKey)
            await remove(ref(db, `sales/${editSaleId}`))

            setConfirmationMessage('Sale archived successfully.')
            setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
        } else {
            console.error('Sale not found with ID:', editSaleId)
        }
        } catch (error) {
            console.error('Error archiving sale: ', error)
            setErrorMessage('Error archiving sale.')
        } finally {
            setEditSaleId('')
            setShowArchiveConfirmation(false)
        }
    }

    const handleDelete = (id) => {
        setEditSaleId(id);
        setShowDeleteConfirmation(true)
    }

    const confirmDelete = async () => {
        try {
            await remove(ref(db, 'salesArchive/' + editSaleId))
            console.log('Sale with ID ', editSaleId, ' successfully deleted from archive')

            setConfirmationMessage('Sale deleted successfully.')
            setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
        } catch (error) {
            setErrorMessage('Error deleting sale from archive.')
            console.error('Error deleting sale from archive: ', error)
        } finally {
            setEditSaleId('')
            setShowDeleteConfirmation(false)
        }
    }

    const handleUnarchive = (id) => {
        setEditSaleId(id)
        setShowUnarchiveConfirmation(true)
    }

    const confirmUnarchive = async () => {
        try {
            const saleToUnarchive = sales.find((sale) => sale.key === editSaleId)
    
            if (saleToUnarchive) {
                const salesRef = ref(db, `sales/${editSaleId}`)
                const { key, ...saleDataWithoutKey } = saleToUnarchive
                await set(salesRef, saleDataWithoutKey)
    
                const archiveSaleRef = ref(db, `salesArchive/${editSaleId}`)
                await remove(archiveSaleRef)
    
                setConfirmationMessage('Sale restored successfully.')
                setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
            } else {
                console.error('Sale not found with ID:', editSaleId)
            }
        } catch (error) {
            console.error('Error restoring sale: ', error)
            setErrorMessage('Error restoring sale.')
        } finally {
            setEditSaleId('')
            setShowUnarchiveConfirmation(false)
        }
    }
    
    const handleDeleteByDateRange = async () => {
        try {
            const salesToDelete = sales.filter((sale) => {
                const saleDate = new Date(sale.dateTime)
                const startDateObj = new Date(startDate)
                const endDateObj = new Date(endDate)
    
                // Set time component of the dates to midnight
                startDateObj.setHours(0, 0, 0, 0)
                endDateObj.setHours(23, 59, 59, 999)
    
                return saleDate >= startDateObj && saleDate <= endDateObj
            })
    
            for (const sale of salesToDelete) {
                await remove(ref(db, `salesArchive/${sale.key}`))
            }

            setConfirmationMessage('Sales deleted successfully.')
            setSales((prevSales) => prevSales.filter((sale) => !salesToDelete.find((s) => s.key === sale.key)))
            
        } catch (error) {
            console.error('Error deleting data by date range:', error)
        } finally {
            setShowDeleteByDateModal(false)
        }
    }
    
    const handleArchiveByDateRange = async () => {
        try {
            const salesToArchive = sales.filter((sale) => {
                const saleDate = new Date(sale.dateTime)
                const startDateObj = new Date(archiveStartDate)
                const endDateObj = new Date(archiveEndDate)
    
                startDateObj.setHours(0, 0, 0, 0)
                endDateObj.setHours(23, 59, 59, 999)
    
                return saleDate >= startDateObj && saleDate <= endDateObj
            })
    
            for (const sale of salesToArchive) {
                const archiveSaleRef = ref(db, `salesArchive/${sale.key}`)
                const { key, ...saleDataWithoutKey } = sale
                await set(archiveSaleRef, saleDataWithoutKey)
                await remove(ref(db, `sales/${sale.key}`))
            }
    
            setConfirmationMessage('Sales archived successfully.')
            setSales((prevSales) => prevSales.filter((sale) => !salesToArchive.find((s) => s.key === sale.key)))
        } catch (error) {
            console.error('Error archiving sales by date range:', error)
        } finally {
            setShowArchiveByDateModal(false)
        }
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
                            {viewMode === 'active' && formData ? (
                                <button onClick={() => setShowForm(true)} className="btn btn-primary newUser me-2 shadow" data-bs-toggle="modal" data-bs-target="#saleForm">Add Sale</button>
                            ) : null}
                            {viewMode === 'active' ? (
                                <button onClick={() => setShowArchiveByDateModal(true)} className="btn btn-danger me-2 shadow">
                                    Archive by Date
                                </button>
                            ) : (
                                <button onClick={() => setShowDeleteByDateModal(true)} className="btn btn-danger me-2 shadow">
                                    Delete by Date
                                </button>
                            )}
                            </div>
                            <div className="col-6 d-flex justify-content-end">
                            <div className="row">
                                <div className="col-12">
                                        <select
                                            className="form-select"
                                            value={viewMode}
                                            onChange={handleViewModeChange}
                                        >
                                            <option value="active">Active Sales</option>
                                            <option value="archive">Archived Sales</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="w-50 ms-2">
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
                                            <th scope='col'>DateTime</th>
                                            <th scope='col'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='table-striped'>
                                    {sales
                                    .filter(sale => {
                                        const saleDataString = Object.values(sale).join(' ').toLowerCase()
                                        return saleDataString.includes(searchQuery.toLowerCase())
                                    })
                                    .slice().sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
                                    .map(sale => (
                                        <tr key={sale.key}>
                                            <td>{sale.key}</td>
                                            <td>
                                                {sale.products.map((product, index) => (
                                                    <div key={index}>
                                                        <p>{product.productName}</p>
                                                    </div>
                                                ))}
                                            </td>
                                            <td>
                                                {sale.products.map((product, index) => (
                                                    <div key={index}>
                                                        <p>{product.quantity}</p>
                                                    </div>
                                                ))}
                                            </td>
                                            <td>{sale.totalPrice.toFixed(2)}</td>
                                            <td>{sale.dateTime}</td>
                                            <td>
                                                {viewMode === 'archive' ? (
                                                    <>
                                                    <button onClick={() => handleUnarchive(sale.key)} className="btn btn-success me-2">Unarchive</button>
                                                    <button onClick={() => handleDelete(sale.key)} className="btn btn-danger">Delete</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleUndo(sale.key)} className="btn btn-success me-2">Undo</button>
                                                        <button onClick={() => handleArchive(sale.key)} className="btn btn-danger">Archive</button>
                                                    </>
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

            {showForm && (
            <div className="modal fade show d-block" id="saleForm" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">Add Sale</h5>
                    <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                    </div>
                    <div className="modal-body d-flex justify-content-center align-items-center">
                    <form onSubmit={handleAdd} className="w-75">
                        {formData.products.map((productItem, index) => (
                            <div key={index} className="mb-3 d-flex align-items-center">
                            <div className="flex-grow-1 me-2 w-75">
                                <div className="form-control">{productItem.productName}</div>
                            </div>
                            <div className="flex-grow-1 me-2 w-25">
                                <div className="form-control">{productItem.quantity}</div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => handleRemoveProduct(index)}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Remove Product"
                            >
                                <i className="bi bi-trash" />
                            </button>
                        </div>
                        ))}
                        <div className="d-flex mb-3">
                        <select name="newProductName" className="form-select me-2" >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                            <option key={product.key} value={product.name}>
                                {product.name}
                            </option>
                            ))}
                        </select>
                        <input type="number" name="newQuantity" className="form-control" placeholder="Quantity" />
                        <button type="button" className="btn btn-success ms-2" onClick={handleAddProduct} data-bs-toggle="tooltip" data-bs-placement="top" title="Add Product">
                            <i className='bi bi-plus-lg'></i>
                        </button>
                        </div>
                        <div className="d-grid my-3 shadow">
                        <button type="submit" className="btn btn-primary login-btn">
                            Submit
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                </div>
            </div>
            )}

            {showArchiveByDateModal && (
                <div className='modal fade show d-block' style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Select Date Range</h5>
                                <button type='button' className='btn-close' onClick={() => setShowArchiveByDateModal(false)} aria-label='Close'></button>
                            </div>
                            <div className='modal-body'>
                                <div className='form-group'>
                                    <label htmlFor='archiveStartDate'>Start Date:</label>
                                    <input
                                        type='date'
                                        className="form-control"
                                        id='archiveStartDate'
                                        value={archiveStartDate}
                                        onChange={(e) => setArchiveStartDate(e.target.value)}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='archiveEndDate'>End Date:</label>
                                    <input
                                        type='date'
                                        className="form-control"
                                        id='archiveEndDate'
                                        value={archiveEndDate}
                                        onChange={(e) => setArchiveEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' onClick={() => setShowArchiveByDateModal(false)}>Close</button>
                                <button type='button' className='btn btn-danger' onClick={handleArchiveByDateRange}>Archive</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}                   

            {showDeleteByDateModal && (
                <div className='modal fade show d-block' style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Select Date Range</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => setShowDeleteByDateModal(false)}
                                    aria-label='Close'
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <div className='form-group'>
                                    <label htmlFor='startDate'>Start Date:</label>
                                    <input
                                        type='date'
                                        className="form-control"
                                        id='startDate'
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='endDate'>End Date:</label>
                                    <input
                                        type='date'
                                        className="form-control"
                                        id='endDate'
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    type='button'
                                    className='btn btn-secondary'
                                    onClick={() => setShowDeleteByDateModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-danger'
                                    onClick={handleDeleteByDateRange}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                show={showArchiveConfirmation}
                onClose={() => setShowArchiveConfirmation(false)}
                onConfirm={() => confirmArchive(editSaleId)}
                title="Confirm Archive"
                message="Are you sure you want to archive this sale?"
                confirmButtonText="Archive"
            />

            <ConfirmationModal
                show={showUndoConfirmation}
                onClose={() => setShowUndoConfirmation(false)}
                onConfirm={confirmUndo}
                title="Confirm Undo"
                message="Undo this sale and restore inventory quantities?"
                confirmButtonText="Undo"
            />

            <ConfirmationModal
                show={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this sale?"
                confirmButtonText="Delete"
            />

            <ConfirmationModal
                show={showUnarchiveConfirmation}
                onClose={() => setShowUnarchiveConfirmation(false)}
                onConfirm={confirmUnarchive}
                title="Confirm Unarchive"
                message="Are you sure you want to unarchive this sale?"
                confirmButtonText="Unarchive" 
            />

        </div>
    )
}

export default Sales
