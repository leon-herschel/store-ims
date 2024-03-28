import Nav from '../Components/Navigation/Nav'
import ProductSalesBarChart from '../Components/Charts/ProductSalesBarChart'
import YearlyLineChart from '../Components/Charts/YearlyLineChart'
import { useState, useEffect } from 'react'

function Reports({ Toggle }) {
    const [isMonthlyChartExpanded, setIsMonthlyChartExpanded] = useState(false)
    const [isProductChartExpanded, setIsProductChartExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false)
        }, 200) 
        return () => clearTimeout(timeout)
    }, [])

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
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                            <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {isMonthlyChartExpanded && (
                                <div className="col-12">
                                    <h2 className='text-white fs-4'>Monthly Sales Trends</h2>
                                    <div className="text-center p-3 my-2 shadow bg-white rounded fadein" onClick={() => toggleChartSize('monthly')}>
                                        <YearlyLineChart />
                                    </div>
                                </div>
                            )}
                            {isProductChartExpanded && (
                                <div className="col-12">
                                    <h2 className='text-white fs-4'>Product Sales Distribution</h2>
                                    <div className="text-center p-3 my-2 shadow bg-white rounded fadein" onClick={() => toggleChartSize('product')}>
                                        <ProductSalesBarChart />
                                    </div>
                                </div>
                            )}
                            {!isMonthlyChartExpanded && !isProductChartExpanded && (
                                <>
                                    <div className="col-6 fadein">
                                        <h2 className='text-white fs-4'>Monthly Sales Trends</h2>
                                        <div className="text-center p-3 my-2 shadow bg-white rounded zoom-on" role="button" onClick={() => toggleChartSize('monthly')}>
                                            <YearlyLineChart />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <h2 className='text-white fs-4'>Product Sales Distribution</h2>
                                        <div className="text-center p-3 my-2 shadow bg-white rounded zoom-on" role="button" onClick={() => toggleChartSize('product')}>
                                            <ProductSalesBarChart />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Reports
