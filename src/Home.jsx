import LineChart from './Charts/LineChart'
import PieChart from './Charts/PieChart'
import Nav from './Nav'

function Home({Toggle}) {
  return (
    <div className='px-3'>
      <Nav Toggle={Toggle} pageTitle="Dashboard"/>
      <div className="container-fluid">
        <div className="row g-3 my-2">
            <div className="col-md-3 p-1">
                <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                    <div>
                        <h3 className='fs-2'>3</h3>
                        <p className='fs-5'>Products</p>
                    </div>
                    <i className="bi bi-cart-plus p-3 fs-1"></i>
                </div>
            </div>
            <div className="col-md-3 p-1">
                <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                    <div>
                        <h3 className='fs-2'>1</h3>
                        <p className='fs-5'>Low stock</p>
                    </div>
                    <i className="bi bi-cart-dash p-3 fs-1"></i>
                </div>
            </div>
            <div className="col-md-3 p-1">
                <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                    <div>
                        <h3 className='fs-2'>0</h3>
                        <p className='fs-5'>Out of Stock</p>
                    </div>
                    <i className="bi bi-cart-x p-3 fs-1"></i>
                </div>
            </div>
            <div className="col-md-3 p-1">
                <div className="p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                    <div>
                        <h3 className='fs-2'>40</h3>
                        <p className='fs-5'>Sales</p>
                    </div>
                <i className="bi bi-receipt p-3 fs-1"></i>
                </div>
            </div>
        </div>
      </div>
        <table class="table caption-top shadow-sm bg-white rounded overflow-hidden mt-2">
            <caption className="text-white fs-4">Inventory</caption>
            <thead>
                <tr>
                    <th scope="col">Item ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>Hooks</td>
                    <td>30</td>
                    <td>boxes</td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>Fishing Line</td>
                    <td>50</td>
                    <td>carbon fiber</td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>Fishing Rod</td>
                    <td>5</td>
                    <td>daiwa</td>
                </tr>
            </tbody>
        </table>
        <div className="row">
            <div className="col-12 col-md-8 p-3 my-2">
                <LineChart />
            </div>
            <div className="col-12 col-md-4 p-3 my-2">
                <PieChart />
            </div>
        </div>
    </div>
  )
}

export default Home
