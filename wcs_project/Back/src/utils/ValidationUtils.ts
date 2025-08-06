// utils/ValidationUtils.ts

    /**
     * Checks if a value is null, undefined, empty (for strings), or invalid (for numbers and dates).
     * @param value - The value to check.
     * @returns True if the value is null, undefined, empty, or invalid; otherwise, false.
     */
    export const isNullOrEmpty = (value: any): boolean => {
    if (value == null) {
      return true;
    }
    
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    
    if (typeof value === 'number') {
      return isNaN(value);
    }
    
    if (value instanceof Date) {
      return isNaN(value.getTime());
    }
    
    return false;
  };
  
  /**
   * Checks if a value is not null, undefined, empty (for strings), or invalid (for numbers and dates).
   * @param value - The value to check.
   * @returns True if the value is not null, undefined, empty, or invalid; otherwise, false.
   */
  export const isNotNullOrEmpty = (value: any): boolean => {
    return !isNullOrEmpty(value);
  };

/**
 * Checks if a string is null, undefined, or empty.
 * @param value - The string to check.
 * @returns True if the string is null, undefined, or empty; otherwise, false.
 */
export const isNullOrEmptyString = (value: string | null | undefined): boolean => {
    return value == null || value.trim() === '';
  };
  

  /**
 * Checks if a value is null, undefined, or not a valid number.
 * @param value - The value to check.
 * @returns True if the value is null, undefined, or not a valid number; otherwise, false.
 */
export const isNullOrEmptyNumber = (value: any): boolean => {
    return value === null || value === undefined || isNaN(Number(value));
  };

  /**
 * Checks if a value is null, undefined, or not a valid date.
 * @param value - The value to check.
 * @returns True if the value is null, undefined, or not a valid date; otherwise, false.
 */
export const isNullOrEmptyDate = (value: any): boolean => {
    return value === null || value === undefined || isNaN(Date.parse(value));
  };

  
  /**
   * Validates if a string is a valid email address.
   * @param email - The email address to validate.
   * @returns True if the email address is valid; otherwise, false.
   */
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Checks if a string is a valid URL.
   * @param url - The URL to validate.
   * @returns True if the URL is valid; otherwise, false.
   */
  export const isValidURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  /**
   * Checks if a value is a valid number.
   * @param value - The value to check.
   * @returns True if the value is a valid number; otherwise, false.
   */
  export const isValidNumber = (value: string | number): boolean => {
    return !isNaN(Number(value));
  };
  
  /**
   * Checks if a value is a positive number.
   * @param value - The value to check.
   * @returns True if the value is a positive number; otherwise, false.
   */
  // export const isPositiveNumber = (value: string | number): boolean => {
  //   return isValidNumber(value) && Number(value) > 0;
  // };
  
  export const isPositiveNumber = (value: string | number | undefined): boolean => {
    return value !== undefined && !isNaN(Number(value)) && Number(value) > 0;
};

  
  /**
   * Checks if a string matches a given regular expression.
   * @param value - The string to check.
   * @param regex - The regular expression to match.
   * @returns True if the string matches the regular expression; otherwise, false.
   */
  export const matchesRegex = (value: string, regex: RegExp): boolean => {
    return regex.test(value);
  };
  
  /**
   * Checks if a string has a minimum length.
   * @param value - The string to check.
   * @param minLength - The minimum length.
   * @returns True if the string has at least the minimum length; otherwise, false.
   */
  export const hasMinLength = (value: string, minLength: number): boolean => {
    return value.length >= minLength;
  };
  
  /**
   * Checks if a string has a maximum length.
   * @param value - The string to check.
   * @param maxLength - The maximum length.
   * @returns True if the string has at most the maximum length; otherwise, false.
   */
  export const hasMaxLength = (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
  };
  
  /**
   * Checks if a string is a valid date.
   * @param date - The date string to validate.
   * @returns True if the date string is a valid date; otherwise, false.
   */
  export const isValidDate = (date: string): boolean => {
    return !isNaN(Date.parse(date));
  };
  