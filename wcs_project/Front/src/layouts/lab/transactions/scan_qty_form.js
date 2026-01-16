//V01
// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   TextField,
//   Button,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import PropTypes from "prop-types";
// import SweetAlertComponent from "../components/sweetAlert"; // import SweetAlertComponent

// export default function ScanQtyDialog({
//   open,
//   order,
//   onClose,
//   onSubmit,
//   disableEscapeKeyDown = false,
//   disableBackdropClick = false,
// }) {
//   const [scanItem, setScanItem] = useState("");
//   const [actualQty, setActualQty] = useState(order?.actual_qty || 0);
//   const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });
//   const [confirmAlert, setConfirmAlert] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setScanItem("");
//       setActualQty(order?.actual_qty || 0);
//       setSnackbar({ show: false, message: "", type: "success" });
//       setConfirmAlert(false);
//     }
//   }, [open, order]);

//   const handleScanEnter = (e) => {
//     if (e.key === "Enter") {
//       if (scanItem !== order?.stock_item) {
//         setSnackbar({
//           show: true,
//           message: `Stock Item ${scanItem} not found!`,
//           type: "error",
//         });
//       } else if (actualQty + 1 > (order?.plan_qty || Infinity)) {
//         setSnackbar({
//           show: true,
//           message: `Cannot scan more than quantity to be handled (${order.plan_qty})`,
//           type: "error",
//         });
//       } else {
//         const newQty = actualQty + 1;
//         setActualQty(newQty);
//         setSnackbar({
//           show: true,
//           message: (
//             <div>
//               <strong>Stock Item ID:</strong> {order.stock_item} <br />
//               <strong>Stock Item Name:</strong> {order.item_name} <br />
//               <strong>Stock Item Description:</strong> {order.item_desc} <br />
//               <strong>Order ID:</strong> {order.order_id} <br />
//               <strong>Transaction Type:</strong> {order.type} <br />
//               <strong>Scanned Quantity:</strong> {newQty} / {order.plan_qty}
//             </div>
//           ),
//           type: "success",
//         });
//       }
//       setScanItem("");
//     }
//   };

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

//   return (
//     <>
//       {/* Main Dialog */}
//       <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
//         <DialogTitle>Scan Item for Order {order?.order_id}</DialogTitle>
//         <DialogContent dividers>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <TextField
//                 label="Scan / Enter Stock Item"
//                 value={scanItem}
//                 onChange={(e) => setScanItem(e.target.value)}
//                 onKeyDown={handleScanEnter}
//                 fullWidth
//                 autoFocus
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 label="Scanned Quantity"
//                 value={actualQty}
//                 type="number"
//                 fullWidth
//                 InputProps={{ readOnly: true }}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>Cancel</Button>
//           <Button
//             onClick={handleConfirm}
//             variant="contained"
//             color="primary"
//             sx={{ color: "#ffffff" }}
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>

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

//V02
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import CounterAPI from "api/CounterAPI";

export default function ScanQtyDialog({ open, order, onClose, onSubmit }) {
  const planQty = order?.plan_qty || 0;
  const counterId = order?.counter_id;

  const [scanItem, setScanItem] = useState("");
  const [actualQty, setActualQty] = useState(order?.actual_qty || 0);

  // dialogType: null | confirm | shortage | overScan
  const [dialogType, setDialogType] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (open) {
      setScanItem("");
      setActualQty(order?.actual_qty || 0);
      setDialogType(null);
    }
  }, [open, order]);

  /* ---------------- Scan Logic ---------------- */

  const handleScanEnter = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    console.log("SCAN ENTER", {
      scanItem,
      stock: order?.stock_item,
      counterId,
    });

    if (scanning) return;
    if (!counterId) {
      console.warn("counterId not found");
      return;
    }

    const scanned = scanItem.trim();
    const expected = order?.stock_item?.trim();

    if (!scanned) return;

    setScanning(true);

    try {
      if (scanned !== expected) {
        setScanItem("");
        return;
      }

      if (actualQty + 1 > planQty) {
        setDialogType("overScan");
        return;
      }

      // ยิงไป backend เพื่อ broadcast SSE
      const res = await CounterAPI.scanToServer(counterId);
      console.log("SCAN RESPONSE", res);
      if (res?.isError) {
        console.error(res.message);
      }
    } catch (err) {
      console.error("Scan error", err);
    } finally {
      setScanning(false);
      setScanItem("");
    }
  };

  useEffect(() => {
    if (!counterId || !open) return;

    const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
    const es = new EventSource(
      `${API_BASE}/api/sse/${counterId}?key=${process.env.REACT_APP_WCS_SCREEN_KEY}`
    );

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setActualQty(data.actualQty);
    };

    return () => {
      es.close(); // ✅ ปิด SSE จริง ๆ
    };
  }, [counterId, open]);

  //reset sacn dialog
  const handleCancel = async () => {
    if (counterId) {
      await CounterAPI.resetCounter(counterId);
    }
    onClose();
  };

  /* ---------------- Confirm Logic ---------------- */
  const handleConfirmClick = () => {
    if (actualQty === 0) {
      setDialogType("empty"); // ✅ แจ้งเตือนยังไม่ได้ scan
      return;
    }

    if (actualQty < planQty) {
      setDialogType("confirm");
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = async () => {
    await onSubmit(order.order_id, actualQty);
    setDialogType(null);
    onClose();
  };

  return (
    <>
      {/* ================= Scan Dialog ================= */}
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 10,
            p: 2,
          },
        }}
      >
        <DialogTitle>Scan Item for Order : {order?.stock_item}</DialogTitle>

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
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "right", gap: 2, pb: 3 }}>
          <MDButton
            onClick={handleCancel}
            variant="contained"
            color="secondary"
            sx={{ color: "#fff" }}
          >
            Cancel
          </MDButton>
          <MDButton
            variant="contained"
            color="success"
            onClick={handleConfirmClick}
            sx={{ color: "#fff" }}
          >
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* ================= Over Scan Dialog ================= */}
      <Dialog
        open={dialogType === "overScan"}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 10,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography>You cannot scan more than</Typography>
          <Typography variant="h1" fontWeight={900} my={2}>
            {planQty}
          </Typography>
          <Typography>Items</Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <MDButton
            variant="contained"
            color="secondary"
            sx={{ color: "#fff" }}
            onClick={() => setDialogType(null)}
          >
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* ================= Confirm Dialog ================= */}
      <Dialog
        open={dialogType === "confirm"}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 10,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", p: 3 }}>
          <Typography>This Item requires quantity of</Typography>
          <Typography variant="h1" fontWeight={900}>
            {planQty}
          </Typography>
          <Typography>You have scanned</Typography>
          <Typography variant="h1" fontWeight={900}>
            {actualQty}
          </Typography>
          <Typography>Proceed?</Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <MDButton variant="contained" color="success" onClick={() => setDialogType("shortage")}>
            Proceed
          </MDButton>
          <MDButton
            variant="contained"
            color="secondary"
            sx={{ color: "#fff" }}
            onClick={() => {
              setDialogType(null); // ปิด Shortage dialog
              handleCancel();
            }}
          >
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* ================= Shortage Warning Dialog ================= */}
      <Dialog
        open={dialogType === "shortage"}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 10,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography fontSize={18} fontWeight={900}>
            This will report required stock item short to the staff
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          {/* Confirm = submit จริง */}
          <MDButton variant="contained" color="success" onClick={handleConfirmSubmit}>
            Confirm
          </MDButton>

          {/* Cancel = reset qty + กลับไป scan */}
          <MDButton
            variant="contained"
            color="secondary"
            sx={{ color: "#fff" }}
            onClick={() => {
              setDialogType(null); // ปิด Shortage dialog
              handleCancel();
            }}
          >
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* ================= Empty Scan Warning Dialog ================= */}
      <Dialog
        open={dialogType === "empty"}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 10,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography fontSize={18} fontWeight={900}>
            Please scan or enter at least 1 item before confirming.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <MDButton
            variant="contained"
            color="secondary"
            sx={{ color: "#fff" }}
            onClick={() => setDialogType(null)}
          >
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

ScanQtyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
