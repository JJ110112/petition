/**
 * 主程式邏輯 - 修改版
 */
document.addEventListener('DOMContentLoaded', function () {
    // 獲取DOM元素
    const form = document.getElementById('petitionForm');
    const previewBtn = document.getElementById('previewBtn');
    const printBtn = document.getElementById('printBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const clearBtn = document.getElementById('clearBtn');
    const previewContainer = document.getElementById('previewContainer');
    const loading = document.getElementById('loading');
    const loadingMessage = document.getElementById('loadingMessage');
    const addressInput = document.getElementById('address');
    const addressError = document.getElementById('addressError');

    // 加載圖片資源
    loadImages();

    // 檢查URL參數
    const urlParams = new URLSearchParams(window.location.search);

    // 如果沒有URL參數，則清除表單（初始狀態）
    if (!urlParams.toString()) {
        clearForm();
    }
    // URL參數會在url-parameters.js中處理

    // 監聽地址變更，即時更新里別顯示與檢查格式
    addressInput.addEventListener('input', function () {
        const address = this.value;

        // 即時檢查地址格式
        const addressErrors = validateAddress(address);
        if (addressErrors.length > 0) {
            addressError.textContent = addressErrors.join('、');
        } else {
            addressError.textContent = '';
        }
    });

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
                downloadPdfBtn.disabled = false;

                // 滾動到預覽區域
                previewContainer.scrollIntoView({ behavior: "smooth" });

                loading.style.display = 'none';
            }, 500);
        }
    });

    // 清除按鈕點擊事件
    clearBtn.addEventListener('click', clearForm);

    // 列印按鈕點擊事件
    printBtn.addEventListener('click', function () {
        loading.style.display = 'flex';
        loadingMessage.textContent = '準備列印中，請稍候...';

        setTimeout(function () {
            // 獲取資料
            const name = document.getElementById('name').value;
            const id = document.getElementById('id').value.toUpperCase();
            const birthDate = document.getElementById('birthDate').value;
            const formattedBirthDate = formatBirthDate(birthDate); // 格式化為年月日格式
            const address = document.getElementById('address').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const li = extractLiFromAddress(address);
            const currentDate = getCurrentDate();

            // 獲取兩頁canvas的圖片資料
            const dataUrl1 = page1Loaded ? document.getElementById('previewCanvas1').toDataURL('image/png') : null;
            const dataUrl2 = page2Loaded ? document.getElementById('previewCanvas2').toDataURL('image/png') : null;

            // 處理地址拆分（修改為「鄰」以後的地址顯示在第二行）
            let addressLine1 = '';
            let addressLine2 = '';

            if (address) {
                // 尋找「鄰」的位置
                const neighborhoodIndex = address.indexOf('鄰');

                if (neighborhoodIndex !== -1) {
                    // 找到「鄰」，分隔為兩部分
                    addressLine1 = address.substring(0, neighborhoodIndex + 1); // 包含「鄰」
                    addressLine2 = address.substring(neighborhoodIndex + 1);
                } else {
                    // 如果沒有找到「鄰」，回落到原來的邏輯
                    const segmentIndex = address.indexOf('段');
                    const roadIndex = address.indexOf('路');
                    const streetIndex = address.indexOf('街');
                    let splitIndex = Math.max(segmentIndex, roadIndex, streetIndex);

                    if (splitIndex !== -1) {
                        addressLine1 = address.substring(0, splitIndex + 1);
                        addressLine2 = address.substring(splitIndex + 1);
                    } else {
                        addressLine1 = address;
                    }
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
                            <div class="field"><strong>出生年月日：</strong>${formattedBirthDate}</div>
                            <div class="field"><strong>戶籍地址：</strong>${addressLine1}</div>
                            <div class="field"><strong>　　　　　</strong>${addressLine2}</div>
                        </div>
                    </div>
                `;
            }

            // 結束HTML
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

            // 開啟新視窗並列印
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            loading.style.display = 'none';
        }, 500);
    });

    // 下載PDF按鈕點擊事件
    downloadPdfBtn.addEventListener('click', function () {
        if (validateForm()) {
            downloadPDF();
        }
    });

    // 清除表單的函數
    function clearForm() {
        document.getElementById('name').value = "";
        document.getElementById('id').value = "";
        document.getElementById('birthDate').value = "";
        document.getElementById('address').value = "";
        document.getElementById('phone').value = "";
        document.getElementById('email').value = "";
        document.getElementById('addressConfirm').checked = false;

        // 清除地址元件的欄位
        document.getElementById('li').value = "";
        document.getElementById('lin').value = "";
        document.getElementById('addressRemain').value = "";

        // 清除錯誤訊息
        document.getElementById('nameError').textContent = "";
        document.getElementById('idError').textContent = "";
        document.getElementById('birthError').textContent = "";
        document.getElementById('addressError').textContent = "";
        document.getElementById('phoneError').textContent = "";
        document.getElementById('addressConfirmError').textContent = "";
    }

    // 初始化時執行一次地址提取，並檢查地址格式
    const initialAddress = document.getElementById('address').value;
    const initialAddressErrors = validateAddress(initialAddress);
    if (initialAddressErrors.length > 0) {
        addressError.textContent = initialAddressErrors.join('、');
    }
});
