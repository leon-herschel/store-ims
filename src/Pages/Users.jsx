import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { ref, serverTimestamp, remove, update, onValue } from 'firebase/database'
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { useNavigate } from 'react-router-dom'

function Users({ Toggle }) {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
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
                setLoading(false)
            } else {
                setLoading(false)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault();
        
        try {
            const { email, password } = formData
            const usersRef = ref(db, 'users')
    
            if (editMode) {
                await update(ref(db, `users/${editUserId}`), {
                    name: formData.name,
                    access: formData.access,
                    timeStamp: serverTimestamp()
                })
                setConfirmationMessage('User updated successfully.')
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                const newUser = userCredential.user
                    
                await sendEmailVerification(newUser)
        
                await update(usersRef, {
                    [newUser.uid]: {
                        name: formData.name,
                        email: formData.email,
                        access: formData.access,
                        timeStamp: serverTimestamp()
                    }
                });
                setConfirmationMessage('User added successfully. Verification email sent.')
                setTimeout(async () => {
                    await signOut(auth)
                    navigate('/')
                }, 1000)
            }
        
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
            if (err.code === 'auth/email-already-in-use') {
                setErrorMessage('Email is already in use.')
            } else if (err.code === 'auth/weak-password') {
                setErrorMessage('Password should be at least 6 characters.')
            } else {
                setErrorMessage('Error adding/editing user.')
                console.error("Error adding/editing user: ", err)
            }
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
        setEditUserId(id)
        setShowDeleteConfirmation(true) 
    }
    
    const confirmDelete = async () => {
        try {
            const userToDeleteId = editUserId;
            await remove(ref(db, 'users/' + userToDeleteId))
            setConfirmationMessage('User data deleted successfully.')
            console.log("User with ID ", userToDeleteId, " successfully deleted")
        } catch (error) {
            setErrorMessage('Error deleting user data.')
            console.error("Error deleting user data: ", error)
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible)
    }

    const [passwordVisible, setPasswordVisible] = useState(false)

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

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Users"/>
            <div className='px-3 position-relative'>
                {confirmationMessage && (
                    <div className="alert alert-success position-absolute top-0 start-50 translate-middle" role="alert">
                        {confirmationMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger position-absolute top-0 start-50 translate-middle" role="alert">
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
                        <button onClick={() => setShowForm(true)} className="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#userForm">Add User</button>
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
                                    <th scope='col'>User ID</th>
                                    <th scope='col'>Name</th>
                                    <th scope='col'>Email</th>
                                    <th scope='col'>Access</th>
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
                </>
            )}
            </section>

            {showForm && (
                <div className="modal fade show d-block" id="userForm">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editMode ? 'Edit User' : 'Add User'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mb-3" placeholder="Name" required />
                                    <div className={`mb-3 ${editMode ? 'd-none' : ''}`}>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="Email" required autoComplete='off'/>
                                    </div>
                                    <select name="access" value={formData.access} onChange={handleChange} className="form-select mb-3" required>
                                        <option value="">Select Access</option>
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                    </select>
                                    <div className={`input-group mb-3 ${editMode ? 'd-none' : ''}`}>
                                        <input 
                                            name="password"  
                                            type={passwordVisible ? 'text' : 'password'} 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            className="form-control" 
                                            placeholder="Password" 
                                            required 
                                            autoComplete="new-password"
                                            disabled={editMode}
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                disabled={editMode}>
                                                <i className={`bi bi-${passwordVisible ? 'eye-slash-fill' : 'eye-fill'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-grid my-3 shadow">
                                        <button type="submit" className="btn btn-primary login-btn">{editMode ? 'Update' : 'Submit'}</button>
                                    </div>
                                    <small className={`text-muted ${editMode ? 'd-none' : 'd-flex justify-content-center'}`}>* You will be logged out upon submission.</small>
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
        </div>
    )
}

export default Users
