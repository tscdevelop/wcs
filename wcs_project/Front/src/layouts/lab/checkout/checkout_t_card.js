import { Box, Card, Typography, Grid } from "@mui/material";

export default function PickCounterCard({
  counter,       // object counter จาก API
  stock_item,
  brand,
  item_desc,
  plan_qty,
  pickedQty,
  transaction,
  slots = 6,
  activeSlot = 1,
  imageUrl,
}) {
  const counterColor = counter?.color || "red";

  return (
    <Box
      sx={{
        background: "#f4cfc6",
        border: "4px solid black",
        borderRadius: 3,
        p: 2,
      }}
    >
      {/* Counter Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="left"
        mb={2}
        sx={{ cursor: "pointer", color: counterColor }}
        onClick={() => {
          // เปิด tab ใหม่พร้อมส่ง counterId และ orderId
          window.open(
            `/counter-detail?counterId=${counter?.id}&orderId=${transaction?.objectId}`,
            "_blank"
          );
        }}
      >
        Counter {counter?.id || "?"}
      </Typography>

      {/* Top */}
      <Grid container spacing={2}>
        {/* Item Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2, textAlign: "left" }}>
            <Typography fontWeight="bold" mt={1}>
              {stock_item} ({brand})
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              {item_desc}
            </Typography>
            <Typography mt={1} fontWeight="bold">
              Pick Quantity: {plan_qty}
            </Typography>
          </Card>
        </Grid>

        {/* Transaction Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2, textAlign: "left" }}>
            <Typography variant="h6" fontWeight="bold">
              {transaction?.code}
            </Typography>
            <Typography>
              <b>Transaction Type:</b> {transaction?.type}
            </Typography>
            <Typography>
              <b>SPR No.:</b> {transaction?.spr}
            </Typography>
            <Typography>
              <b>Work Order:</b> {transaction?.workOrder}
            </Typography>
            <Typography>
              <b>PO No.:</b> {transaction?.po}
            </Typography>
            <Typography>
              <b>OBJECT ID:</b> {transaction?.objectId}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Counter Bar */}
      <Box
        sx={{
          background: counterColor,
          color: "white",
          textAlign: "center",
          fontSize: 48,
          fontWeight: "bold",
          py: 3,
          borderRadius: 3,
          my: 2,
        }}
      >
        {pickedQty}/{plan_qty}
      </Box>

      {/* Bottom */}
      <Grid container spacing={2}>
        {/* Slot Indicator */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Box display="flex" gap={2} justifyContent="center">
              {Array.from({ length: slots }).map((_, i) => {
                const index = i + 1;
                const active = index === activeSlot;

                return (
                  <Box key={index} textAlign="center">
                    <Typography
                      fontWeight="bold"
                      color={active ? counterColor : "black"}
                    >
                      {index}
                    </Typography>
                    <Box
                      sx={{
                        width: 50,
                        height: 70,
                        border: "2px solid black",
                        background: active ? counterColor : "white",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Image */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="item" style={{ maxHeight: 80 }} />
            ) : (
              <Typography color="text.secondary">No image</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
