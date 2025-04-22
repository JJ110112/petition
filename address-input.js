/**
 * 地址輸入元件處理邏輯
 */
document.addEventListener('DOMContentLoaded', function () {
    // 獲取DOM元素
    const districtSelect = document.getElementById('district');
    const liInput = document.getElementById('li');
    const linInput = document.getElementById('lin');
    const addressRemainInput = document.getElementById('addressRemain');
    const combinedAddressInput = document.getElementById('address');

    // 更新組合地址的函數
    window.updateCombinedAddress = function () {
        const district = districtSelect.value;
        const li = liInput.value.trim();
        const lin = linInput.value.trim();
        const addressRemain = addressRemainInput.value.trim();

        // 組合完整地址
        let combinedAddress = `臺北市${district}`;

        if (li) {
            combinedAddress += `${li}里`;
        }

        if (lin) {
            combinedAddress += `${lin}鄰`;
        }

        if (addressRemain) {
            combinedAddress += ` ${addressRemain}`;
        }

        // 更新隱藏的完整地址欄位
        combinedAddressInput.value = combinedAddress;

        // 即時驗證地址
        const addressErrors = validateAddress(combinedAddress);
        if (addressErrors.length > 0) {
            document.getElementById('addressError').textContent = addressErrors.join('、');
        } else {
            document.getElementById('addressError').textContent = '';
        }
    };

    // 監聽所有地址相關元件的變更
    districtSelect.addEventListener('change', updateCombinedAddress);
    liInput.addEventListener('input', updateCombinedAddress);
    linInput.addEventListener('input', updateCombinedAddress);
    addressRemainInput.addEventListener('input', updateCombinedAddress);

    // 嘗試從隱藏地址欄位反向填入分解地址
    function populateAddressComponents() {
        const address = combinedAddressInput.value;
        if (!address) return;

        try {
            // 處理區域
            if (address.includes("文山區")) {
                districtSelect.value = "文山區";
            } else if (address.includes("中正區")) {
                districtSelect.value = "中正區";
            }

            // 處理里別
            const liMatch = address.match(/[^\s]+里/);
            if (liMatch) {
                const li = liMatch[0].replace('里', '');
                liInput.value = li;
            }

            // 處理鄰數
            const linMatch = address.match(/\d+鄰/);
            if (linMatch) {
                const lin = linMatch[0].replace('鄰', '');
                linInput.value = lin;
            }

            // 處理剩餘地址
            let remainingAddress = address;

            // 移除"臺北市"和區名
            remainingAddress = remainingAddress.replace(/臺北市|台北市/, '').replace(/文山區|中正區/, '');

            // 移除里名和鄰數
            if (liMatch) {
                remainingAddress = remainingAddress.replace(liMatch[0], '');
            }
            if (linMatch) {
                remainingAddress = remainingAddress.replace(linMatch[0], '');
            }

            // 設定剩餘地址
            addressRemainInput.value = remainingAddress.trim();

        } catch (error) {
            console.error("地址分解錯誤:", error);
        }
    }

    // 監聽清除按鈕
    document.getElementById('clearBtn').addEventListener('click', function () {
        // 清除地址相關欄位
        liInput.value = "";
        linInput.value = "";
        addressRemainInput.value = "";
        // 其他欄位在main.js中已經處理
    });

    // 初始化時嘗試分解地址
    if (combinedAddressInput.value) {
        populateAddressComponents();
    }
});
