export const normalizeStatus = (status = "") => {
  const s = String(status).trim().toUpperCase();

  const allowStatuses = [
    "WAITING",
    "PENDING",
    "COMPLETED",
    "FINISHED",
    "ERROR",
  ];

  if (allowStatuses.includes(s)) {
    return s;
  }

  return "PROCESSING";
};


export const STATUS_STYLE = {
  WAITING: {
    label: "Waiting",
    bg: "#9E9E9E",
    color: "#fff",
  },
  PROCESSING: {
    label: "Processing",
    bg: "#FFD54F",
    color: "#fff",
  },
  PENDING: {
    label: "Pending",
    bg: "#FC6A03",
    color: "#fff",
  },
  COMPLETED: {
    label: "Completed",
    bg: "#0f6b2bff",
    color: "#fff",
  },
  FINISHED: {
    label: "Finished",
    bg: "#5fd964ff",
    color: "#fff",
  },
  ERROR: {
    label: "Error",
    bg: "#e51c23",
    color: "#fff",
  },
};
