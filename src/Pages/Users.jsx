import Nav from '../Nav'
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from '../firebaseConfig'

function Users({Toggle}) {
    

    const handleAdd = async (e) => {
        e.preventDefault()
        try{
        const res = await addDoc(collection(db, "cities"), {
        name: "Los Bananas",
        state: "CA",
        country: "USA",
        timeStamp: serverTimestamp()
        });
        }catch(err){
            console.log(err)
        }
    }

  return (
    <div className='px-3'>
      <Nav Toggle={Toggle} pageTitle="Users"/>
        <section class="p-3">
          <div class="row">
              <div class="col-12">
                  <button onClick = {handleAdd} class="btn btn-primary newUser" data-bs-toggle="modal" data-bs-target="#userForm">New User <i class="bi bi-people"></i></button>
              </div>
          </div>

          <div class="row">
              <div class="col-12">
                  <table class="table table-striped table-hover mt-3 text-center shadow-sm rounded overflow-hidden">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Picture</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Access</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody id="data"></tbody>
                  </table>
              </div>
          </div>

          </section>

          <div class="modal fade" id="userForm">
          <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">

                  <div class="modal-header">
                      <h4 class="modal-title">Fill the Form</h4>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>

                  <div class="modal-body">

                      <form action="#" id="myForm">

                          <div class="card imgholder">
                              <label for="imgInput" class="upload">
                                  <input type="file" name="" id="imgInput"/>
                                  <i class="bi bi-plus-circle-dotted"></i>
                              </label>
                              <img src="./image/Profile Icon.webp" alt="" width="200" height="200" class="img"/>
                          </div>

                          <div class="inputField">
                              <div>
                                  <label for="name">Name:</label>
                                  <input type="text" name="" id="name" required/>
                              </div>
                              <div>
                                  <label for="email">E-mail:</label>
                                  <input type="email" name="" id="email" required/>
                              </div>
                              <div>
                                  <label for="post">Access:</label>
                                  <input type="text" name="" id="post" required/>
                              </div>
                          </div>
                      </form>
                  </div>

                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="submit" form="myForm" class="btn btn-primary submit">Submit</button>
                  </div>
              </div>
          </div>
          </div>

          <div class="modal fade" id="readData">
          <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">

                  <div class="modal-header">
                      <h4 class="modal-title">Profile</h4>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>

                  <div class="modal-body">

                      <form action="#" id="myForm">

                          <div class="card imgholder">
                              <img src="" alt="User" width="200" height="200" class="showImg"/>
                          </div>

                          <div class="inputField">
                              <div>
                                  <label for="name">Name:</label>
                                  <input type="text" name="" id="showName" disabled />
                              </div>
                              <div>
                                  <label for="email">E-mail:</label>
                                  <input type="email" name="" id="showEmail" disabled />
                              </div>
                              <div>
                                  <label for="phone">Number:</label>
                                  <input type="text" name="" id="showPhone" minlength="11" maxlength="11" disabled />
                              </div>
                              <div>
                                  <label for="post">Post:</label>
                                  <input type="text" name="" id="showPost" disabled />
                              </div>
                              <div>
                                  <label for="sDate">Start Date:</label>
                                  <input type="date" name="" id="showsDate" disabled />
                              </div>
                          </div>

                      </form>
                  </div>
              </div>
          </div>
        </div>
    </div>
  )
}

export default Users
