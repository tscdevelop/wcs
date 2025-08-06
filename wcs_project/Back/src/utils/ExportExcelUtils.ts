/*แปลงวันที่ปัจจุบันให้เป็น '04 Mar 25'**/
export const todayDateFormatted = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: '2-digit' 
}).replace('.', ''); // ลบจุดออก

/* ฟิลเตอร์ข้อมูล */
export const applyFilters = (data: any[], filters: Record<string, any>): any[] => {
    return data.filter((item: any) => {
        return Object.keys(filters).every((key) => {
            const filterValue = filters[key];
            const itemValue = item[key];

            if (filterValue === undefined || filterValue === null) {
                return true; // ✅ ถ้าไม่มีค่า filter ให้ข้ามไป
            }

            // ✅ ฟิลเตอร์ตัวเลขแบบเป๊ะ
            if (typeof filterValue === "number") {
                return Number(itemValue) === filterValue;
            }

            // ✅ ฟิลเตอร์ข้อความแบบ Partial Match
            if (typeof filterValue === "string") {
                return (
                    typeof itemValue === "string" &&
                    itemValue.toString().trim().normalize("NFC").toLowerCase()
                    .includes(filterValue.toString().trim().normalize("NFC").toLowerCase()) // ✅ Partial Match
                );
            }

            // ✅ ฟิลเตอร์วันที่ (เช่น "25" ค้นหา "14 Feb 25" ได้)
            if (key === "formatted_date" && typeof filterValue === "string") {
                return (
                    typeof itemValue === "string" &&
                    itemValue.trim().startsWith(filterValue.trim()) // ✅ Partial Match (ค้นหาปี เดือน วันที่)
                );
            }

            return false; // ❌ ไม่ตรงกับเงื่อนไขใด ๆ
        });
    });
};
