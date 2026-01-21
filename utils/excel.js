const XLSX = require("xlsx");

const exportToExcel = (data, sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });
  return excelBuffer;
};
module.exports = { exportToExcel };
