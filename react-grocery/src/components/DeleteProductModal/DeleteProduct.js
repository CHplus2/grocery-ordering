import { motion } from "framer-motion";
import "./DeleteProduct.css";

function DeleteProduct({ animation, onClose, onSuccess }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content delete-modal"
        {...animation}
        transition={{ ...animation.transition, duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Delete Product</h2>

        <p className="delete-warning">
          This action cannot be undone. Are you sure you want to delete this product?
        </p>

        <div className="delete-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="delete-btn" onClick={onSuccess}>
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DeleteProduct;