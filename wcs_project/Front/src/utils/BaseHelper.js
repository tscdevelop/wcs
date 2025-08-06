export function getPublicAssetUrl(relativePath) {
    return `${process.env.PUBLIC_URL}/${relativePath}`;
}


// ฟังก์ชั่น Get Color from class 
export function getColorFromClass(className) {
    const tempElement = document.createElement('span');
    tempElement.className = className;
    document.body.appendChild(tempElement);
  
    const color = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
  
    return color;
  }
  
  