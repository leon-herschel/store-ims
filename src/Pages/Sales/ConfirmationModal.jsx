function ConfirmationModal({ show, onClose, onConfirm, title, message, confirmButtonText }) {
    if (!show) return null

    return (
        <div className="modal fade show d-block" id="confirmationModal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {message}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmButtonText}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal