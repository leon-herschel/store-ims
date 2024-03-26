import Nav from '../Components/Navigation/Nav';
import ProductSalesBarChart from '../Components/Charts/ProductSalesBarChart';
import YearlyLineChart from '../Components/Charts/YearlyLineChart';
import { useState } from 'react';

function Reports({ Toggle }) {
    const [isChartExpanded, setIsChartExpanded] = useState(false);

    const toggleChartSize = () => {
        setIsChartExpanded(!isChartExpanded);
    };

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Reports" />
            <section className="p-3 fadein">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-6">
                            <h2 className='text-white fs-4'>Monthly Sales Trends</h2>
                            <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={toggleChartSize}>
                                <div className={`mx-auto ${isChartExpanded ? 'chart-expanded' : ''}`}>
                                    <YearlyLineChart />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h2 className='text-white fs-4'>Product Sales Distribution</h2>
                            <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={toggleChartSize}>
                                <div className={`mx-auto ${isChartExpanded ? 'chart-expanded' : ''}`}>
                                    <ProductSalesBarChart />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Reports;
