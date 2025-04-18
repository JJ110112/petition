/**
 * 驗證相關函數
 */

/**
 * 從地址提取里別
 * @param {string} address - 用戶輸入的地址
 * @returns {string} - 提取出的里別，如果找不到則返回空字串
 */
function extractLiFromAddress(address) {
    const liIndex = address.indexOf('里');

    if (liIndex !== -1 && liIndex >= 2) {
        return address.substring(liIndex - 2, liIndex);
    }

    return '';
}

/**
 * 驗證地址格式
 * @param {string} address - 用戶輸入的地址
 * @returns {Array} - 錯誤訊息陣列，如果沒有錯誤則為空陣列
 */
function validateAddress(address) {
    let errorMessages = [];
    // 檢查是否以「台北市」或「臺北市」開頭
    if (!address.startsWith('台北市') && !address.startsWith('臺北市')) {
        errorMessages.push('地址必須以「台北市」或「臺北市」開頭');
    }
    // 檢查是否包含「文山區」或「中正區」
    if (address.indexOf('文山區') === -1 && address.indexOf('中正區') === -1) {
        errorMessages.push('地址必須包含「文山區」或「中正區」');
    }
    // 檢查是否包含「里」與「鄰」
    if (address.indexOf('里') === -1) {
        errorMessages.push('地址必須包含「里」');
    }
    if (address.indexOf('鄰') === -1) {
        errorMessages.push('地址必須包含「鄰」');
    }
    // 檢查是否包含「路」或「街」
    if (address.indexOf('路') === -1 && address.indexOf('街') === -1) {
        errorMessages.push('地址必須包含「路」或「街」');
    }
    // 檢查「段」之前為國字（一～九）
    const segmentIndex = address.indexOf('段');
    if (segmentIndex !== -1) {
        const charBeforeSegment = address.charAt(segmentIndex - 1);
        if (!['一', '二', '三', '四', '五', '六', '七', '八', '九'].includes(charBeforeSegment)) {
            errorMessages.push('「段」之前必須為國字（一～九）');
        }
    }
    // 修正後的樓層檢查邏輯，允許一位到三位國字
    const floorIndex = address.indexOf('樓');
    if (floorIndex !== -1) {
        // 檢查「樓」前面可能是一到三位的國字
        const chineseNumerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        let isValid = false;
        // 檢查前三個字符，支援像「二十一樓」這樣的格式
        let checkLength = Math.min(3, floorIndex);
        let floorText = address.substring(floorIndex - checkLength, floorIndex);

        // 簡單檢查：如果包含任何中文數字就視為有效
        // 這種方法比逐字檢查更寬鬆，能接受各種組合
        for (let num of chineseNumerals) {
            if (floorText.includes(num)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            errorMessages.push('「樓」之前必須為一位到三位國字（例如：一樓、十樓、二十一樓）');
        }
    }

    // 檢查「巷」、「弄」之前若出現，需為阿拉伯數字
    const alleyIndex = address.indexOf('巷');
    if (alleyIndex !== -1) {
        // 獲取「巷」之前的所有數字
        let i = alleyIndex - 1;
        let hasDigit = false;
        while (i >= 0 && /^\d$/.test(address.charAt(i))) {
            hasDigit = true;
            i--;
        }
        if (!hasDigit) {
            errorMessages.push('「巷」之前必須為阿拉伯數字');
        }
    }

    const laneIndex = address.indexOf('弄');
    if (laneIndex !== -1) {
        // 獲取「弄」之前的所有數字
        let i = laneIndex - 1;
        let hasDigit = false;
        while (i >= 0 && /^\d$/.test(address.charAt(i))) {
            hasDigit = true;
            i--;
        }
        if (!hasDigit) {
            errorMessages.push('「弄」之前必須為阿拉伯數字');
        }
    }

    // 處理「之」的情況
    // 檢查是否包含「號」
    const numberIndex = address.indexOf('號');
    if (numberIndex === -1) {
        errorMessages.push('地址必須包含「號」');
    } else {
        // 檢查「號」之前的格式：可能是「數字號」或「數字之數字號」
        // 向前尋找連續數字或「之+數字」的模式
        let isValidNumberFormat = false;
        let i = numberIndex - 1;

        // 先檢查「號」前是否直接是數字
        if (i >= 0 && /^\d$/.test(address.charAt(i))) {
            isValidNumberFormat = true;

            // 繼續向前檢查是否有更多數字
            while (i >= 0 && /^\d$/.test(address.charAt(i))) {
                i--;
            }

            // 如果遇到「之」字
            if (i >= 0 && address.charAt(i) === '之') {
                // 「之」前面也必須是數字
                if (i - 1 >= 0 && /^\d$/.test(address.charAt(i - 1))) {
                    isValidNumberFormat = true;
                } else {
                    isValidNumberFormat = false;
                    errorMessages.push('「之」之前必須為阿拉伯數字');
                }
            }
        } else {
            isValidNumberFormat = false;
        }

        if (!isValidNumberFormat) {
            errorMessages.push('「號」之前必須為阿拉伯數字，或遵循「數字之數字號」的格式');
        }
    }

    // 檢查樓層後是否有「之+數字」的格式
    if (floorIndex !== -1) {
        let j = floorIndex + 1;
        if (j < address.length && address.charAt(j) === '之') {
            // 「之」後面必須是數字
            if (j + 1 < address.length && !/^\d$/.test(address.charAt(j + 1))) {
                errorMessages.push('樓層後的「之」後必須為阿拉伯數字');
            }
        }
    }

    // 禁止特殊符號（保留常用中文地址符號）
    const invalidCharPattern = /[^a-zA-Z0-9一-龥\s里鄰路街段巷弄號之樓]/g;
    if (invalidCharPattern.test(address)) {
        errorMessages.push('地址不可包含特殊符號');
    }

    return errorMessages;
}

/**
 * 驗證身分證字號
 * @param {string} id - 用戶輸入的身分證字號
 * @returns {boolean} - 是否符合身分證字號格式
 */
function validateID(id) {
    const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
    const idRegex = /^[A-Z][1-2]\d{8}$/;

    if (!idRegex.test(id)) {
        return false;
    }

    const letterIndex = letters.indexOf(id.charAt(0));
    if (letterIndex === -1) {
        return false;
    }

    // 這裡可以加上完整的身分證字號檢查演算法
    return true;
}

/**
 * 驗證電子郵件格式
 * @param {string} email - 用戶輸入的電子郵件
 * @returns {boolean} - 是否符合電子郵件格式
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 驗證手機號碼格式
 * @param {string} phone - 用戶輸入的手機號碼
 * @returns {boolean} - 是否符合手機號碼格式
 */
function validatePhone(phone) {
    return /^09\d{8}$/.test(phone);
}

/**
 * 解析出生年月日格式為年、月、日的物件
 * @param {string} birthDateStr - 用戶輸入的出生年月日 (例如: 88.1.25)
 * @returns {Object} - 包含年、月、日的物件
 */
function parseBirthDate(birthDateStr) {
    const parts = birthDateStr.split('.');
    if (parts.length === 3) {
        return {
            year: parts[0].trim(),
            month: parts[1].trim(),
            day: parts[2].trim()
        };
    }
    return null;
}

/**
 * 格式化出生年月日為「88 年 1 月 25 日」格式
 * @param {string} birthDateStr - 用戶輸入的出生年月日 (例如: 88.1.25)
 * @returns {string} - 格式化後的出生年月日
 */
function formatBirthDate(birthDateStr) {
    const birthDate = parseBirthDate(birthDateStr);
    if (birthDate) {
        return `${birthDate.year} 年 ${birthDate.month} 月 ${birthDate.day} 日`;
    }
    return birthDateStr; // 如果解析失敗，返回原始字串
}

/**
 * 獲取當前日期
 * @returns {Object} - 包含月份和日期的物件
 */
function getCurrentDate() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    return {
        month: currentMonth,
        date: currentDate
    };
}

/**
 * 驗證表單所有欄位
 * @returns {boolean} - 表單是否通過驗證
 */
function validateForm() {
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value.toUpperCase();
    const birthDate = document.getElementById('birthDate').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    let hasError = false;

    if (!name) {
        document.getElementById('nameError').textContent = '請輸入姓名';
        hasError = true;
    } else {
        document.getElementById('nameError').textContent = '';
    }

    if (!id) {
        document.getElementById('idError').textContent = '請輸入身分證字號';
        hasError = true;
    } else if (!/^[A-Z][0-9]{9}$/.test(id)) {
        document.getElementById('idError').textContent = '身分證字號格式錯誤，需為1個大寫英文字母＋9碼數字';
        hasError = true;
    } else {
        document.getElementById('idError').textContent = '';
    }

    if (!birthDate) {
        document.getElementById('birthError').textContent = '請輸入出生年月日';
        hasError = true;
    } else if (birthDate.length > 8) {
        document.getElementById('birthError').textContent = '出生年月日格式錯誤，請勿超過8個字';
        hasError = true;
    } else {
        document.getElementById('birthError').textContent = '';
    }

    if (!address) {
        document.getElementById('addressError').textContent = '請輸入地址';
        hasError = true;
    } else {
        // 驗證地址格式
        const addressErrors = validateAddress(address);
        if (addressErrors.length > 0) {
            document.getElementById('addressError').textContent = addressErrors.join('、');
            hasError = true;
        } else {
            document.getElementById('addressError').textContent = '';
        }
    }

    if (!phone) {
        document.getElementById('phoneError').textContent = '請輸入手機號碼';
        hasError = true;
    } else if (!validatePhone(phone)) {
        document.getElementById('phoneError').textContent = '手機號碼格式不正確，請輸入09開頭的10位數字';
        hasError = true;
    } else {
        document.getElementById('phoneError').textContent = '';
    }

    const email = document.getElementById('email').value;
    if (email && !validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Email 格式不正確';
        hasError = true;
    } else {
        document.getElementById('emailError').textContent = '';
    }

    const addressConfirmed = document.getElementById('addressConfirm').checked;
    if (!addressConfirmed) {
        document.getElementById('addressConfirmError').textContent = '請確認地址與身分證背面一致';
        hasError = true;
    } else {
        document.getElementById('addressConfirmError').textContent = '';
    }

    return !hasError;
}
