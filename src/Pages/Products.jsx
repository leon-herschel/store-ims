import Nav from '../Components/Navigation/Nav'
import { useState, useEffect } from 'react'
import { ref, onValue, remove, update, serverTimestamp } from 'firebase/database'
import { db, storage } from '../firebaseConfig'
import {ref as storageRef, uploadBytes, getDownloadURL, listAll} from "firebase/storage"
import UserAccessFetcher from '../UserAccessFetcher'
import { useAuth } from '../Components/Login/AuthContext'
import noImage from '../assets/noImage.svg'

function Products({ Toggle }) {
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const [editProductId, setEditProductId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        size: '',
        purchasePrice: '',
        retailPrice: '',
        quantity: '',
        picture: null 
    })
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { currentUser } = useAuth()
    const [userAccess, setUserAccess] = useState(null)

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
                productsArray.sort((a, b) => b.timeStamp - a.timeStamp)
                
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
                size: formData.size,
                purchasePrice: parseFloat(formData.purchasePrice).toFixed(2),
                retailPrice: parseFloat(formData.retailPrice).toFixed(2),
                quantity: formData.quantity,
                timeStamp: serverTimestamp(),
                picture: null
            }

            if (formData.picture) {
                const imageRef = storageRef(storage, `images/${formData.picture.name}`);
                await uploadBytes(imageRef, formData.picture);
                const downloadURL = await getDownloadURL(imageRef);
                productData.picture = downloadURL;
            }
    
            if (editMode) {
                await update(ref(db, `products/${editProductId}`), productData)
                setConfirmationMessage('Product updated successfully.')
            } else {
                let productKey = generateProductKey()
                while (products.some((product) => product.key === productKey)) {
                    productKey = generateProductKey()
                }
                await update(productsRef, {
                    [productKey]: productData
                })
                setConfirmationMessage('Product added successfully.')
            }
    
            setEditMode(false)
            setEditProductId('')
            setShowForm(false)
            setFormData({
                name: '',
                size: '',
                purchasePrice: '',
                retailPrice: '',
                quantity: '',
                picture: null
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
                size: productToEdit.size,
                purchasePrice: parseFloat(productToEdit.purchasePrice).toFixed(2),
                retailPrice: parseFloat(productToEdit.retailPrice).toFixed(2),
                quantity: productToEdit.quantity,
                picture: productToEdit.picture
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
            size: '',
            purchasePrice: '',
            retailPrice: '',
            quantity: '',
            picture: null
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

        if (e.target.type === 'file') {
            setFormData({
                ...formData,
                picture: e.target.files[0]
            })
        }
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
            <UserAccessFetcher currentUser={currentUser} setUserAccess={setUserAccess} />
            <Nav Toggle={Toggle} pageTitle="Products"/>
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
                            <div className="col-6">
                                <button onClick={() => setShowForm(true)} className="btn btn-primary newUser shadow" data-bs-toggle="modal" data-bs-target="#productForm">Add Product</button>
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
                                            <th scope='col'>Picture</th>
                                            <th scope='col'>Product Name</th>
                                            <th scope='col'>Size</th>
                                            <th scope='col'>Purchase Price</th>
                                            <th scope='col'>Retail Price</th>
                                            {userAccess !== "Member" && (
                                                <th scope='col'>Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className='table-striped'>
                                    {products.filter(product => {
                                        const productDataString = Object.values(product).join(' ').toLowerCase();
                                        return productDataString.includes(searchQuery.toLowerCase());
                                        }).map(product => (
                                            <tr key={product.key}>
                                                <td>{product.key}</td>
                                                <td>
                                                    {product.picture ? (<img src={product.picture} className='rounded' alt="Product" style={{ width: '100px', height: '100px' }} />):
                                                    (<><img src={noImage} alt="No Image" style={{ width: '100px', height: '100px' }} /></>)}
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.size}</td>
                                                <td>{product.purchasePrice}</td>
                                                <td>{product.retailPrice}</td>
                                                {userAccess !== "Member" && ( 
                                                <td>
                                                    <button onClick={() => handleEdit(product.key)} className="btn btn-success me-2">Edit</button>
                                                    <button onClick={() => handleDelete(product.key)} className="btn btn-danger">Delete</button>
                                                </td>
                                            )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    )}
            </section>

            {showForm && (
                <div className="modal fadein d-block shadow" id="productForm" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editMode ? 'Edit Product' : 'Add Product'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    <div className="form-floating">
                                        <input type="file" id="picture" name="picture" onChange={handleChange} className="form-control mb-3" accept="image/*" />
                                        <label htmlFor="picture">Product Picture</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="text" id="floatingInput" name="name" value={formData.name} onChange={handleChange} className="form-control mb-3" placeholder="Product Name" required />
                                        <label htmlFor="floatingInput">Product Name</label>
                                    </div>
                                    <div className="mb-3">
                                    <label className="form-label">Size:</label>
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            role='button'
                                            type="radio" 
                                            name="size" 
                                            value="Small" 
                                            checked={formData.size === "Small"} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <label className="form-check-label">Small</label>
                                    </div>
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            role='button'
                                            type="radio" 
                                            name="size" 
                                            value="Medium" 
                                            checked={formData.size === "Medium"} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <label className="form-check-label">Medium</label>
                                    </div>
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            role='button'
                                            type="radio" 
                                            name="size" 
                                            value="Large" 
                                            checked={formData.size === "Large"} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <label className="form-check-label">Large</label>
                                    </div>
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            role='button'
                                            type="radio" 
                                            name="size" 
                                            value="None" 
                                            checked={formData.size === "None"} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <label className="form-check-label">None</label>
                                    </div>
                                </div>
                                    <div className="form-floating">
                                        <input type="number" id="floatingInput" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="form-control mb-3" placeholder="Purchase Price" required />
                                        <label htmlFor="floatingInput">Purchase Price</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="number" id="floatingInput" name="retailPrice" value={formData.retailPrice} onChange={handleChange} className="form-control mb-3" placeholder="Retail Price" required />
                                        <label htmlFor="floatingInput">Retail Price</label>
                                    </div>
                                    {!editMode && 
                                    <div className="form-floating">
                                        <input type="number" id="floatingInput" name="quantity" value={formData.quantity} onChange={handleChange} className="form-control mb-3" placeholder="Quantity" required />
                                        <label htmlFor="floatingInput">Quantity</label>
                                    </div>}
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
                <div className="modal fadein d-block shadow" id="deleteConfirmationModal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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
        </div>
    )
}

export default Products
