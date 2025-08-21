// src/pages/components/AisleShelfMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import MDTypography from "components/MDTypography";

const LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L"]; // ✅ 12 ช่อง
const idxOf = (letter) => LETTERS.indexOf(letter);

export default function AisleShelfMap({
  from,                 // "A".."L"
  to,                   // "A".."L"
  initialEmpty = "D",   // ช่องว่างเริ่มต้น (ตัวเดียวในทั้ง 12 ช่อง)
  stepDelayMs = 450,
  trigger,              // เปลี่ยนค่านี้เพื่อสั่งรอบใหม่
  onComplete,
}) {
  const [slots, setSlots] = useState(() =>
    LETTERS.map((ch) => (ch === initialEmpty ? null : ch))
  );
  const [mrsIndex, setMrsIndex] = useState(0);
  const timerRef = useRef();
  const delay = (ms) => new Promise((r) => (timerRef.current = setTimeout(r, ms)));
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    const run = async () => {
      // reset ตาม initialEmpty ทุกครั้ง
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
      if (fromIdx === -1 || toIdx === -1) return;
      if (fromIdx === toIdx) { onComplete?.(); return; }
      if (arr[fromIdx] == null) return; // ต้นทางต้องไม่ใช่ช่องว่าง

      // 1) ดึง "ช่องว่าง" ไปประจำที่ toIdx
      while (indexOfEmpty() !== toIdx) {
        const e = indexOfEmpty();
        if (e < toIdx) await slideIntoEmptyLocal(e + 1, e); // ผลักว่างไปขวา
        else            await slideIntoEmptyLocal(e - 1, e); // ผลักว่างไปซ้าย
      }

      // 2) ผลักของจาก fromIdx -> toIdx ทีละช่อง
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
  }, [trigger, from, to, initialEmpty, stepDelayMs]);

  // ===== UI =====
  return (
    <Box>
      {/* แถวบน A–F */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          border: "2px solid #000",
        }}
      >
        {slots.slice(0, 6).map((item, i) => (
          <Box
            key={i}
            sx={{
              height: 120,
              borderLeft: i === 0 ? "none" : "2px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
            }}
          >
            {item ? (
              <MDTypography variant="h2">{LETTERS[i]}</MDTypography>
            ) : (
              <MDTypography
                variant="h1"
                color="error"
                sx={{ fontWeight: "bold", fontSize: "5rem", lineHeight: 1 }}
              >
                ✖
              </MDTypography>
            )}
          </Box>
        ))}
      </Box>

      {/* แถวล่าง G–L (ทำแบบเดียวกับแถวบน) */}
      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          border: "2px solid #000",
        }}
      >
        {slots.slice(6, 12).map((item, i) => (
          <Box
            key={i + 6}
            sx={{
              height: 120,
              borderLeft: i === 0 ? "none" : "2px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
            }}
          >
            {item ? (
              <MDTypography variant="h2">{LETTERS[i + 6]}</MDTypography>
            ) : (
              <MDTypography
                variant="h1"
                color="error"
                sx={{ fontWeight: "bold", fontSize: "5rem", lineHeight: 1 }}
              >
                ✖
              </MDTypography>
            )}
          </Box>
        ))}
      </Box>

      {/* ราง MRS ครอบคลุม 12 ช่อง A–L */}
      <Box
        sx={{
          position: "relative",
          mt: 3,
          height: 48,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 1,
          background: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)", // ✅ 12 ช่อง
            "& > span": { borderRight: "1px dashed rgba(0,0,0,0.3)" },
            "& > span:last-of-type": { borderRight: "none" },
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
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
            left: `calc(${(mrsIndex + 0.5) * (100 / 12)}% - 14px)`,
          }}
        />
      </Box>
    </Box>
  );
}
