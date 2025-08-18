// src/pages/components/AisleShelfMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import MDTypography from "components/MDTypography";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const idxOf = (letter) => LETTERS.indexOf(letter);

export default function AisleShelfMap({
  from,                // "A".."F"
  to,                  // "A".."F"
  initialEmpty = "D",  // ช่องว่างเริ่มต้น
  stepDelayMs = 450,   // ความเร็วแอนิเมชันต่อ 1 สเต็ป
  trigger,             // เปลี่ยนค่าตัวนี้เพื่อสั่งให้รันรอบใหม่
  onComplete,          // (optional) callback เมื่อเสร็จ
}) {
  // state ช่องวาง: A..F, ช่องว่างเป็น null
  const [slots, setSlots] = useState(() =>
    LETTERS.map((ch) => (ch === initialEmpty ? null : ch))
  );
  const [mrsIndex, setMrsIndex] = useState(0);
  const timerRef = useRef();
  const delay = (ms) => new Promise((r) => (timerRef.current = setTimeout(r, ms)));
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // รันทุกครั้งที่ trigger / from / to เปลี่ยน
  useEffect(() => {
    const run = async () => {
      // รีเซ็ตให้กลับไปสถานะเริ่ม (ช่องว่างตาม initialEmpty)
      let arr = LETTERS.map((ch) => (ch === initialEmpty ? null : ch));
      setSlots([...arr]);

      const moveMrsTo = async (targetIdx) => {
        setMrsIndex(targetIdx);
        await delay(Math.max(150, stepDelayMs / 2));
      };
      const indexOfEmpty = () => arr.findIndex((x) => x === null);
      const swapLocal = async (i, j) => {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setSlots([...arr]);
        await delay(stepDelayMs);
      };
      const slideIntoEmptyLocal = async (fromI, toI) => {
        await moveMrsTo(toI);
        await swapLocal(fromI, toI);
      };

      let fromIdx = idxOf(from);
      const toIdx = idxOf(to);
      if (fromIdx === -1 || toIdx === -1) return;      // ป้องกันพารามิเตอร์ผิด
      if (fromIdx === toIdx) { onComplete?.(); return; }
      if (arr[fromIdx] == null) return;                // ห้ามย้ายจากช่องว่าง

      // 1) ดึง “ช่องว่าง” ให้มาอยู่ตำแหน่งปลายทางก่อน
      while (indexOfEmpty() !== toIdx) {
        const e = indexOfEmpty();
        if (e < toIdx) await slideIntoEmptyLocal(e + 1, e); // ผลักว่างไปขวา
        else            await slideIntoEmptyLocal(e - 1, e); // ผลักว่างไปซ้าย
      }

      // 2) ผลักของจาก fromIdx → toIdx ทีละช่อง
      while (fromIdx !== toIdx) {
        const e = indexOfEmpty();
        if (fromIdx < toIdx) {
          if (e - 1 >= 0) await slideIntoEmptyLocal(e - 1, e);
          fromIdx++;
        } else {
          if (e + 1 < arr.length) await slideIntoEmptyLocal(e + 1, e);
          fromIdx--;
        }
      }

      onComplete?.();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, from, to, initialEmpty, stepDelayMs]);

  // UI: แถว A–F + ราง MRS ใต้แถว
  return (
    <Box>
      {/* แถวชั้นวางตามภาพที่ให้ */}
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 0,
          p: 0,
          border: "2px solid #000",
        }}
      >
        {slots.map((item, i) => (
          <Box
            key={i}
            sx={{
              height: 120,
              borderLeft: i === 0 ? "none" : "2px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              background: "#fff",
            }}
          >
            <MDTypography variant="h2" sx={{ opacity: item ? 1 : 0.2 }}>
              {LETTERS[i]}
            </MDTypography>
          </Box>
        ))}
      </Box>

      {/* รางโดรน MRS ใต้แถว */}
      <Box
        sx={{
          position: "relative",
          mt: 3,
          height: 48,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 1,
          background: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            "& > span": { borderRight: "1px dashed rgba(0,0,0,0.3)" },
            "& > span:last-of-type": { borderRight: "none" },
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} />
          ))}
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#263238",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            transition: "left 250ms ease",
            left: `calc(${(mrsIndex + 0.5) * (100 / 6)}% - 14px)`,
          }}
        />
      </Box>
    </Box>
  );
}
