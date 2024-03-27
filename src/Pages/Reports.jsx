import Nav from '../Components/Navigation/Nav'
import ProductSalesBarChart from '../Components/Charts/ProductSalesBarChart'
import YearlyLineChart from '../Components/Charts/YearlyLineChart'
import { useState } from 'react'

function Reports({ Toggle }) {
    const [isMonthlyChartExpanded, setIsMonthlyChartExpanded] = useState(false)
    const [isProductChartExpanded, setIsProductChartExpanded] = useState(false)

    const toggleChartSize = (chartType) => {
        if (chartType === 'monthly') {
            setIsMonthlyChartExpanded(!isMonthlyChartExpanded)
            setIsProductChartExpanded(false)
        } else if (chartType === 'product') {
            setIsProductChartExpanded(!isProductChartExpanded)
            setIsMonthlyChartExpanded(false)
        }
    };

    return (
        <div className='px-3'>
            <Nav Toggle={Toggle} pageTitle="Reports" />
            <section className="p-3 fadein">
                <div className="container-fluid">
                    <div className="row">
                        {isMonthlyChartExpanded && (
                            <div className="col-12">
                                <h2 className='text-white fs-4'>Monthly Sales Trends</h2>
                                <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={() => toggleChartSize('monthly')}>
                                    <YearlyLineChart />
                                </div>
                            </div>
                        )}
                        {isProductChartExpanded && (
                            <div className="col-12">
                                <h2 className='text-white fs-4'>Product Sales Distribution</h2>
                                <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={() => toggleChartSize('product')}>
                                    <ProductSalesBarChart />
                                </div>
                            </div>
                        )}
                        {!isMonthlyChartExpanded && !isProductChartExpanded && (
                            <>
                                <div className="col-6">
                                    <h2 className='text-white fs-4'>Monthly Sales Trends</h2>
                                    <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={() => toggleChartSize('monthly')}>
                                        <YearlyLineChart />
                                    </div>
                                </div>
                                <div className="col-6">
                                    <h2 className='text-white fs-4'>Product Sales Distribution</h2>
                                    <div className="text-center p-3 my-2 shadow bg-white rounded" onClick={() => toggleChartSize('product')}>
                                        <ProductSalesBarChart />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Reports
