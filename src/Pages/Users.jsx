import Nav from '../Nav'
import { useState, useEffect } from 'react'
import { collection, doc, setDoc, serverTimestamp, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { v4 as uuid } from "uuid"

function Users({ Toggle }) {
    const unique_id = uuid()
    const small_id = unique_id.slice(0, 5)
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editUserId, setEditUserId] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        access: '',
        password: ''
    })
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            if (editMode) {
                await updateDoc(doc(db, 'users', editUserId), {
                    name: formData.name,
                    email: formData.email,
                    access: formData.access,
                    password: formData.password,
                    timeStamp: serverTimestamp()
                })
                setConfirmationMessage('User updated successfully.')
                setEditMode(false)
                setEditUserId('')
            } else {
                await setDoc(doc(db, "users", small_id), {
                    name: formData.name,
                    email: formData.email,
                    access: formData.access,
                    password: formData.password,
                    timeStamp: serverTimestamp()
                })
                setConfirmationMessage('User added successfully.')
            }
            setShowForm(false)
            setFormData({
                name: '',
                email: '',
                access: '',
                password: ''
            })
        } catch (err) {
            setErrorMessage('Error adding/editing user.')
            console.error("Error adding/editing document: ", err)
        }
    }

    const handleEdit = (id) => {
        const userToEdit = users.find(user => user.id === id)
        setFormData({
            name: userToEdit.name,
            email: userToEdit.email,
            access: userToEdit.access,
            password: userToEdit.password
        })
        setEditMode(true)
        setEditUserId(id)
        setShowForm(true)
    }

    const handleDelete = (id) => {
        setEditUserId(id)
        setShowDeleteConfirmation(true)
    }

    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'users', editUserId))
            setConfirmationMessage('User deleted successfully.')
            console.log("Document with ID ", editUserId, " successfully deleted")
        } catch (error) {
            setErrorMessage('Error deleting user.')
            console.error("Error deleting document: ", error)
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

    useEffect(() => {
        const getUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'))
                const usersData = []
                querySnapshot.forEach((doc) => {
                    usersData.push({ id: doc.id, ...doc.data() })
                })
                setUsers(usersData)
            } catch (error) {
                setErrorMessage('Error fetching users.')
                console.error("Error fetching users: ", error)
            }
        }

        getUsers()
    }, [])

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

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Users"/>
            <section className="p-3">
                <div className="row">
                    <div className="col-12">
                        <button onClick={() => setShowForm(true)} className="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#userForm">Add User</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <table className="table table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
                            <thead>
                                <tr>
                                    <th scope='col'>ID</th>
                                    <th scope='col'>Name</th>
                                    <th scope='col'>Email</th>
                                    <th scope='col'>Access</th>
                                    <th scope='col'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='table-striped'>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.access}</td>
                                        <td>
                                            <button onClick={() => handleEdit(user.id)} className="btn btn-success me-2">Edit</button>
                                            <button onClick={() => handleDelete(user.id)} className="btn btn-danger">Delete</button>
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
                                <h5 className="modal-title">{editMode ? 'Edit User' : 'Add User'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm} aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center align-items-center">
                                <form onSubmit={handleAdd} className="w-75">
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control mb-3" placeholder="Name" required />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control mb-3" placeholder="Email" required autoComplete='off'/>
                                    <select name="access" value={formData.access} onChange={handleChange} className="form-select mb-3" required>
                                        <option value="">Select Access</option>
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

export default Users
