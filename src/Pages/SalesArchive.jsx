import React, { useState, useEffect } from 'react'
import { ref, onValue, remove } from 'firebase/database'
import { db } from '../firebaseConfig'

function SalesArchive() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [editSaleId, setEditSaleId] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const salesArchiveRef = ref(db, 'salesArchive')

        const unsubscribeSales = onValue(salesArchiveRef, (snapshot) => {
            if (snapshot.exists()) {
                const salesArray = [];
                snapshot.forEach((childSnapshot) => {
                    salesArray.push({
                        key: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                setSales(salesArray)
                setLoading(false)
            } else {
                setLoading(false)
            }
        })

        return () => {
            unsubscribeSales()
        }
    }, [])

    const handleDelete = (id) => {
        setEditSaleId(id);
        setShowDeleteConfirmation(true)
    }

    const confirmDelete = async () => {
        try {
            await remove(ref(db, 'salesArchive/' + editSaleId))
            console.log('Sale with ID ', editSaleId, ' successfully deleted from archive')

            setSales((prevSales) => prevSales.filter((sale) => sale.key !== editSaleId))
        } catch (error) {
            setErrorMessage('Error deleting sale from archive.')
            console.error('Error deleting sale from archive: ', error)
        } finally {
            setEditSaleId('')
            setShowDeleteConfirmation(false)
        }
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className='px-3'>
            <h2 className="text-center mt-3">Sales Archive</h2>
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
                                <input 
                                    type="text" 
                                    className="form-control me-2" 
                                    placeholder="Search" 
                                    value={searchQuery} 
                                    onChange={handleSearchChange} 
                                />
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

            {showDeleteConfirmation && (
                <div className="modal fade show d-block" id="deleteConfirmationModal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirmation(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this sale from archive?
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

export default SalesArchive
