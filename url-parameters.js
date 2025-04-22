/**
 * 處理URL參數並填入表單
 * 修正版：去除地址中的所有空白，再進行處理
 */
function getUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    // 獲取所有URL參數
    for (const [key, value] of urlParams.entries()) {
        params[key] = decodeURIComponent(value);
    }

    return params;
}

/**
 * 標準化生日格式
 * 將各種格式轉換為標準格式 (例如: 88.1.25)
 */
function standardizeBirthDate(birthDate) {
    if (!birthDate) return '';

    // 去除所有空白
    birthDate = birthDate.trim();

    // 處理"民國xx年xx月xx日"格式
    let match = birthDate.match(/民國(\d+)年(\d+)月(\d+)日/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
    }

    // 處理"xx年xx月xx日"格式
    match = birthDate.match(/(\d+)年(\d+)月(\d+)日/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
    }

    // 處理"xxx/xx/xx"格式 (西元年轉民國年)
    match = birthDate.match(/^(19|20)(\d{2})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
        const westernYear = parseInt(match[1] + match[2]);
        const rocYear = westernYear - 1911;
        return `${rocYear}.${match[3]}.${match[4]}`;
    }

    // 處理"xx/xx/xx"格式 (已是民國年)
    match = birthDate.match(/^(\d{1,3})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
    }

    // 處理已經接近標準的格式，但使用/而不是.
    match = birthDate.match(/^(\d{1,3})\/(\d{1,2})\/(\d{1,2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
    }

    // 處理已經是標準的格式 (xx.xx.xx)
    match = birthDate.match(/^(\d{1,3})\.(\d{1,2})\.(\d{1,2})$/);
    if (match) {
        return birthDate; // 已經是標準格式
    }

    // 處理西元年格式，轉換為民國年 (例如: 1999-01-25)
    match = birthDate.match(/^(19|20)(\d{2})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
        const westernYear = parseInt(match[1] + match[2]);
        const rocYear = westernYear - 1911;
        return `${rocYear}.${match[3]}.${match[4]}`;
    }

    // 如果無法識別格式，則返回原始值
    return birthDate;
}

/**
 * 解析地址，提取區、里、鄰和剩餘地址
 * 修正版：地址中不應該有空白
 */
function parseAddress(address) {
    if (!address) return { district: '', li: '', lin: '', remain: '' };

    const result = {
        district: '',
        li: '',
        lin: '',
        remain: ''
    };

    // 首先去除地址中所有的空白
    address = address.replace(/\s+/g, '');

    // 檢查區域
    if (address.includes("中正區")) {
        result.district = "中正區";
    } else if (address.includes("文山區")) {
        result.district = "文山區";
    }

    // 從完整地址中提取里名
    // 找到「里」字的位置
    const liIndex = address.indexOf('里');
    if (liIndex > 0) {
        // 向前找到區名後的位置
        let startIndex = -1;

        // 找區名後面的位置
        const districtIndex = Math.max(
            address.indexOf('中正區'),
            address.indexOf('文山區')
        );

        if (districtIndex !== -1) {
            startIndex = districtIndex + 3; // '區'後的位置
        }

        // 提取里名
        if (startIndex !== -1 && startIndex < liIndex) {
            result.li = address.substring(startIndex, liIndex);
        } else {
            // 如果找不到合適的起始點，嘗試提取里前的部分
            // 但這是備用方案，可能不夠準確
            let tempStart = 0;
            // 如果包含「台北市」或「臺北市」，從其後開始
            if (address.includes("台北市")) {
                tempStart = address.indexOf("台北市") + 3;
            } else if (address.includes("臺北市")) {
                tempStart = address.indexOf("臺北市") + 3;
            }
            result.li = address.substring(tempStart, liIndex);
        }
    }

    // 檢查鄰
    const linMatch = address.match(/(\d+)鄰/);
    if (linMatch) {
        result.lin = linMatch[1];
    }

    // 處理剩餘地址
    let remainingAddress = address;

    // 建立需要移除的模式
    const patterns = [
        /[台臺]北市/g,  // 移除台北市/臺北市
        /中正區|文山區/g // 移除區名
    ];

    // 如果有里名，添加對應模式
    if (result.li) {
        patterns.push(new RegExp(result.li + '里', 'g'));
    }

    // 如果有鄰數，添加對應模式
    if (result.lin) {
        patterns.push(new RegExp(result.lin + '鄰', 'g'));
    }

    // 依次應用所有模式
    for (const pattern of patterns) {
        remainingAddress = remainingAddress.replace(pattern, '');
    }

    // 清理可能的前後標點符號
    remainingAddress = remainingAddress.replace(/^[,，、\s]+|[,，、\s]+$/g, '');

    result.remain = remainingAddress;

    return result;
}

/**
 * 將URL參數填入表單
 */
function populateFormFromUrl() {
    const params = getUrlParameters();
    let hasParams = false;

    // 填入姓名
    if (params.name) {
        document.getElementById('name').value = params.name;
        hasParams = true;
    }

    // 填入身分證字號
    if (params.id) {
        document.getElementById('id').value = params.id.toUpperCase();
        hasParams = true;
    }

    // 填入出生年月日
    if (params.birthDate) {
        // 使用 standardizeBirthDate 函數處理各種日期格式
        const standardizedDate = standardizeBirthDate(params.birthDate);
        document.getElementById('birthDate').value = standardizedDate;
        hasParams = true;
    }

    // 填入地址
    if (params.address) {
        // 先移除所有空白，然後再處理
        let address = params.address.replace(/\s+/g, '').trim();

        // 設定隱藏的完整地址欄位
        document.getElementById('address').value = address;

        // 分析地址並填入相應欄位
        try {
            // 使用優化後的地址解析函數
            const addressParts = parseAddress(address);

            // 填入區域
            if (addressParts.district) {
                document.getElementById('district').value = addressParts.district;
            }

            // 填入里名
            if (addressParts.li) {
                document.getElementById('li').value = addressParts.li;
            }

            // 填入鄰數
            if (addressParts.lin) {
                document.getElementById('lin').value = addressParts.lin;
            }

            // 填入剩餘地址
            if (addressParts.remain) {
                document.getElementById('addressRemain').value = addressParts.remain;
            }

            // 更新地址組合
            if (typeof updateCombinedAddress === 'function') {
                updateCombinedAddress();
            }
        } catch (error) {
            console.error("地址解析錯誤:", error);
            // 如果解析失敗，至少保留完整地址
        }

        hasParams = true;
    }

    // 填入手機號碼 (如果有的話)
    if (params.phone) {
        document.getElementById('phone').value = params.phone;
        hasParams = true;
    }

    // 填入Email (如果有的話)
    if (params.email) {
        document.getElementById('email').value = params.email;
        hasParams = true;
    }

    // 如果有任何參數被填入，自動勾選地址確認
    if (hasParams) {
        document.getElementById('addressConfirm').checked = true;

        // 自動驗證表單
        if (typeof validateForm === 'function' && validateForm()) {
            // 如果有自動填入參數，且參數有效，則自動滾動到表單位置
            const form = document.getElementById('petitionForm');
            if (form) {
                setTimeout(() => {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }

            // 檢查是否啟用自動預覽功能
            if (params.autoPreview === 'true' || params.autoPreview === '1') {
                // 自動點擊預覽按鈕
                setTimeout(() => {
                    const previewBtn = document.getElementById('previewBtn');
                    if (previewBtn) {
                        previewBtn.click();
                    }
                }, 1000);
            }
        }
    }

    // 執行地址驗證
    if (params.address && typeof validateAddress === 'function') {
        const addressErrors = validateAddress(params.address);
        if (addressErrors.length > 0) {
            document.getElementById('addressError').textContent = addressErrors.join('、');
        }
    }

    return hasParams;
}

// 當網頁載入完成時執行
document.addEventListener('DOMContentLoaded', function () {
    // 檢查URL是否包含參數
    if (window.location.search) {
        // 延遲執行，確保所有其他初始化已完成
        setTimeout(populateFormFromUrl, 300);
    }
});
