/**
 * 出生日期格式處理函數
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

// 將出生日期格式化為正式格式 (例如: 民國xx年xx月xx日)
function formatBirthDateFormal(birthDate) {
    // 先標準化日期格式
    const standardDate = standardizeBirthDate(birthDate);
    
    // 檢查是否為標準格式 (xx.xx.xx)
    const match = standardDate.match(/^(\d{1,3})\.(\d{1,2})\.(\d{1,2})$/);
    if (match) {
        return `民國${match[1]}年${match[2]}月${match[3]}日`;
    }
    
    // 如果無法處理，返回原始值
    return birthDate;
}

// 原始的 formatBirthDate 函數，保留向後兼容性
function formatBirthDate(birthDate) {
    // 標準化日期
    const standardDate = standardizeBirthDate(birthDate);
    
    // 檢查是否為標準格式 (xx.xx.xx)
    const match = standardDate.match(/^(\d{1,3})\.(\d{1,2})\.(\d{1,2})$/);
    if (match) {
        return `${match[1]}年${match[2]}月${match[3]}日`;
    }
    
    // 如果無法處理，返回原始值但轉換為"年月日"格式
    const altMatch = birthDate.match(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/);
    if (altMatch) {
        return `${altMatch[1]}年${altMatch[2]}月${altMatch[3]}日`;
    }
    
    return birthDate;
}
