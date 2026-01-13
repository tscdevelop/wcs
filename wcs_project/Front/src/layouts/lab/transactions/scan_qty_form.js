// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import PropTypes from "prop-types";
// import SweetAlertComponent from "../components/sweetAlert"; // import SweetAlertComponent
// import Typography from "@mui/material/Typography";
// export default function ScanQtyDialog({
//   open,
//   order,
//   onClose,
//   onSubmit,
//   disableEscapeKeyDown = false,
//   disableBackdropClick = false,
// }) {
//   // const [scanItem, setScanItem] = useState("");
//   const [actualQty, setActualQty] = useState(order?.actual_qty || 0);
//   const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });
//   const [confirmAlert, setConfirmAlert] = useState(false);

//   useEffect(() => {
//     if (open) {
//       // setScanItem("");
//       setActualQty(order?.actual_qty || 0);
//       setSnackbar({ show: false, message: "", type: "success" });
//       setConfirmAlert(false);
//     }
//   }, [open, order]);

//   // const handleScanEnter = (e) => {
//   //   if (e.key === "Enter") {
//   //     if (scanItem !== order?.stock_item) {
//   //       setSnackbar({
//   //         show: true,
//   //         message: `Stock Item ${scanItem} not found!`,
//   //         type: "error",
//   //       });
//   //     } else if (actualQty + 1 > (order?.plan_qty || Infinity)) {
//   //       setSnackbar({
//   //         show: true,
//   //         message: `Cannot scan more than quantity to be handled (${order.plan_qty})`,
//   //         type: "error",
//   //       });
//   //     } else {
//   //       const newQty = actualQty + 1;
//   //       setActualQty(newQty);
//   //       setSnackbar({
//   //         show: true,
//   //         message: (
//   //           <div>
//   //             <strong>Stock Item ID:</strong> {order.stock_item} <br />
//   //             <strong>Stock Item Name:</strong> {order.item_name} <br />
//   //             <strong>Stock Item Description:</strong> {order.item_desc} <br />
//   //             <strong>Order ID:</strong> {order.order_id} <br />
//   //             <strong>Transaction Type:</strong> {order.type} <br />
//   //             <strong>Scanned Quantity:</strong> {newQty} / {order.plan_qty}
//   //           </div>
//   //         ),
//   //         type: "success",
//   //       });
//   //     }
//   //     setScanItem("");
//   //   }
//   // };

//   const handleConfirm = () => {
//     if (actualQty === 0) {
//       setSnackbar({ show: true, message: "Please scan at least 1 item", type: "error" });
//       return;
//     }
//     setConfirmAlert(true);
//   };

//   const handleDialogClose = (event, reason) => {
//     if ((disableBackdropClick && reason === "backdropClick") ||
//         (disableEscapeKeyDown && reason === "escapeKeyDown")) return;

//     if (snackbar.show) {
//       setSnackbar({ ...snackbar, show: false });
//       return;
//     }

//     if (confirmAlert) {
//       setConfirmAlert(false);
//       return;
//     }

//     onClose?.();
//   };

//   const handleConfirmSubmit = async () => {
//     await onSubmit(order.order_id, actualQty);
//     setConfirmAlert(false);
//     onClose?.();
//   };
// const planQty = order.plan_qty;
//   return (
//     <>
//       {/* Main Dialog */}
// <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="xs">
//   <DialogTitle sx={{ textAlign: "center", fontSize: "1rem" }}>
//     This Item requires quantity of
//   </DialogTitle>
//   <DialogContent dividers sx={{ textAlign: "center", padding: 3 }}>
//     {/* Plan Quantity */}
//     <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 1 }}>
//       {planQty}
//     </Typography>
//     <Typography variant="body1" sx={{ marginBottom: 2 }}>
//       You have scanned
//     </Typography>
//     {/* Actual Quantity */}
//     <Typography variant="h2" sx={{ fontWeight: "bold", marginBottom: 1 }}>
//       {actualQty}
//     </Typography>
//     <Typography variant="body1" sx={{ marginBottom: 3 }}>
//       Proceed?
//     </Typography>
//   </DialogContent>
//   <DialogActions sx={{ justifyContent: "center", gap: 2, paddingBottom: 3 }}>
//     <Button
//       onClick={handleConfirm}
//       variant="contained"
//       color="success"
//       sx={{ width: 120 }}
//     >
//       Proceed
//     </Button>
//     <Button
//       onClick={handleDialogClose}
//       variant="outlined"
//       color="inherit"
//       sx={{ width: 120 }}
//     >
//       Cancel
//     </Button>
//   </DialogActions>
// </Dialog>


//       {/* SweetAlert Confirm Dialog */}
//       {confirmAlert && (
//         <SweetAlertComponent
//           show={confirmAlert}
//           type="warning"
//           title="Confirm Submission"
//           message={`Are you sure to submit ${actualQty} items for Order ${order?.order_id}?`}
//           showCancel
//           confirmText="OK"
//           cancelText="Cancel"
//           onConfirm={handleConfirmSubmit}
//           onCancel={() => setConfirmAlert(false)}
//         />
//       )}

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.show}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, show: false })}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert
//           severity={snackbar.type}
//           onClose={() => setSnackbar({ ...snackbar, show: false })}
//           variant="filled"
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

// ScanQtyDialog.propTypes = {
//   open: PropTypes.bool.isRequired,
//   order: PropTypes.object.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
//   disableEscapeKeyDown: PropTypes.bool,
//   disableBackdropClick: PropTypes.bool,
// };

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
import SweetAlertComponent from "../components/sweetAlert"; // import SweetAlertComponent

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
  const [confirmAlert, setConfirmAlert] = useState(false);

  useEffect(() => {
    if (open) {
      setScanItem("");
      setActualQty(order?.actual_qty || 0);
      setSnackbar({ show: false, message: "", type: "success" });
      setConfirmAlert(false);
    }
  }, [open, order]);

  const handleScanEnter = (e) => {
    if (e.key === "Enter") {
      if (scanItem !== order?.stock_item) {
        setSnackbar({
          show: true,
          message: `Stock Item ${scanItem} not found!`,
          type: "error",
        });
      } else if (actualQty + 1 > (order?.plan_qty || Infinity)) {
        setSnackbar({
          show: true,
          message: `Cannot scan more than quantity to be handled (${order.plan_qty})`,
          type: "error",
        });
      } else {
        const newQty = actualQty + 1;
        setActualQty(newQty);
        setSnackbar({
          show: true,
          message: (
            <div>
              <strong>Stock Item ID:</strong> {order.stock_item} <br />
              <strong>Stock Item Name:</strong> {order.item_name} <br />
              <strong>Stock Item Description:</strong> {order.item_desc} <br />
              <strong>Order ID:</strong> {order.order_id} <br />
              <strong>Transaction Type:</strong> {order.type} <br />
              <strong>Scanned Quantity:</strong> {newQty} / {order.plan_qty}
            </div>
          ),
          type: "success",
        });
      }
      setScanItem("");
    }
  };

  const handleConfirm = () => {
    if (actualQty === 0) {
      setSnackbar({ show: true, message: "Please scan at least 1 item", type: "error" });
      return;
    }
    setConfirmAlert(true);
  };

  const handleDialogClose = (event, reason) => {
    if ((disableBackdropClick && reason === "backdropClick") ||
        (disableEscapeKeyDown && reason === "escapeKeyDown")) return;

    if (snackbar.show) {
      setSnackbar({ ...snackbar, show: false });
      return;
    }

    if (confirmAlert) {
      setConfirmAlert(false);
      return;
    }

    onClose?.();
  };

  const handleConfirmSubmit = async () => {
    await onSubmit(order.order_id, actualQty);
    setConfirmAlert(false);
    onClose?.();
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
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
                label="Scanned Quantity"
                value={actualQty}
                type="number"
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            sx={{ color: "#ffffff" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* SweetAlert Confirm Dialog */}
      {confirmAlert && (
        <SweetAlertComponent
          show={confirmAlert}
          type="warning"
          title="Confirm Submission"
          message={`Are you sure to submit ${actualQty} items for Order ${order?.order_id}?`}
          showCancel
          confirmText="OK"
          cancelText="Cancel"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmAlert(false)}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.show}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, show: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, show: false })}
          variant="filled"
        >
          {snackbar.message}
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
