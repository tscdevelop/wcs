import * as Constants from "common/constants";

// class BaseClass {
//   // Static method to build the full URL
//   static buildFileUrl(relativePath) {
//     const baseUrl = Constants.BASE_URL || 'http://localhost:3002';
//     return `${baseUrl}${relativePath}`;
//   }
// }

// export default BaseClass;


class BaseClass {
  // Static method to build the full URL
  static buildFileUrl(relativePath) {
    if (!relativePath) {
      return null; // Return null if relativePath is not provided
    }
    const baseUrl = Constants.BASE_URL || "http://localhost:3002";
    return `${baseUrl}${relativePath}`;
  }
}

export default BaseClass;
