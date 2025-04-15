document.addEventListener('DOMContentLoaded', function () {
    // 獲取DOM元素
    const form = document.getElementById('petitionForm');
    const previewBtn = document.getElementById('previewBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const previewContainer = document.getElementById('previewContainer');
    const tab1Btn = document.getElementById('tab1Btn');
    const tab2Btn = document.getElementById('tab2Btn');
    const previewTab1 = document.getElementById('previewTab1');
    const previewTab2 = document.getElementById('previewTab2');
    const canvas1 = document.getElementById('previewCanvas1');
    const canvas2 = document.getElementById('previewCanvas2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const previewPlaceholder1 = document.getElementById('previewPlaceholder1');
    const previewPlaceholder2 = document.getElementById('previewPlaceholder2');
    const previewText1 = document.getElementById('previewText1');
    const previewText2 = document.getElementById('previewText2');
    const liDisplay = document.getElementById('liDisplay');
    const loading = document.getElementById('loading');
    const loadingMessage = document.getElementById('loadingMessage');
    const addressInput = document.getElementById('address');
    const addressError = document.getElementById('addressError');

    // 設置默認寬高
    canvas1.width = 800;
    canvas1.height = 600;
    canvas2.width = 800;
    canvas2.height = 600;

    // 聲明書和連署書圖片
    let page1Image = new Image();
    let page2Image = new Image();
    let page1Loaded = false;
    let page2Loaded = false;

    // 載入圖片
    page1Image.src = 'page1.jpg';
    page2Image.src = 'page2.jpg';

    page1Image.onload = function () {
        canvas1.width = page1Image.width;
        canvas1.height = page1Image.height;
        page1Loaded = true;
    };

    page1Image.onerror = function () {
        console.error('無法載入聲明書範本圖片 page1.jpg');
        canvas1.style.display = 'none';
        previewPlaceholder1.style.display = 'flex';
        page1Loaded = false;
    };

    page2Image.onload = function () {
        canvas2.width = page2Image.width;
        canvas2.height = page2Image.height;
        page2Loaded = true;
    };

    page2Image.onerror = function () {
        console.error('無法載入連署書範本圖片 page2.jpg');
        canvas2.style.display = 'none';
        previewPlaceholder2.style.display = 'flex';
        page2Loaded = false;
    };

    // 聲明書(page1)繪製座標定義
    const DECLARATION_COORDS = {
        // 姓名(簽名)座標位置
        NAME_X: 1300,
        NAME_Y: 975,

        // 手機號碼座標位置
        PHONE_X: 1300,
        PHONE_Y: 1030,

        // Email座標位置
        EMAIL_X: 1252,
        EMAIL_Y: 1076,

        // 里別座標位置
        LI_X: 1327,
        LI_Y: 1131,

        // 簽署日期 - 月份座標位置
        MONTH_X: 1305,
        MONTH_Y: 1189,

        // 簽署日期 - 日期座標位置
        DAY_X: 1415,
        DAY_Y: 1189
    };

    // 連署書(page2)繪製座標定義
    const PETITION_COORDS = {
        // 姓名座標位置
        NAME_X: 335,
        NAME_Y: 475,

        // 身分證字號起始座標及間距
        ID_START_X: 212,  // 第一碼X座標
        ID_Y: 530,        // 身分證字號Y座標
        ID_SPACING: 38,   // 每一碼之間的間距

        // 出生年月日座標位置
        BIRTH_DATE_X: 630,
        BIRTH_DATE_Y: 500,

        // 地址第一行座標位置
        ADDRESS_LINE1_X: 810,
        ADDRESS_LINE1_Y: 475,

        // 地址第二行座標位置
        ADDRESS_LINE2_X: 810,
        ADDRESS_LINE2_Y: 522
    };

    // 切換頁籤
    tab1Btn.addEventListener('click', function () {
        tab1Btn.classList.add('active');
        tab2Btn.classList.remove('active');
        previewTab1.classList.add('active');
        previewTab2.classList.remove('active');
    });

    tab2Btn.addEventListener('click', function () {
        tab2Btn.classList.add('active');
        tab1Btn.classList.remove('active');
        previewTab2.classList.add('active');
        previewTab1.classList.remove('active');
    });

    // 從地址提取里別
    function extractLiFromAddress(address) {
        const liIndex = address.indexOf('里');

        if (liIndex !== -1 && liIndex >= 2) {
            return address.substring(liIndex - 2, liIndex);
        }

        return '';
    }

    // 驗證地址格式
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

    // 監聽地址變更，即時更新里別顯示與檢查格式
    addressInput.addEventListener('input', function () {
        const address = this.value;
        const li = extractLiFromAddress(address);
        //liDisplay.textContent = li || '無法識別';

        // 即時檢查地址格式
        const addressErrors = validateAddress(address);
        if (addressErrors.length > 0) {
            addressError.textContent = addressErrors.join('、');
        } else {
            addressError.textContent = '';
        }
    });

    // 獲取當前日期
    function getCurrentDate() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();
        return {
            month: currentMonth,
            date: currentDate
        };
    }

    // 驗證身分證字號
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

    // 驗證手機號碼

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    function validatePhone(phone) {
        return /^09\d{8}$/.test(phone);
    }

    // 繪製聲明書
    function drawDeclaration() {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const li = extractLiFromAddress(address);
        const currentDate = getCurrentDate();

        if (page1Loaded) {
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
            ctx1.drawImage(page1Image, 0, 0);

            ctx1.font = 'bold 24px "Microsoft JhengHei"';
            ctx1.fillStyle = 'black';

            // 繪製姓名(簽名)
            ctx1.fillText(name, DECLARATION_COORDS.NAME_X, DECLARATION_COORDS.NAME_Y);

            // 繪製手機號碼
            ctx1.fillText(phone, DECLARATION_COORDS.PHONE_X, DECLARATION_COORDS.PHONE_Y);

            // 繪製email (如果有)
            if (email) {
                ctx1.fillText(email, DECLARATION_COORDS.EMAIL_X, DECLARATION_COORDS.EMAIL_Y);
            }

            // 繪製里別
            ctx1.fillText(li, DECLARATION_COORDS.LI_X, DECLARATION_COORDS.LI_Y);

            // 繪製當前日期
            ctx1.fillText(currentDate.month, DECLARATION_COORDS.MONTH_X, DECLARATION_COORDS.MONTH_Y);
            ctx1.fillText(currentDate.date, DECLARATION_COORDS.DAY_X, DECLARATION_COORDS.DAY_Y);

            canvas1.style.display = 'block';
            previewPlaceholder1.style.display = 'none';
        } else {
            // 使用純文字顯示
            previewText1.innerHTML = `
                                            <h3>聲明書資料</h3>
                                            <p><strong>簽名：</strong> ${name}</p>
                                            <p><strong>聯絡手機：</strong> ${phone}</p>
                                            <p><strong>Email：</strong> ${email || '(未填寫)'}</p>
                                            <p><strong>里別：</strong> ${li || '(未識別)'}</p>
                                            <p><strong>簽署日期：</strong> ${currentDate.month}月${currentDate.date}日</p>
                                        `;

            canvas1.style.display = 'none';
            previewPlaceholder1.style.display = 'flex';
        }

        return true;
    }

    // 繪製連署書
    function drawPetition() {
        const name = document.getElementById('name').value;
        const id = document.getElementById('id').value.toUpperCase();
        const birthDate = document.getElementById('birthDate').value;
        const address = document.getElementById('address').value;

        // 地址分行處理
        let addressLine1 = '';
        let addressLine2 = '';

        if (address) {
            // 找出「段」、「路」或「街」的位置
            const segmentIndex = address.indexOf('段');
            const roadIndex = address.indexOf('路');
            const streetIndex = address.indexOf('街');

            // 取三者中最後出現的位置作為分隔點
            let splitIndex = Math.max(segmentIndex, roadIndex, streetIndex);

            if (splitIndex !== -1) {
                // 分隔點存在，將地址分為兩部分
                addressLine1 = address.substring(0, splitIndex + 1); // 包含「段」「路」或「街」
                addressLine2 = address.substring(splitIndex + 1);
            } else {
                // 如果沒有找到分隔點，全部放第一行
                addressLine1 = address;
            }
        }

        if (page2Loaded) {
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            ctx2.drawImage(page2Image, 0, 0);

            ctx2.font = 'bold 26px "Microsoft JhengHei"';
            ctx2.fillStyle = 'black';

            // 繪製姓名
            ctx2.fillText(name, PETITION_COORDS.NAME_X, PETITION_COORDS.NAME_Y);

            // 繪製身分證字號十碼
            for (let i = 0; i < id.length; i++) {
                // 計算每個字元的 x 位置
                const xPos = PETITION_COORDS.ID_START_X + (i * PETITION_COORDS.ID_SPACING);
                ctx2.fillText(id.charAt(i), xPos, PETITION_COORDS.ID_Y);
            }

            // 繪製出生年月日
            ctx2.fillText(birthDate, PETITION_COORDS.BIRTH_DATE_X, PETITION_COORDS.BIRTH_DATE_Y);

            // 繪製地址（兩行）
            ctx2.fillText(addressLine1, PETITION_COORDS.ADDRESS_LINE1_X, PETITION_COORDS.ADDRESS_LINE1_Y);
            if (addressLine2) {
                ctx2.fillText(addressLine2, PETITION_COORDS.ADDRESS_LINE2_X, PETITION_COORDS.ADDRESS_LINE2_Y);
            }

            canvas2.style.display = 'block';
            previewPlaceholder2.style.display = 'none';
        } else {
            // 使用純文字顯示
            previewText2.innerHTML = `
                                            <h3>連署書資料</h3>
                                            <p><strong>姓名：</strong> ${name}</p>
                                            <p><strong>身分證字號：</strong> ${id}</p>
                                            <p><strong>出生年月日：</strong> ${birthDate}</p>
                                            <p><strong>戶籍地址第一行：</strong> ${addressLine1}</p>
                                            <p><strong>戶籍地址第二行：</strong> ${addressLine2 || '(無)'}</p>
                                        `;

            canvas2.style.display = 'none';
            previewPlaceholder2.style.display = 'flex';
        }

        return true;
    }

    // 驗證表單
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

    // 預覽按鈕點擊事件
    previewBtn.addEventListener('click', function () {
        if (validateForm()) {
            loading.style.display = 'flex';
            loadingMessage.textContent = '生成預覽中，請稍候...';

            // 使用setTimeout模擬異步操作，讓loading顯示出來
            setTimeout(function () {
                drawDeclaration();
                drawPetition();

                previewContainer.style.display = 'block';
                printBtn.disabled = false;

                // 滾動到預覽區域
                previewContainer.scrollIntoView({ behavior: "smooth" });

                loading.style.display = 'none';
            }, 500);
        }
    });

    // 清除按鈕點擊事件
    clearBtn.addEventListener('click', function () {
        document.getElementById('name').value = "";
        document.getElementById('id').value = "";
        document.getElementById('birthDate').value = "";
        document.getElementById('address').value = "";
        document.getElementById('phone').value = "";
        document.getElementById('email').value = "";

        // 清除錯誤訊息
        document.getElementById('nameError').textContent = "";
        document.getElementById('idError').textContent = "";
        document.getElementById('birthError').textContent = "";
        document.getElementById('addressError').textContent = "";
        document.getElementById('phoneError').textContent = "";

        // 更新里別顯示
        //liDisplay.textContent = "無法識別";
    });

    // 列印按鈕點擊事件
    printBtn.addEventListener('click', function () {
        loading.style.display = 'flex';
        loadingMessage.textContent = '準備列印中，請稍候...';

        setTimeout(function () {
            // 獲取資料
            const name = document.getElementById('name').value;
            const id = document.getElementById('id').value.toUpperCase();
            const birthDate = document.getElementById('birthDate').value;
            const address = document.getElementById('address').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const li = extractLiFromAddress(address);
            const currentDate = getCurrentDate();

            // 獲取兩頁canvas的圖片資料
            const dataUrl1 = page1Loaded ? canvas1.toDataURL('image/png') : null;
            const dataUrl2 = page2Loaded ? canvas2.toDataURL('image/png') : null;

            // 處理地址拆分
            let addressLine1 = '';
            let addressLine2 = '';

            if (address) {
                // 找出「段」、「路」或「街」的位置
                const segmentIndex = address.indexOf('段');
                const roadIndex = address.indexOf('路');
                const streetIndex = address.indexOf('街');

                // 取三者中最後出現的位置作為分隔點
                let splitIndex = Math.max(segmentIndex, roadIndex, streetIndex);

                if (splitIndex !== -1) {
                    // 分隔點存在，將地址分為兩部分
                    addressLine1 = address.substring(0, splitIndex + 1); // 包含「段」「路」或「街」
                    addressLine2 = address.substring(splitIndex + 1);
                } else {
                    // 如果沒有找到分隔點，全部放第一行
                    addressLine1 = address;
                }
            }

            // 創建列印內容
            let htmlContent = `
                                            <html>
                                            <head>
                                                <title>連署文件</title>
                                                <style>
                                                @page {
                                                size: landscape;
                                                margin: 0;
                                            }
                                            body {
                                                margin: 0;
                                                padding: 0;
                                            }
                                            .page {
                                                page-break-after: always;
                                                margin: 0;
                                                padding: 0;
                                            }
                                            .last-page {
                                                page-break-after: avoid;
                                            }
                                            img {
                                                max-width: 100%;
                                                height: auto;
                                                display: block;
                                                margin: 0 auto;
                                            }
                                            .text-page {
                                                font-family: "Microsoft JhengHei", "PMingLiU", sans-serif;
                                                max-width: 800px;
                                                margin: 0 auto;
                                                padding: 40px 20px;
                                                border: 1px solid #000;
                                            }
                                            h1 {
                                                text-align: center;
                                                margin-bottom: 30px;
                                            }
                                            .section {
                                                margin-bottom: 30px;
                                            }
                                            .field {
                                                margin-bottom: 15px;
                                            }
                                            .field strong {
                                                display: inline-block;
                                                width: 120px;
                                            }
                                            .important-note {
                                                background-color: #ffecb3;
                                                border: 2px solid #ffa000;
                                                padding: 15px;
                                                margin: 15px 0;
                                                text-align: center;
                                                font-weight: bold;
                                            }
                                            @media print {
                                                body { margin: 0; }
                                                .page { margin: 0; padding: 0; }
                                                .text-page { border: none; }
                                                @page { size: landscape; margin: 0; }
                                            }

                                                </style>
                                            </head>
                                            <body>
                                        `;

            // 第一頁 - 聲明書
            if (dataUrl1) {
                htmlContent += `
                                                <div class="page">
                                                    <img src="${dataUrl1}" alt="聲明書" />
                                                </div>
                                            `;
            } else {
                htmlContent += `
                                                <div class="page text-page">
                                                    <h1>臺北市第8選舉區立法委員賴士葆免案聲明書</h1>
                                                    <div class="section">
                                                        <div class="field"><strong>簽名：</strong>${name}</div>
                                                        <div class="field"><strong>聯絡手機：</strong>${phone}</div>
                                                        <div class="field"><strong>Email：</strong>${email || '(未填寫)'}</div>
                                                        <div class="field"><strong>里別：</strong>${li || '(未識別)'}</div>
                                                        <div class="field"><strong>簽署日期：</strong>${currentDate.month}月${currentDate.date}日</div>
                                                    </div>
                                                </div>
                                            `;
            }

            // 第二頁 - 連署書
            if (dataUrl2) {
                htmlContent += `
                                                <div class="last-page">
                                                    <img src="${dataUrl2}" alt="連署書" />
                                                </div>
                                            `;
            } else {
                htmlContent += `
                                                <div class="last-page text-page">
                                                    <h1>臺北市第8選舉區立法委員賴士葆免案連署書</h1>
                                                    <div class="section">
                                                        <div class="field"><strong>姓名：</strong>${name}</div>
                                                        <div class="field"><strong>身分證字號：</strong>${id}</div>
                                                        <div class="field"><strong>出生年月日：</strong>${birthDate}</div>
                                                        <div class="field"><strong>戶籍地址：</strong>${addressLine1} ${addressLine2}</div>
                                                    </div>
                                                </div>
                                            `;
            }

            //結束HTML
            htmlContent += `
                                                <script>
                                                    window.onload = function() {
                                                        setTimeout(function() {
                                                            window.print();
                                                        }, 500);
                                                    }
                                                <\/script>
                                            </body>
                                            </html>
                                        `;

            //開啟新視窗並列印 
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            loading.style.display = 'none';
        }, 500);
    });

    // 初始化時執行一次地址提取，顯示里別
    const initialAddress = document.getElementById('address').value;
    const initialLi = extractLiFromAddress(initialAddress);
    //liDisplay.textContent = initialLi || '無法識別';

    // 初始化時檢查地址格式
    const initialAddressErrors = validateAddress(initialAddress);
    if (initialAddressErrors.length > 0) {
        addressError.textContent = initialAddressErrors.join('、');
    }
});
