/**
 * 繪圖相關函數
 */

// 聲明書和連署書圖片
let page1Image = new Image();
let page2Image = new Image();
let page1Loaded = false;
let page2Loaded = false;

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
    NAME_Y: 367,

    // 身分證字號起始座標及間距
    ID_START_X: 212,  // 第一碼X座標
    ID_Y: 422,        // 身分證字號Y座標
    ID_SPACING: 38,   // 每一碼之間的間距

    // 出生年月日座標位置
    BIRTH_DATE_X: 593,
    BIRTH_DATE_Y: 396,

    // 地址第一行座標位置
    ADDRESS_LINE1_X: 810,
    ADDRESS_LINE1_Y: 370,

    // 地址第二行座標位置
    ADDRESS_LINE2_X: 810,
    ADDRESS_LINE2_Y: 417
};

/**
 * 加載圖片資源
 */
function loadImages() {
    const canvas1 = document.getElementById('previewCanvas1');
    const canvas2 = document.getElementById('previewCanvas2');
    const previewPlaceholder1 = document.getElementById('previewPlaceholder1');
    const previewPlaceholder2 = document.getElementById('previewPlaceholder2');

    // 設置默認寬高
    canvas1.width = 800;
    canvas1.height = 600;
    canvas2.width = 800;
    canvas2.height = 600;

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
}

/**
 * 繪製聲明書
 * @returns {boolean} - 繪製是否成功
 */
function drawDeclaration() {
    const canvas1 = document.getElementById('previewCanvas1');
    const ctx1 = canvas1.getContext('2d');
    const previewPlaceholder1 = document.getElementById('previewPlaceholder1');
    const previewText1 = document.getElementById('previewText1');
    
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

/**
 * 繪製連署書
 * @returns {boolean} - 繪製是否成功
 */
function drawPetition() {
    const canvas2 = document.getElementById('previewCanvas2');
    const ctx2 = canvas2.getContext('2d');
    const previewPlaceholder2 = document.getElementById('previewPlaceholder2');
    const previewText2 = document.getElementById('previewText2');
    
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value.toUpperCase();
    const birthDate = document.getElementById('birthDate').value;
    const formattedBirthDate = formatBirthDate(birthDate); // 格式化為年月日格式
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

        // 繪製出生年月日 (修改為新格式)
        ctx2.fillText(formattedBirthDate, PETITION_COORDS.BIRTH_DATE_X, PETITION_COORDS.BIRTH_DATE_Y);

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
            <p><strong>出生年月日：</strong> ${formattedBirthDate}</p>
            <p><strong>戶籍地址第一行：</strong> ${addressLine1}</p>
            <p><strong>戶籍地址第二行：</strong> ${addressLine2 || '(無)'}</p>
        `;

        canvas2.style.display = 'none';
        previewPlaceholder2.style.display = 'flex';
    }

    return true;
}
