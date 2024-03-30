import { useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebaseConfig'

function UserAccessFetcher({ currentUser, setUserAccess }) {
  useEffect(() => {
    const fetchUserAccess = () => {
      try {
        if (currentUser) {
          const uid = currentUser.uid
          const userRef = ref(db, `users/${uid}/access`)
          onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const access = snapshot.val()
              setUserAccess(access)
            } else {
              console.error('User access data does not exist.')
            }
          })
        }
      } catch (error) {
        console.error('Error fetching user access:', error)
      }
    }

    if (db && currentUser) {
      fetchUserAccess()
    }
  }, [currentUser, setUserAccess])

  return null
}

export default UserAccessFetcher