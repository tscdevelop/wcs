import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/** แถวหัวข้อซ้าย-ขวา พร้อมเส้นตารางทุกบรรทัด */
function InfoRow({ label, value, dense = false }) {
  return (
    <Grid container sx={{ borderTop: "1px solid #e0e0e0" }}>
      <Grid
        item
        xs={5}
        sx={{
          bgcolor: "#fafafa",
          borderRight: "1px solid #e0e0e0",
          p: dense ? 1 : 1.25,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7} sx={{ p: dense ? 1 : 1.25 }}>
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {value ?? "-"}
        </Typography>
      </Grid>
    </Grid>
  );
}

/** กล่องหัวข้อ (ซ้าย/ขวา) — หัวตาราง Topic / Detail จัดกลาง และเส้นตารางครบ */
function TopicCard({ children }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden" }}>
      <Grid
        container
        sx={{
          bgcolor: "#f6f7f9",
          borderBottom: "1px solid #e0e0e0",
          textAlign: "center",
        }}
      >
        <Grid item xs={5} sx={{ p: 1.25, borderRight: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Topic
          </Typography>
        </Grid>
        <Grid item xs={7} sx={{ p: 1.25 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Detail
          </Typography>
        </Grid>
      </Grid>
      <Box>{children}</Box>
    </Paper>
  );
}

/** Dialog หลัก */
export default function TaskDetailDialog({ open, onClose, task }) {
  const { header = {}, left = {}, right = {}, middle = {}, times = {}, battery = {} } =
    task || {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* Title + Close */}
      <DialogTitle sx={{ pr: 6, py: 2.25 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight={800}>
            Task Detail
          </Typography>
          {header?.dateTime && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              {header.dateTime}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#fcfcfd" }}>
        {/* ====== สรุปบนแนวนอน 1 แถว (Task ID | value | Store | value | Priority | value) ====== */}
        <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
          <Grid container>
            {(() => {
              const headSx = {
                py: 1.25,
                px: 2,
                bgcolor: "#fafafa",
                borderRight: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontWeight: 700,
                minHeight: 48,
              };
              const valSx = {
                py: 1.25,
                px: 2,
                borderRight: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                minHeight: 48,
              };

              return (
                <>
                  {/* Task ID */}
                  <Grid item xs={2} md={2} sx={headSx}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Task ID
                    </Typography>
                  </Grid>
                  <Grid item xs={2} md={2} sx={valSx}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      
                    >
                      {header?.taskId ?? "-"}
                    </Typography>
                  </Grid>

                  {/* Store */}
                  <Grid item xs={2} md={2} sx={headSx}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Store
                    </Typography>
                  </Grid>
                  <Grid item xs={2} md={2} sx={valSx}>
                    <Typography variant="body2" fontWeight={700}>
                      {header?.store ?? "-"}
                    </Typography>
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={2} md={2} sx={headSx}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Priority
                    </Typography>
                  </Grid>
                  <Grid item xs={2} md={2} sx={{ ...valSx, borderRight: "none" }}>
                    <Typography variant="body2" fontWeight={700}>
                      {header?.priority ?? "-"}
                    </Typography>
                  </Grid>
                </>
              );
            })()}
          </Grid>
        </Paper>

        {/* สองคอลัมน์ซ้าย/ขวา */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TopicCard>
              <InfoRow label="Task State" value={left.taskState} />
              <InfoRow label="User" value={left.user} />
              <InfoRow label="Order ID" value={left.orderId} />
              <InfoRow label="SKU ID" value={left.skus} />
              <InfoRow label="QTY" value={left.qty} />
              <InfoRow label="Error Massage" value={left.errorMessage} />
            </TopicCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <TopicCard>
              <InfoRow label="WRS ID" value={right.mrsId} />
              <InfoRow label="Task ID" value={right.taskId} />
              <InfoRow label="Source ID" value={right.sourceId} />
              <InfoRow label="Target ID" value={right.targetAisleId} />
              <InfoRow label="Counter ID" value={right.counterId} />
              <InfoRow label="Action" value={right.action} />
            </TopicCard>
          </Grid>

          {/* แผงกลาง */}
          <Grid item xs={12}>
            <TopicCard>
              <InfoRow label="Operator mode" value={middle.operatorMode} />
              <InfoRow label="Result" value={middle.result} />
              <InfoRow label="Retry Count" value={middle.retryCount} />
              <InfoRow label="Error Code" value={middle.errorCode} />
              <InfoRow label="Error Message" value={middle.errorMessage} />
            </TopicCard>
          </Grid>

          {/* เวลาต่าง ๆ */}
          <Grid item xs={12}>
            <TopicCard>
              <InfoRow label="Last Open" value={times.lastOpen} />
              <InfoRow label="Last Close" value={times.lastClose} />
              <InfoRow label="Last Event" value={times.lastEvent} />
              <InfoRow label="User Confirm At" value={times.userConfirmAt} />
              <InfoRow
                label="Finish time for the whole MRS task"
                value={times.finishAll}
              />
            </TopicCard>
          </Grid>

          {/* แบตเตอรี่ */}
          <Grid item xs={12}>
            <TopicCard>
              <InfoRow label="Battery before (%)" value={battery.before} />
              <InfoRow label="Battery after (%)" value={battery.after} />
            </TopicCard>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="contained" color="error">
            Back
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
