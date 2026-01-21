import { Box, Card, Typography, Grid } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function CounterScreen({
  counter, // counter object จาก API
  stock_item,
  item_desc,
  plan_qty,
  pickedQty,
  spr_no,
  type,
  mc_code,
  work_order,
  usage_num,
  usage_line,
  po_num,
  object_id,
  item_id,
  imageUrl,
  slots = 6,
}) {
  console.log("[CounterScreen] render pickedQty =", pickedQty);
  const counterColor = counter?.color || "#ff0000";

  const isReceiptOrTransfer = type === "RECEIPT" || type === "TRANSFER";

  const transactionFields = isReceiptOrTransfer
    ? [
        ["Transaction Type", type],
        ["PO No.", po_num],
        ["OBJECT ID", object_id],
        ["SPR No.", spr_no],
        ["Work Order", work_order],
      ]
    : [
        ["Transaction Type", type],
        ["SPR No.", spr_no],
        ["Work Order", work_order],
        ["USAGE NO.", usage_num],
        ["USAGE Line", usage_line],
      ];

  return (
    <Box
      sx={{
        width: "100%", // 🔒 รับขนาดจาก wrapper
        height: "100%", // 🔒 ไม่คุมจอเอง
        backgroundColor: alpha(counterColor || "#000", 0.1),
        border: "4px solid black",
        borderRadius: 0,
        p: 4,
        boxSizing: "border-box", // 🔥 สำคัญมาก
      }}
    >
      {/* Counter Title */}
      <Typography
        variant="h2"
        fontWeight="bold"
        textAlign="left"
        mb={2}
        sx={{
          cursor: "pointer",
          color: "#000", // 🔒 ดำล้วน
        }}
        onClick={() => {
          window.location.reload();
        }}
      >
        Counter {counter?.counter_id || "?"}
      </Typography>

      <Grid container spacing={2}>
        {/* Top */}
        <Grid item xs={12}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Item Info */}
            <Grid item xs={12} md={6} display="flex">
              <Card
                sx={{
                  borderRadius: 7,
                  p: 3,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column", // 🔥 สำคัญ
                }}
              >
                <Typography fontWeight="bold" fontSize={30}>
                  {stock_item} ({item_id})
                </Typography>

                <Typography fontSize={25}>{item_desc}</Typography>

                <Typography
                  fontWeight="bold"
                  fontSize={30}
                  sx={{ mt: "auto" }} // 🔥 ดันลงล่างสุด
                >
                  Pick Quantity: {plan_qty}
                </Typography>
              </Card>
            </Grid>

            {/* Transaction / Order Info */}
            <Grid item xs={12} md={6} display="flex">
              <Card
                sx={{
                  borderRadius: 7,
                  p: 3,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <Typography fontWeight="bold" fontSize={30}>
                  {mc_code || "-"}
                </Typography>
                <Grid container spacing={0.5}>
                  {transactionFields.map(([label, value], i) => (
                    <Grid item xs={12} key={i}>
                      <Box display="flex">
                        <Typography fontWeight="bold" sx={{ width: 220 }}>
                          {label} :
                        </Typography>
                        <Typography>{value ?? "-"}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Middle */}
        <Grid item xs={12}>
          {/* Counter Bar */}
          <Box
            sx={{
              backgroundColor: counterColor,
              color: "#fff",
              textAlign: "center",
              fontSize: 120,
              fontWeight: "bold",
              py: 0.5, //padding ระยะภายใน
              borderRadius: 7,
              my: 2, //margin ระยะภายนอก
              textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            {pickedQty}/{plan_qty}
          </Box>
        </Grid>

        {/* Bottom */}
        <Grid item xs={12}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Slot Indicator */}
            <Grid item xs={12} md={8} display="flex">
              <Card
                sx={{
                  borderRadius: 7,
                  p: 5,
                  width: "100%",
                  display: "flex",
                  alignItems: "stretch", // 🔥 สำคัญ
                }}
              >
                <Box
                  display="flex"
                  gap={{ xs: 0.5, md: 2 }}
                  width="100%"
                  alignItems="stretch" // 🔥 ทำให้สูงตามกัน
                >
                  {Array.from({ length: slots }).map((_, i) => {
                    const index = i + 1;
                    const counterId = Number(counter?.counter_id);
                    const isActive = counterId >= 1 && counterId <= slots && index === counterId;
                    const color = isActive ? counter?.color || "#000" : "#000";

                    return (
                      <Box
                        key={index}
                        sx={{
                          flex: 1, // 🔥 ยืดตาม Card
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography fontWeight="bold" sx={{ color }}>
                          {index}
                        </Typography>

                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "2 / 2.70", // 🔥 ตัวกำหนดความสูงทั้งหมด
                            border: "2px solid black",
                            backgroundColor: isActive ? color : "#fff",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>

            {/* Image */}
            <Grid item xs={12} md={4} display="flex">
              <Card
                sx={{
                  borderRadius: 7,
                  p: 3,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="stock item image"
                    sx={{
                      width: "100%",
                      maxWidth: "100%", // 🔥 เต็ม card
                      maxHeight: {
                        xs: 220, // มือถือ
                        md: 320, // desktop
                        lg: 380, // จอใหญ่
                      },
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Typography color="text.secondary">No image</Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
