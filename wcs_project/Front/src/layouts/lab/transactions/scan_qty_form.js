import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";

export default function ScanQtyDialog({
  open,
  order,
  onClose,
  onSubmit,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
}) {
  const [scanItem, setScanItem] = useState("");
  const [actualQty, setActualQty] = useState(order?.actual_qty || 0);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (open) {
      setScanItem("");
      setActualQty(order?.actual_qty || 0);
    }
  }, [open, order]);

  const handleScanEnter = (e) => {
    if (e.key === "Enter") {
      if (scanItem !== order?.stock_item) {
        setSnackbar({ show: true, message: `Stock Item ${scanItem} not found!`, type: "error" });
      } else {
        setActualQty((prev) => prev + 1);
        setSnackbar({
          show: true,
          message: `Scanned ${scanItem}, actual_qty: ${actualQty + 1}`,
          type: "success",
        });
      }
      setScanItem("");
    }
  };

  const handleConfirm = async () => {
    if (actualQty === 0) {
      setSnackbar({ show: true, message: "Please scan at least 1 item", type: "error" });
      return;
    }
    if (window.confirm(`Are you sure to submit ${actualQty} items for Order ${order.order_id}?`)) {
      await onSubmit(order.order_id, actualQty);
      onClose?.();
    }
  };

  const handleDialogClose = (event, reason) => {
    if ((disableBackdropClick && reason === "backdropClick") ||
        (disableEscapeKeyDown && reason === "escapeKeyDown")) {
      return;
    }
    onClose?.(event, reason);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Scan Item for Order {order?.order_id}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Scan / Enter Stock Item"
                value={scanItem}
                onChange={(e) => setScanItem(e.target.value)}
                onKeyDown={handleScanEnter}
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Actual Quantity"
                value={actualQty}
                type="number"
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose?.()}>Cancel</Button>
          <Button
  onClick={handleConfirm}
  variant="contained"
  color="primary"
  sx={{ color: "#ffffff" }} // กำหนดสีตัวอักษรเป็นขาว
>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Pop-up */}
      <Snackbar
        open={snackbar.show}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, show: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} variant="filled">
          {snackbar.message}
          {snackbar.type === "success" && order && (
            <div>
              <strong>Stock Item ID:</strong> {order.stock_item} <br />
              <strong>Name:</strong> {order.item_name} <br />
              <strong>Description:</strong> {order.item_desc} <br />
              <strong>Order ID:</strong> {order.order_id} <br />
              <strong>Transaction Type:</strong> {order.type} <br />
              <strong>Scanned Qty:</strong> 1
            </div>
          )}
        </Alert>
      </Snackbar>
    </>
  );
}

ScanQtyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disableEscapeKeyDown: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,
};
