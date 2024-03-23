import Nav from '../Components/Navigation/Nav'
import LineChart from '../Components/Charts/LineChart'

function Reports({Toggle}) {
  return (
    <div className='px-3'>
      <Nav Toggle={Toggle} pageTitle="Reports"/>
      <div className="container-fluid">
        <div className="row">
            <div className="col-12 p-3 my-2 shadow">
                {/*<LineChart />*/}
            </div>
          </div>
      </div>
    </div>
  )
  }

  export default Reports