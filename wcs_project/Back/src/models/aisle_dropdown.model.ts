export class AisleDropdownModel {
    value: number; 
    text: string;

    constructor(aisle_id: number,aisle_code_zone: string) {
        this.value = aisle_id;
        this.text = aisle_code_zone;
    }
}
