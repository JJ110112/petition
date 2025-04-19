/**
 * PDF生成相關功能
 */

// 初始化jsPDF (移至window.jspdf以便全局訪問)
window.jspdf = window.jspdf || {};

/**
 * 生成連署文件的PDF
 * @returns {Promise<Blob>} PDF檔案的Blob物件
 */
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // 檢查jsPDF是否可用
    if (!jsPDF) {
        throw new Error('jsPDF 庫未正確載入');
    }

    // 創建A4橫向格式的PDF
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // 獲取canvas元素
    const canvas1 = document.getElementById('previewCanvas1');
    const canvas2 = document.getElementById('previewCanvas2');

    // 檢查圖片是否載入成功
    const useCanvas1 = page1Loaded && canvas1;
    const useCanvas2 = page2Loaded && canvas2;

    try {
        // 處理第一頁 (聲明書)
        if (useCanvas1) {
            // 從Canvas獲取圖像資料
            const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
            
            // 將圖像添加到PDF，保持適當的比例
            const canvasAspectRatio = canvas1.width / canvas1.height;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // 計算適當的圖像尺寸，使其適合頁面
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / canvasAspectRatio;
            
            // 如果圖像高度超過頁面高度，則根據高度調整
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * canvasAspectRatio;
            }
            
            // 計算居中位置
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            
            // 添加圖像到PDF
            pdf.addImage(imgData1, 'JPEG', x, y, imgWidth, imgHeight);
        } else {
            // 如果無法使用Canvas，生成純文字版本
            renderTextPageToPDF(pdf, true);
        }

        // 添加新頁面
        pdf.addPage();

        // 處理第二頁 (連署書)
        if (useCanvas2) {
            // 從Canvas獲取圖像資料
            const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
            
            // 將圖像添加到PDF，保持適當的比例
            const canvasAspectRatio = canvas2.width / canvas2.height;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // 計算適當的圖像尺寸，使其適合頁面
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / canvasAspectRatio;
            
            // 如果圖像高度超過頁面高度，則根據高度調整
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * canvasAspectRatio;
            }
            
            // 計算居中位置
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            
            // 添加圖像到PDF
            pdf.addImage(imgData2, 'JPEG', x, y, imgWidth, imgHeight);
        } else {
            // 如果無法使用Canvas，生成純文字版本
            renderTextPageToPDF(pdf, false);
        }

        // 生成PDF blob
        const pdfBlob = pdf.output('blob');
        return pdfBlob;
    } catch (error) {
        console.error('生成PDF時發生錯誤:', error);
        // 如果發生錯誤，切換到純文本方式
        return generateTextOnlyPDF();
    }
}

/**
 * 將純文字版本渲染到PDF頁面
 * @param {Object} pdf - jsPDF實例
 * @param {boolean} isDeclaration - 是否為聲明書頁面
 */
function renderTextPageToPDF(pdf, isDeclaration) {
    // 設置字體
    try {
        pdf.setFont('helvetica');
    } catch (e) {
        console.warn('無法設置中文字體:', e);
    }
    
    // 獲取用戶資料
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value.toUpperCase();
    const birthDate = document.getElementById('birthDate').value;
    const formattedBirthDate = formatBirthDate(birthDate);
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const li = extractLiFromAddress(address);
    const currentDate = getCurrentDate();

    // 處理地址拆分
    let addressLine1 = '';
    let addressLine2 = '';

    if (address) {
        // 分割地址邏輯
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

    // 頁面寬度和高度
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 設置標題和內容的位置
    const titleX = pageWidth / 2;
    let contentY = 60;
    const leftMargin = 20;
    const lineHeight = 10;

    // 設置字體大小
    pdf.setFontSize(20);
    
    if (isDeclaration) {
        // 聲明書頁面
        pdf.text('臺北市第8選舉區立法委員賴士葆罷免案聲明書', titleX, 30, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.text(`簽名：${name}`, leftMargin, contentY);
        contentY += lineHeight;
        
        pdf.text(`聯絡手機：${phone}`, leftMargin, contentY);
        contentY += lineHeight;
        
        if (email) {
            pdf.text(`Email：${email}`, leftMargin, contentY);
            contentY += lineHeight;
        }
        
        pdf.text(`里別：${li || '(未識別)'}`, leftMargin, contentY);
        contentY += lineHeight;
        
        pdf.text(`簽署日期：${currentDate.month}月${currentDate.date}日`, leftMargin, contentY);
    } else {
        // 連署書頁面
        pdf.text('臺北市第8選舉區立法委員賴士葆罷免案連署書', titleX, 30, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.text(`姓名：${name}`, leftMargin, contentY);
        contentY += lineHeight;
        
        pdf.text(`身分證字號：${id}`, leftMargin, contentY);
        contentY += lineHeight;
        
        pdf.text(`出生年月日：${formattedBirthDate}`, leftMargin, contentY);
        contentY += lineHeight;
        
        pdf.text(`戶籍地址：${addressLine1}`, leftMargin, contentY);
        contentY += lineHeight;
        
        if (addressLine2) {
            pdf.text(`　　　　　${addressLine2}`, leftMargin, contentY);
        }
    }
}

/**
 * 生成純文字版本的PDF（當圖像版本失敗時的備用方案）
 * @returns {Promise<Blob>} PDF檔案的Blob物件
 */
async function generateTextOnlyPDF() {
    const { jsPDF } = window.jspdf;
    
    // 創建A4橫向格式的PDF
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // 渲染聲明書頁面
    renderTextPageToPDF(pdf, true);
    
    // 添加新頁面
    pdf.addPage();
    
    // 渲染連署書頁面
    renderTextPageToPDF(pdf, false);
    
    // 生成PDF blob
    return pdf.output('blob');
}

/**
 * 下載PDF文件
 */
async function downloadPDF() {
    try {
        // 顯示載入中動畫
        const loading = document.getElementById('loading');
        const loadingMessage = document.getElementById('loadingMessage');
        loading.style.display = 'flex';
        loadingMessage.textContent = '產生PDF中，請稍候...';
        
        // 生成PDF
        const pdfBlob = await generatePDF();
        
        // 創建臨時連結並點擊以下載文件
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = '賴士葆罷免連署書.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 關閉載入中動畫
        loading.style.display = 'none';
        
        return true;
    } catch (error) {
        console.error('下載PDF時發生錯誤:', error);
        alert('下載PDF時發生錯誤，請稍後再試');
        
        // 關閉載入中動畫
        document.getElementById('loading').style.display = 'none';
        
        return false;
    }
}
