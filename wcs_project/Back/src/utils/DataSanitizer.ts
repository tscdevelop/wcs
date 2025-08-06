import { ColumnType } from "typeorm";

export class DataSanitizer {
    /**
     * Parses and sanitizes a JSON string into an object of type <T>.
     * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
     * Additionally, parses JSON strings that represent arrays or objects.
     *
     * @param jsonString The JSON string to parse and sanitize.
     * @param ModelClass The model class to use for metadata retrieval.
     * @returns The parsed and sanitized object of type <T>.
     * @throws {Error} Throws an error if JSON parsing or sanitization fails.
     */
    public static parseAndSanitize<T extends object>(jsonString: string, ModelClass: { new (): T }): Partial<T> {
        try {
            const data: Record<string, any> = JSON.parse(jsonString || '{}');
            const sanitizedData = this.sanitizeData<T>(data, ModelClass);
            return sanitizedData as Partial<T>; // Convert to type <T>
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error parsing JSON: ${error.message}`); // Use type guard
            }
            throw new Error(`Unknown error occurred during parsing`);
        }
    }

    /**
     * Parses and sanitizes an object into an object of type <T>.
     * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
     * Additionally, parses JSON strings that represent arrays or objects.
     *
     * @param dataObject The data object to parse and sanitize.
     * @param ModelClass The model class to use for metadata retrieval.
     * @returns The parsed and sanitized object of type <T>.
     * @throws {Error} Throws an error if sanitization fails.
     */
    public static parseAndSanitizeObject<T extends object>(dataObject: Record<string, any>, ModelClass: { new (): T }): Partial<T> {
        try {
            const sanitizedData = this.sanitizeData<T>(dataObject, ModelClass);
            return sanitizedData as Partial<T>; // Convert to type <T>
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error sanitizing object: ${error.message}`); // Use type guard
            }
            throw new Error(`Unknown error occurred during sanitization`);
        }
    }

    /**
     * Simplified method for converting JSON strings to objects with automatic type inference.
     * @param jsonString The JSON string to parse and sanitize.
     * @param ModelClass The model class to use for metadata retrieval.
     * @returns The parsed and sanitized object.
     */
    public static fromJSON<T extends object>(jsonString: string, ModelClass: { new (): T }): Partial<T> {
        return this.parseAndSanitize<T>(jsonString, ModelClass);
    }

    /**
     * Simplified method for converting objects directly with automatic type inference.
     * @param dataObject The object to parse and sanitize.
     * @param ModelClass The model class to use for metadata retrieval.
     * @returns The parsed and sanitized object.
     */
    public static fromObject<T extends object>(dataObject: Record<string, any>, ModelClass: { new (): T }): Partial<T> {
        return this.parseAndSanitizeObject<T>(dataObject, ModelClass);
    }

    /**
     * Sanitizes an object by converting empty strings to null for dates, numbers, and booleans.
     * Additionally, parses JSON strings that represent arrays or objects.
     *
     * @param data The data object to sanitize.
     * @param ModelClass The model class to use for metadata retrieval.
     * @returns The sanitized object.
     * @throws {Error} Throws an error if sanitization fails.
     */
    private static sanitizeData<T extends object>(data: Record<string, any>, ModelClass: { new (): T }): Record<string, any> {
        try {
            const modelInstance = new ModelClass();
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    let value = data[key];
                    const modelType = this.getModelType(modelInstance, key as keyof T);
    
                    if (value === '') {
                        data[key] = null;
                    } else if (this.isNumberValue(value, modelType)) {
                        data[key] = Number(value);
                    } else if (this.isBooleanValue(value, modelType)) {
                        data[key] = this.convertToBoolean(value);
                    } else if (this.isDateValue(value, modelType)) {
                        data[key] = new Date(value);
                    } else if (this.isJSONString(value)) {
                        data[key] = JSON.parse(value);
                    }
                }
            }
            return data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error sanitizing data: ${error.message}`);
            }
            throw new Error(`Unknown error occurred during sanitization`);
        }
    }
    

    /**
     * Determines the model type of the key.
     *
     * @param modelInstance The instance of the model.
     * @param key The key to check.
     * @returns The type of the key in the model.
     */
    private static getModelType<T extends object>(modelInstance: T, key: keyof T): ColumnType | undefined {
        return Reflect.getMetadata('design:type', modelInstance, key as string | symbol); // Ensuring string or symbol
    }

    /**
     * Checks if the value can be converted to a number.
     *
     * @param value The value to check.
     * @param modelType The model's column type.
     * @returns True if the value can be converted to a number.
     */
    private static isNumberValue(value: any, modelType?: ColumnType): boolean {
        return modelType === Number && !isNaN(Number(value));
    }

    /**
     * Checks if the value can be a valid date.
     *
     * @param value The value to check.
     * @param modelType The model's column type.
     * @returns True if the value is a valid date string.
     */
    private static isDateValue(value: any, modelType?: ColumnType): boolean {
        if (modelType !== Date) {
            return false;
        }
        if (typeof value === 'string' || value instanceof String) {
            return !isNaN(Date.parse(value as string));
        }
        return false;
    }

    /**
     * Checks if the value can be converted to a boolean.
     *
     * @param value The value to check.
     * @param modelType The model's column type.
     * @returns True if the value can be interpreted as a boolean.
     */
    private static isBooleanValue(value: any, modelType?: ColumnType): boolean {
        if (modelType !== Boolean) {
            return false;
        }
        if (typeof value === 'string' || value instanceof String) {
            const lowerValue = value.toLowerCase();
            return lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0';
        }
        return typeof value === 'boolean';
    }

    
    /**
     * Checks if the value is a valid JSON string.
     *
     * @param value The value to check.
     * @returns True if the value is a valid JSON string.
     */
    private static isJSONString(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }
    
    

    /**
     * Converts a value to a boolean.
     *
     * @param value The value to convert.
     * @returns The converted boolean value.
     */
    private static convertToBoolean(value: any): boolean {
        if (typeof value === 'string' || value instanceof String) {
            const lowerValue = value.toLowerCase().trim(); // Trim any whitespace
            return lowerValue === 'true' || lowerValue === '1'; // Convert to true for 'true' or '1'
        }
        return Boolean(value); // Convert other truthy values
    }
}


// ก่อนปรับ ให้รองรับ การแปลง JSON เป็น Object
// import { ColumnType } from "typeorm";

// export class DataSanitizer {
//     /**
//      * Parses and sanitizes a JSON string into an object of type <T>.
//      * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
//      *
//      * @param jsonString The JSON string to parse and sanitize.
//      * @param ModelClass The model class to use for metadata retrieval.
//      * @returns The parsed and sanitized object of type <T>.
//      * @throws {Error} Throws an error if JSON parsing or sanitization fails.
//      */
//     public static parseAndSanitize<T extends object>(jsonString: string, ModelClass: { new (): T }): Partial<T> {
//         try {
//             const data: Record<string, any> = JSON.parse(jsonString || '{}');
//             const sanitizedData = this.sanitizeData<T>(data, ModelClass);
//             return sanitizedData as Partial<T>; // Convert to type <T>
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 throw new Error(`Error parsing JSON: ${error.message}`); // Use type guard
//             }
//             throw new Error(`Unknown error occurred during parsing`);
//         }
//     }

//     /**
//      * Parses and sanitizes an object into an object of type <T>.
//      * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
//      *
//      * @param dataObject The data object to parse and sanitize.
//      * @param ModelClass The model class to use for metadata retrieval.
//      * @returns The parsed and sanitized object of type <T>.
//      * @throws {Error} Throws an error if sanitization fails.
//      */
//     public static parseAndSanitizeObject<T extends object>(dataObject: Record<string, any>, ModelClass: { new (): T }): Partial<T> {
//         try {
//             const sanitizedData = this.sanitizeData<T>(dataObject, ModelClass);
//             return sanitizedData as Partial<T>; // Convert to type <T>
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 throw new Error(`Error sanitizing object: ${error.message}`); // Use type guard
//             }
//             throw new Error(`Unknown error occurred during sanitization`);
//         }
//     }

//     /**
//      * Simplified method for converting JSON strings to objects with automatic type inference.
//      * @param jsonString The JSON string to parse and sanitize.
//      * @param ModelClass The model class to use for metadata retrieval.
//      * @returns The parsed and sanitized object.
//      */
//     public static fromJSON<T extends object>(jsonString: string, ModelClass: { new (): T }): Partial<T> {
//         return this.parseAndSanitize<T>(jsonString, ModelClass);
//     }

//     /**
//      * Simplified method for converting objects directly with automatic type inference.
//      * @param dataObject The object to parse and sanitize.
//      * @param ModelClass The model class to use for metadata retrieval.
//      * @returns The parsed and sanitized object.
//      */
//     public static fromObject<T extends object>(dataObject: Record<string, any>, ModelClass: { new (): T }): Partial<T> {
//         return this.parseAndSanitizeObject<T>(dataObject, ModelClass);
//     }

//     /**
//      * Sanitizes an object by converting empty strings to null for dates, numbers, and booleans.
//      *
//      * @param data The data object to sanitize.
//      * @param ModelClass The model class to use for metadata retrieval.
//      * @returns The sanitized object.
//      * @throws {Error} Throws an error if sanitization fails.
//      */
//     private static sanitizeData<T extends object>(data: Record<string, any>, ModelClass: { new (): T }): Record<string, any> {
//         try {
//             const modelInstance = new ModelClass(); // Correctly create an instance of the model class
//             for (const key in data) {
//                 if (Object.prototype.hasOwnProperty.call(data, key)) {
//                     const value = data[key];
//                     const modelType = this.getModelType(modelInstance, key as keyof T);

//                     if (value === '') {
//                         data[key] = null;
//                     } else if (this.isNumberValue(value, modelType)) {
//                         data[key] = Number(value);
//                     } else if (this.isBooleanValue(value, modelType)) {
//                         data[key] = this.convertToBoolean(value);
//                     } else if (this.isDateValue(value, modelType)) {
//                         data[key] = new Date(value);
//                     }
//                 }
//             }
//             return data;
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 throw new Error(`Error sanitizing data: ${error.message}`);
//             }
//             throw new Error(`Unknown error occurred during sanitization`);
//         }
//     }

//     /**
//      * Determines the model type of the key.
//      *
//      * @param modelInstance The instance of the model.
//      * @param key The key to check.
//      * @returns The type of the key in the model.
//      */
//     private static getModelType<T extends object>(modelInstance: T, key: keyof T): ColumnType | undefined {
//         return Reflect.getMetadata('design:type', modelInstance, key as string | symbol); // Ensuring string or symbol
//     }

//     /**
//      * Checks if the value can be converted to a number.
//      *
//      * @param value The value to check.
//      * @param modelType The model's column type.
//      * @returns True if the value can be converted to a number.
//      */
//     private static isNumberValue(value: any, modelType?: ColumnType): boolean {
//         return modelType === Number && !isNaN(Number(value));
//     }

//     /**
//      * Checks if the value can be a valid date.
//      *
//      * @param value The value to check.
//      * @param modelType The model's column type.
//      * @returns True if the value is a valid date string.
//      */
//     private static isDateValue(value: any, modelType?: ColumnType): boolean {
//         if (modelType !== Date) {
//             return false;
//         }
//         if (typeof value === 'string' || value instanceof String) {
//             return !isNaN(Date.parse(value as string));
//         }
//         return false;
//     }

//     /**
//      * Checks if the value can be converted to a boolean.
//      *
//      * @param value The value to check.
//      * @param modelType The model's column type.
//      * @returns True if the value can be interpreted as a boolean.
//      */
//     private static isBooleanValue(value: any, modelType?: ColumnType): boolean {
//         if (modelType !== Boolean) {
//             return false;
//         }
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase();
//             return lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0';
//         }
//         return typeof value === 'boolean';
//     }

//     /**
//      * Converts a value to a boolean.
//      *
//      * @param value The value to convert.
//      * @returns The converted boolean value.
//      */
//     private static convertToBoolean(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase().trim(); // Trim any whitespace
//             return lowerValue === 'true' || lowerValue === '1'; // Convert to true for 'true' or '1'
//         }
//         return Boolean(value); // Convert other truthy values
//     }
// }



// // DataSanitizer.ts Version fix column ที่จะให้เป็น string

// export class DataSanitizer {
//     /**
//      * Parses and sanitizes a JSON string into an object of type <T>.
//      * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
//      *
//      * @param jsonString The JSON string to parse and sanitize.
//      * @returns The parsed and sanitized object of type <T>.
//      */
//     public static parseAndSanitize<T>(jsonString: string): Partial<T> {
//         try {
//             const data: Record<string, any> = JSON.parse(jsonString || '{}');
//             const sanitizedData = this.sanitizeData(data);
//             return sanitizedData as Partial<T>; // Convert to type <T>
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             return {} as Partial<T>; // Return an empty object if parsing fails
//         }
//     }

//     /**
//      * Sanitizes an object by converting empty strings to null for dates, numbers, and booleans.
//      *
//      * @param data The data object to sanitize.
//      * @returns The sanitized object.
//      */
//     private static sanitizeData(data: Record<string, any>): Record<string, any> {
//         const stringFields = ['password', 'username']; // Fields to keep as strings
//         for (const key in data) {
//             if (data[key] === '') {
//                 data[key] = null;
//             } else if (this.isDateValue(data[key])) {
//                 data[key] = new Date(data[key]);
//             } else if (!stringFields.includes(key) && this.isNumberValue(data[key])) {
//                 // Check if the field should be treated as a string
//                 data[key] = Number(data[key]);
//             } else if (this.isBooleanValue(data[key])) {
//                 data[key] = this.convertToBoolean(data[key]);
//             }
//         }
//         return data;
//     }

//     /**
//      * Checks if the value can be a valid date.
//      *
//      * @param value The value to check.
//      * @returns True if the value is a valid date string.
//      */
//     private static isDateValue(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const parsedDate = Date.parse(value as string);
//             return !isNaN(parsedDate) && value.includes('-'); // Ensure it's not an accidental conversion
//         }
//         return false;
//     }

//     /**
//      * Checks if the value can be converted to a number.
//      *
//      * @param value The value to check.
//      * @param key The key name of the field.
//      * @returns True if the value can be converted to a number.
//      */
//     private static isNumberValue(value: any): boolean {
//         if (typeof value === 'string') {
//             // Check if the value is numeric and doesn't have leading zeros
//             const trimmedValue = value.trim();
//             return /^\d+$/.test(trimmedValue) && !/^0\d/.test(trimmedValue);
//         }
//         return typeof value === 'number';
//     }

//     /**
//      * Checks if the value can be converted to a boolean.
//      *
//      * @param value The value to check.
//      * @returns True if the value can be interpreted as a boolean.
//      */
//     private static isBooleanValue(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase();
//             return lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0';
//         }
//         return typeof value === 'boolean';
//     }

//     /**
//      * Converts a value to a boolean.
//      *
//      * @param value The value to convert.
//      * @returns The converted boolean value.
//      */
//     private static convertToBoolean(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase();
//             return lowerValue === 'true' || lowerValue === '1';
//         }
//         return Boolean(value);
//     }
// }



// // DataSanitizer.ts

// export class DataSanitizer {
//     /**
//      * Parses and sanitizes a JSON string into an object of type <T>.
//      * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
//      *
//      * @param jsonString The JSON string to parse and sanitize.
//      * @returns The parsed and sanitized object of type <T>.
//      */
//     public static parseAndSanitize<T>(jsonString: string): Partial<T> {
//         try {
//             const data: Record<string, any> = JSON.parse(jsonString || '{}');
//             const sanitizedData = this.sanitizeData(data);
//             return sanitizedData as Partial<T>; // Convert to type <T>
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             throw error;
//             //return {} as Partial<T>; // Return an empty object if parsing fails
//         }
//     }

//     /**
//      * Sanitizes an object by converting empty strings to null for dates, numbers, and booleans.
//      *
//      * @param data The data object to sanitize.
//      * @returns The sanitized object.
//      */
//     private static sanitizeData(data: Record<string, any>): Record<string, any> {
//         for (const key in data) {
//             // Check for empty string and convert it to null
//             if (data[key] === '') {
//                 data[key] = null;
//             } else if (this.isDateValue(data[key])) {
//                 // Convert to date if it's a valid date string
//                 data[key] = new Date(data[key]);
//             } else if (this.isNumberValue(data[key])) {
//                 // Convert to number if the value is a valid number
//                 data[key] = Number(data[key]);
//             } else if (this.isBooleanValue(data[key])) {
//                 // Convert to boolean if the value represents a boolean
//                 data[key] = this.convertToBoolean(data[key]);
//             }
//         }
//         return data;
//     }

//     /**
//      * Checks if the value can be a valid date.
//      *
//      * @param value The value to check.
//      * @returns True if the value is a valid date string.
//      */
//     private static isDateValue(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const parsedDate = Date.parse(value as string);
//             return !isNaN(parsedDate) && value.includes('-'); // Ensure it's not an accidental conversion
//         }
//         return false;
//     }

//     /**
//      * Checks if the value can be converted to a number.
//      *
//      * @param value The value to check.
//      * @param key The key name of the field.
//      * @returns True if the value can be converted to a number.
//      */
//     private static isNumberValue(value: any): boolean {
//         if (typeof value === 'string') {
//             // Check if the value is numeric and doesn't have leading zeros
//             const trimmedValue = value.trim();
//             return /^\d+$/.test(trimmedValue) && !/^0\d/.test(trimmedValue);
//         }
//         return typeof value === 'number';
//     }

//     /**
//      * Checks if the value can be converted to a boolean.
//      *
//      * @param value The value to check.
//      * @returns True if the value can be interpreted as a boolean.
//      */
//     private static isBooleanValue(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase();
//             return lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0';
//         }
//         return typeof value === 'boolean';
//     }

//     /**
//      * Converts a value to a boolean.
//      *
//      * @param value The value to convert.
//      * @returns The converted boolean value.
//      */
//     private static convertToBoolean(value: any): boolean {
//         if (typeof value === 'string' || value instanceof String) {
//             const lowerValue = value.toLowerCase();
//             return lowerValue === 'true' || lowerValue === '1';
//         }
//         return Boolean(value);
//     }
// }



// // DataSanitizer.js

// class DataSanitizer {
//     /**
//      * Parses and sanitizes a JSON string into an object.
//      * Converts empty strings to null for fields that are supposed to be dates, numbers, or booleans.
//      *
//      * @param {string} jsonString - The JSON string to parse and sanitize.
//      * @returns {Object} - The parsed and sanitized object.
//      */
//     static parseAndSanitize(jsonString) {
//         try {
//             const data = JSON.parse(jsonString || '{}');
//             return this.sanitizeData(data);
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//             return {}; // Return an empty object if parsing fails
//         }
//     }

//     /**
//      * Sanitizes an object by converting empty strings to null for dates, numbers, and booleans.
//      *
//      * @param {Object} data - The data object to sanitize.
//      * @returns {Object} - The sanitized object.
//      */
//     static sanitizeData(data) {
//         for (const key in data) {
//             if (data[key] === '') {
//                 if (this.isDateValue(data[key])) {
//                     data[key] = null; // Assign null if the property is supposed to be a date
//                 } else if (this.isNumberValue(data[key])) {
//                     data[key] = null; // Assign null if the property is supposed to be a number
//                 } else if (this.isBooleanValue(data[key])) {
//                     data[key] = null; // Assign null if the property is supposed to be a boolean
//                 }
//             } else {
//                 // Convert value if necessary
//                 if (this.isNumberValue(data[key])) {
//                     data[key] = Number(data[key]); // Convert to number if possible
//                 } else if (this.isBooleanValue(data[key])) {
//                     data[key] = this.convertToBoolean(data[key]); // Convert to boolean if possible
//                 } else if (this.isDateValue(data[key])) {
//                     data[key] = new Date(data[key]); // Convert to Date if possible
//                 }
//             }
//         }
//         return data;
//     }

//     /**
//      * Checks if the value can be a valid date.
//      *
//      * @param {string} value - The value to check.
//      * @returns {boolean} - True if the value is a valid date string.
//      */
//     static isDateValue(value) {
//         return !isNaN(Date.parse(value));
//     }

//     /**
//      * Checks if the value can be converted to a number.
//      *
//      * @param {string} value - The value to check.
//      * @returns {boolean} - True if the value can be converted to a number.
//      */
//     static isNumberValue(value) {
//         return !isNaN(value) && value.trim() !== '';
//     }

//     /**
//      * Checks if the value can be converted to a boolean.
//      *
//      * @param {string} value - The value to check.
//      * @returns {boolean} - True if the value can be interpreted as a boolean.
//      */
//     static isBooleanValue(value) {
//         const lowerValue = value.toLowerCase();
//         return lowerValue === 'true' || lowerValue === 'false' || lowerValue === '1' || lowerValue === '0';
//     }

//     /**
//      * Converts a value to a boolean.
//      *
//      * @param {string} value - The value to convert.
//      * @returns {boolean} - The converted boolean value.
//      */
//     static convertToBoolean(value) {
//         const lowerValue = value.toLowerCase();
//         return lowerValue === 'true' || lowerValue === '1';
//     }
// }

// module.exports = DataSanitizer;
