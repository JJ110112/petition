/**
 * 地址輸入元件的相關功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有地址相關元素
    const districtSelect = document.getElementById('district');
    const liInput = document.getElementById('li');
    const linInput = document.getElementById('lin');
    const addressRemainInput = document.getElementById('addressRemain');
    const fullAddressInput = document.getElementById('address');
    const addressError = document.getElementById('addressError');
    
    // 更新完整地址的函數
    function updateFullAddress() {
        const district = districtSelect.value;
        const li = liInput.value;
        const lin = linInput.value;
        const remain = addressRemainInput.value;
        
        // 組合完整地址
        let fullAddress = `臺北市${district}`;
        if (li) {
            fullAddress += `${li}里`;
        }
        if (lin) {
            fullAddress += `${lin}鄰`;
        }
        if (remain) {
            fullAddress += remain;
        }
        
        // 更新隱藏的完整地址欄位
        fullAddressInput.value = fullAddress;
        
        // 觸發驗證
        const inputEvent = new Event('input');
        fullAddressInput.dispatchEvent(inputEvent);
    }
    
    // 解析現有地址並填入各個元件
    function parseExistingAddress() {
        const address = fullAddressInput.value;
        
        if (!address) return;
        
        // 處理區域
        if (address.includes('文山區')) {
            districtSelect.value = '文山區';
        } else if (address.includes('中正區')) {
            districtSelect.value = '中正區';
        }
        
        // 處理里別
        const liMatch = address.match(/([^\s]+)里/);
        if (liMatch && liMatch[1]) {
            // 移除區域前綴
            let li = liMatch[1];
            li = li.replace('文山區', '').replace('中正區', '');
            liInput.value = li;
        }
        
        // 處理鄰別
        const linMatch = address.match(/(\d+)鄰/);
        if (linMatch && linMatch[1]) {
            linInput.value = linMatch[1];
        }
        
        // 處理剩餘地址
        const linIndex = address.indexOf('鄰');
        if (linIndex > -1) {
            // 從「鄰」後開始
            addressRemainInput.value = address.substring(linIndex + 1).trim();
        } else {
            // 如果沒有找到「鄰」，則從「里」之後開始
            const liIndex = address.indexOf('里');
            if (liIndex > -1) {
                addressRemainInput.value = address.substring(liIndex + 1).trim();
            }
        }
    }
    
    // 為所有地址元件添加事件監聽器
    districtSelect.addEventListener('change', updateFullAddress);
    liInput.addEventListener('input', updateFullAddress);
    linInput.addEventListener('input', updateFullAddress);
    addressRemainInput.addEventListener('input', updateFullAddress);
    
    // 原始清除按鈕功能擴展
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        // 儲存原來的點擊事件
        const originalClickHandler = clearBtn.onclick;
        
        // 設置新的點擊事件
        clearBtn.onclick = function() {
            // 如果有原始處理函數，先執行
            if (typeof originalClickHandler === 'function') {
                originalClickHandler();
            }
            
            // 清除地址輸入元件
            districtSelect.value = '文山區';
            liInput.value = '';
            linInput.value = '';
            addressRemainInput.value = '';
            
            // 更新隱藏的完整地址欄位
            fullAddressInput.value = '';
        };
    }
    
    // 初始化
    if (fullAddressInput.value) {
        parseExistingAddress();
    } else {
        updateFullAddress();
    }
});