// src/pages/components/ConveyorMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import { keyframes } from "@mui/system";
import MDButton from "components/MDButton";
// keyframes สำหรับกล่องที่เคลื่อนที่บนสายพาน (ซ้าย -> ขวา)
const moveRight = keyframes`
  0%   { transform: translateX(-12%); }
  100% { transform: translateX(100%); }
`;

// สีประจำเลน
const laneColor = {
  A: "#1976d2",
  B: "#2e7d32",
  C: "#ed6c02",
  D: "#9c27b0",
};

// สร้างพื้นผิวสายพานแบบลายเส้น
const conveyorBg = `
  repeating-linear-gradient(
    90deg,
    rgba(0,0,0,0.06) 0px,
    rgba(0,0,0,0.06) 6px,
    transparent 6px,
    transparent 12px
  )
`;

function BoxToken({ lane, speedSeconds = 4, onDone }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 48,
        height: 32,
        borderRadius: 1,
        border: "2px solid rgba(0,0,0,0.25)",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: laneColor[lane] || "#333",
        animation: `${moveRight} ${speedSeconds}s linear 0s 1`,
        // เริ่มจากนอกจอซ้าย
        left: 0,
        // เงาเล็กๆ ให้ดูนูน
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
      onAnimationEnd={onDone}
    >
      BOX
    </Box>
  );
}

function ConveyorLane({ lane, tokens, onTokenDone, speedSeconds }) {
  return (
    <Box
      sx={{
        position: "relative",
        height: 68,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.12)",
        overflow: "hidden",
        background: conveyorBg,
        px: 2,
      }}
    >
      {/* ป้ายชื่อเลน */}
      <Box
        sx={{
          position: "absolute",
          left: 8,
          top: 8,
          zIndex: 2,
          bgcolor: laneColor[lane],
          color: "#fff",
          px: 1,
          py: "2px",
          fontSize: 12,
          borderRadius: 1,
        }}
      >
        Conveyor {lane}
      </Box>

      {/* กล่องที่กำลังวิ่ง */}
      {tokens.map((t) => (
        <BoxToken
          key={t.id}
          lane={lane}
          speedSeconds={speedSeconds}
          onDone={() => onTokenDone(lane, t.id)}
        />
      ))}
    </Box>
  );
}

export default function ConveyorMap({
  lanes = ["A", "B", "C", "D"],
  spawnIntervalMs = 1500,  // ความถี่การเกิดกล่อง (จำลอง realtime)
  speedSeconds = 4,        // ความเร็วเคลื่อนที่ต่อ 1 เลน
  autoStart = true,
}) {
  // เก็บกล่องของแต่ละเลน
  const [streams, setStreams] = useState(() =>
    lanes.reduce((acc, l) => ({ ...acc, [l]: [] }), {})
  );
  const runningRef = useRef(false);
  const idRef = useRef(0);
  const timerRef = useRef(null);

  // เพิ่มกล่อง 1 ชิ้นในเลนที่กำหนด
  const pushBox = (lane) => {
    setStreams((prev) => {
      const id = ++idRef.current;
      return {
        ...prev,
        [lane]: [...prev[lane], { id }],
      };
    });
  };

  // ลบกล่องเมื่อวิ่งสุดสายพาน
  const handleTokenDone = (lane, id) => {
    setStreams((prev) => ({
      ...prev,
      [lane]: prev[lane].filter((t) => t.id !== id),
    }));
  };

  // เริ่ม/หยุดการจำลองแบบเรียลไทม์
  const start = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    timerRef.current = setInterval(() => {
      // สุ่ม lane ที่จะเกิดกล่อง
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      pushBox(lane);
    }, spawnIntervalMs);
  };

  const stop = () => {
    runningRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (autoStart) start();
    return stop;

  }, []);

  return (
    <Box>
      {/* แผงควบคุมเล็กๆ */}
      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <Box sx={{ flex: 1 }} />
        <MDButton size="small" variant="outlined" color="success" onClick={start}>
          Start
        </MDButton>
        <MDButton size="small" variant="outlined" color="error"  onClick={stop}>
          Stop
        </MDButton>
        {/* ปุ่มเพิ่มกล่องเองต่อเลน */}
        {lanes.map((l) => (
          <MDButton
           color="white"
            key={l}
            size="small"
            variant="contained"
            onClick={() => pushBox(l)}
            sx={{ bgcolor: laneColor[l] }}
          >
            + {l}
          </MDButton>
        ))}
      </Stack>

      {/* สายพาน A-D ซ้อนกันในแนวตั้ง */}
      <Stack spacing={1.5}>
        {lanes.map((l) => (
          <ConveyorLane
            key={l}
            lane={l}
            tokens={streams[l]}
            onTokenDone={handleTokenDone}
            speedSeconds={speedSeconds}
          />
        ))}
      </Stack>
    </Box>
  );
}
