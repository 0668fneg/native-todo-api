// 1. 核心工具：filter 配合 indexOf 去重
const numbers = [1, 2, 1, 3];

// indexOf 具有只回傳首位的特性
console.log("第一個1的位置:", numbers.indexOf(1));
console.log("第二個1的位置:", numbers.indexOf(1));

// 用 filter 工具歷遍每個數字的位置。
const filtered = numbers.filter((item, index) => {
  console.log(
    `正在檢查: ${item}, 它的位置是: ${index}, 第一次出現的位置是: ${numbers.indexOf(
      item
    )}`
  );
  // 利用indexOf（item）查找 number 首次出現位置與現在實際位置做對比，返回對比後的值。
  return numbers.indexOf(item) === index;
});

console.log("最後留下的:", filtered);

// 用 Set 方法去重
const data = [1, 2, 2, 3, 3, 5, "A", "A"];

// 調用 Set 去重的寫法
const uniqueWithSet = [...new Set(data)];

console.log("使用 Set 去重的結果:", uniqueWithSet);

// 2 深拷貝（工具: typeof, Array.isArray)
function deepClone(obj) {
  // 判斷是否爲基本類型，如果不是引用對象或者是null ，可直接返回。
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 初始化回傳值：判斷原數據是數組還是對象
  const copy = Array.isArray(obj) ? [] : {};

  // 遍歷對象：使用for...in 拿到每一個 key
  for (let key in obj) {
    // 確保這個 key 是封象自身的，而不是原型鏈上的
    if (obj.hasOwnProperty(key)) {
      // 如果裏面還是有對象， 就再進去拷貝多一次
      copy[key] = deepClone(obj[key]);
    }
  }
  return copy;
}

const user = {
  name: "Feng",
  skills: ["Node.js", "Git"],
  address: { city: "MO" },
};

const newUser = deepClone(user);

newUser.skills.push("PostgreSQL");
newUser.address.city = "Hong Kong";

console.log("副本已修改:", newUser.address.city, newUser.skills);
console.log("原件保持不變:", user.address.city);
console.log("原來的數據:", user.name, user.skills, user.address);

// 3 數據格式轉換（核心工具:map())
const rawUsers = [
  { id: 1, firstName: "Hugo", lastName: "Feng", status: "completed" },
  { id: 2, firstName: "San", lastName: "Zhang", status: "pending" },
];

const transformData = (data) => {
  return data.map((item) => {
    return {
      userId: item.id,
      fullName: `${item.firstName} ${item.lastName}`,
      isDone: item.status === "completed",
    };
  });
};
const formattedUsers = transformData(rawUsers);

console.log("轉換後的格式:", formattedUsers);

// 4 日期格式化 (工具: getFullYear(), getMoth(), getDate()).
function formatDate(date) {
  // 獲取年、月、日
  const year = date.getFullYear();
  // 特殊點，月份 +1，因為 JS 的月份是 0-11
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 補零邏輯 (數據庫或正式報表中，通常要求統一長度，即 2026-01-06)
  // 如果小於 10，就在前面加個 "0"
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  //  返回最終格式
  return `${year}-${formattedMonth}-${formattedDay}`;
}

const today = new Date();
console.log("原始日期對象:", today);
console.log("格式化後的日期:", formatDate(today));
