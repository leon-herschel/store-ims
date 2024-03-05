import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { ref, set, serverTimestamp, get, remove, push, update, onValue } from 'firebase/database'
import { db } from '../firebaseConfig'

function Products({ Toggle }) {
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editUserId, setEditUserId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        access: '',
        password: ''
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const usersRef = ref(db, 'users')
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersArray = []
                snapshot.forEach(childSnapshot => {
                    usersArray.push({
                        key: childSnapshot.key, 
                        ...childSnapshot.val()
                    })
                })
                setUsers(usersArray)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
      
        try {
            const usersRef = ref(db, 'users');
      
            await update(usersRef, {
                [editMode ? editUserId : push(usersRef).key]: {
                    name: formData.name,
                    email: formData.email,
                    access: formData.access,
                    password: formData.password, 
                    timeStamp: serverTimestamp()
                }
            });
            setConfirmationMessage(editMode ? 'User updated successfully.' : 'User added successfully.')
            setEditMode(false)
            setEditUserId('')
            setShowForm(false)
            setFormData({
                name: '',
                email: '',
                access: '',
                password: ''
            });
        } catch (err) {
            setErrorMessage('Error adding/editing user.')
            console.error("Error adding/editing document: ", err)
        }
    }
      
    const handleEdit = (id) => {
        setEditUserId(id)
        const userToEdit = users.find(user => user.key === id)
        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                access: userToEdit.access,
                password: userToEdit.password
            });
            setEditMode(true)
            setShowForm(true)
        } else {
            console.error("User not found with ID:", id)
        }
    }
    
    const handleDelete = (id) => {
        setEditUserId(id); 
        setShowDeleteConfirmation(true) 
    }
    
    const confirmDelete = async () => {
        try {
            await remove(ref(db, 'users/' + editUserId))
            setConfirmationMessage('User deleted successfully.')
            console.log("User with ID ", editUserId, " successfully deleted")
        } catch (error) {
            setErrorMessage('Error deleting user.')
            console.error("Error deleting user: ", error)
        } finally {
            setEditUserId('')
            setShowDeleteConfirmation(false)
        }
    }

    const handleCloseForm = () => {
        setFormData({
            name: '',
            email: '',
            access: '',
            password: ''
        })
        setEditMode(false)
        setEditUserId('')
        setShowForm(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const [passwordVisible, setPasswordVisible] = useState(false)

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible)
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
            <Nav Toggle={Toggle} pageTitle="Users"/>
            <section className="p-3">
                <div className="row d-flex">
                    <div className="col-6">
                        <button onClick={() => setShowForm(true)} className="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#userForm">Add Product</button>
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
                                    <th scope='col'>Email</th>
                                    <th scope='col'>Role</th>
                                    <th scope='col'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='table-striped'>
                            {users.filter(user => {
                                const userDataString = Object.values(user).join(' ').toLowerCase();
                                return userDataString.includes(searchQuery.toLowerCase());
                                }).map(user => (
                                    <tr key={user.key}>
                                        <td>{user.key}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.access}</td>
                                        <td>
                                            <button onClick={() => handleEdit(user.key)} className="btn btn-success me-2">Edit</button>
                                            <button onClick={() => handleDelete(user.key)} className="btn btn-danger">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {showForm && (
                <div className="modal fade show d-block" id="userForm">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editMode ? 'Edit Product' : 'Add Product'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mb-3" placeholder="Name" required />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control mb-3" placeholder="Email" required autoComplete='off'/>
                                    <select name="access" value={formData.access} onChange={handleChange} className="form-select mb-3" required>
                                        <option value="">Select Role</option>
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                    </select>
                                    <div className="input-group">
                                        <input 
                                            name="password"  
                                            type={passwordVisible ? 'text' : 'password'} 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            className="form-control mb-3" 
                                            placeholder="Password" 
                                            required 
                                            autoComplete="new-password"
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={togglePasswordVisibility}>
                                                <i className={`bi bi-${passwordVisible ? 'eye-slash-fill' : 'eye-fill'}`} />
                                            </button>
                                        </div>
                                    </div>
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
                                Are you sure you want to delete this user?
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
