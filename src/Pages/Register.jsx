import { useState, useEffect } from 'react'
import { ref, push, onValue, update } from 'firebase/database'
import { db } from '../firebaseConfig'
import UserAccessFetcher from '../UserAccessFetcher'
import { useAuth } from '../Components/Login/AuthContext'
import Nav from '../Components/Navigation/Nav'

function Register({ Toggle }) {
    const [products, setProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [totalPrice, setTotalPrice] = useState(0)
    const { currentUser } = useAuth()
    const [userAccess, setUserAccess] = useState(null)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const productsRef = ref(db, 'products')
        onValue(productsRef, (snapshot) => {
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
    }, [])

    const handleAddProduct = (product) => {
        if (product.quantity > 0) {
            setSelectedProducts(prevSelectedProducts => [
                ...prevSelectedProducts,
                { product: product, quantity: 1 }
            ])
        } else {
            setErrorMessage(`${product.name} is out of stock.`)
        }
    }

    const handleRemoveProduct = (index) => {
        setSelectedProducts(prevSelectedProducts => [
            ...prevSelectedProducts.slice(0, index),
            ...prevSelectedProducts.slice(index + 1)
        ])
    }

    const handleChangeQuantity = (index, quantity) => {
        setSelectedProducts(prevSelectedProducts => {
            const updatedProducts = [...prevSelectedProducts]
            updatedProducts[index].quantity = quantity
            return updatedProducts
        })
    }

    useEffect(() => {
        let totalPrice = 0
        selectedProducts.forEach(selectedProduct => {
            totalPrice += selectedProduct.product.retailPrice * selectedProduct.quantity
        })
        setTotalPrice(totalPrice)
    }, [selectedProducts])

    const generateSaleKey = () => {
        return Math.floor(1000 + Math.random() * 9000).toString()
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

    const handleSubmitTransaction = async () => {
        try {
            if (selectedProducts.length === 0) {
                setErrorMessage('Please select at least one product before submitting.')
                return
            }

            let exceedsInventory = false
    
            selectedProducts.forEach(selectedProduct => {
                if (selectedProduct.quantity > selectedProduct.product.quantity) {
                    exceedsInventory = true
                    setErrorMessage(`Quantity entered for ${selectedProduct.product.name} exceeds available inventory.`)
                    return
                }
            })
    
            if (exceedsInventory) {
                return
            }
    
            const dateTime = getCurrentDateTime()
            const salesRef = ref(db, 'sales')
            const newSalesRef = push(salesRef)
            const newSalesKey = generateSaleKey()
    
            const transactionData = {
                dateTime: dateTime,
                products: selectedProducts.map(selectedProduct => ({
                    productName: selectedProduct.product.name,
                    quantity: selectedProduct.quantity,
                    totalPrice: selectedProduct.product.retailPrice * selectedProduct.quantity
                })),
                totalPrice: totalPrice
            }
    
            const updates = {}
            updates[`sales/${newSalesKey}`] = transactionData
    
            const inventoryUpdates = {}
            selectedProducts.forEach(selectedProduct => {
                const productRef = ref(db, `products/${selectedProduct.product.key}`)
                const newQuantity = selectedProduct.product.quantity - selectedProduct.quantity
                inventoryUpdates[`products/${selectedProduct.product.key}/quantity`] = newQuantity
            })
    
            await Promise.all([
                update(ref(db), updates),
                update(ref(db), inventoryUpdates)
            ])
    
            setSelectedProducts([])
            setTotalPrice(0)
            setConfirmationMessage('Transaction submitted successfully.')
        } catch (error) {
            console.error('Error submitting transaction:', error)
            setErrorMessage('Error submitting transaction. Please try again.')
        }
    }
     
    return (
        <div className='px-3'>
            <UserAccessFetcher currentUser={currentUser} setUserAccess={setUserAccess} />
            <Nav Toggle={Toggle} pageTitle="Sales Register"/>
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
            <div className="row p-3 fadein">
                <div className="col-md-6">
                    <h4 className='text-light'>Available Products:</h4>
                    <div className="row row-cols-2 g-3">
                        {products.map(product => (
                            <div key={product.key} className="col">
                                <div className="card p-3" style={{ height: '100%' }}>
                                    <img className="card-img-top mx-auto" src={product.picture} alt={product.name} style={{ height: "200px", width:"200px" }}/>
                                    <div className="card-body text-center">
                                        <h5 className="card-title">{product.name}</h5>
                                        <button className="btn btn-primary mt-1" onClick={() => handleAddProduct(product)}>Add</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-6">
                    <h4 className='text-light'>Selected Products:</h4>
                    <div>
                        {selectedProducts.map((selectedProduct, index) => (
                            <div key={index} className="card mb-3 fadein">
                                <div className="card-body">
                                    <h5 className="card-title">{selectedProduct.product.name}</h5>
                                    <input
                                        type="number"
                                        value={selectedProduct.quantity}
                                        onChange={(e) => handleChangeQuantity(index, parseInt(e.target.value))}
                                        className="form-control mb-2"
                                        placeholder="Quantity"
                                    />
                                    <button className="btn btn-danger" onClick={() => handleRemoveProduct(index)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-light fs-5">Total Price: ₱{totalPrice.toFixed(2)}</div>
                    <div className="mt-3">
                        <button className="btn btn-success" onClick={handleSubmitTransaction}>Submit Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
