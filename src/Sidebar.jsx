import './Style.css'

function Sidebar() {
  return (
    <div className='bg-white p-2'>
        <div className='m-2'>
            <i className='bi bi-facebook me-3 fs-4'></i>
            <span className="brand-name fs-4">Fishbook</span>
        </div>
        <hr className='text-dark'/>
        <div className='list-group list-group-flush'>
            <a className='list-group-item py-2'>
                <i className='bi bi-speedometer2 fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Dashboard</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-table fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Products</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-receipt fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Sales</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-people fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Users</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-gear fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Settings</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-clipboard-data fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Reports</span>
            </a>
            <a className='list-group-item py-2'>
                <i className='bi bi-power fs-5 me-3'></i>
                <span className="d-none d-sm-inline">Logout</span>
            </a>
        </div>

    </div>
  )
}

export default Sidebar
