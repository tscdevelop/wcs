import { useTranslation } from "react-i18next";
import { getLanguage } from "common/language.context"; // นำเข้า getLanguage

export function msg(key, params = {}) {
    const { t } = useTranslation();
    const lng = getLanguage(); // ดึงค่าภาษาอัตโนมัติจาก Context
    return t(key, { ...params, lng });
}

export function msgFormat(key, values = []) {
    const { t } = useTranslation();
    let params = {};
    values.forEach((value, index) => {
        params[index.toString()] = value;
    });
    const lng = getLanguage(); // ดึงค่าภาษาอัตโนมัติจาก Context
    return t(key, { ...params, lng });
}

export function btnOK() {
  return msg("control.ok");
}

export function btnCancel() {
  return msg("control.cancel");
}

export function btnSave() {
  return msg("control.save");
}

export function btnAddPet() {
  return msg("control.add_pet");
}

export function btnSearch() {
  return msg("control.search");
}

export function btnAddEmployee() {
  return msg("control.add_employee");
}

export function btnAdd() {
  return msg("control.add");
}

export function btnEdit() {
  return msg("control.edit");
}

export function btnDelete() {
  return msg("control.delete");
}

export function btnCheck() {
  return msg("control.check");
}

export function btnAddData() {
  return msg("control.add_data");
}

export function btnAction() {
  return msg("control.action");
}

export function btnAutoCal() {
  return msg("control.auto_calculate");
}

export function btnPermission() {
  return msg("control.permission");
}

export function btnAddInfo() {
  return msg("control.add_info");
}

export function btnSubmenu() {
  return msg("control.Submenu");
}

export function btnRegistCustPet() {
  return msg("control.regist_cust_pet");
}

export function btnLogin() {
  return msg("item.login");
}

export function btnExport() {
  return msg("control.export");
}

export function btnCreateBill() {
  return msg("control.create_bill");
}

export function btnComfirmEdit() {
  return msg("control.confirm_edit");
}

export function btnCreateWayBill() {
  return msg("control.create_waybill");
}

export function btnPrintDoc() {
  return msg("control.print_document");
}

export function btnApprove() {
  return msg("control.approve");
}

export function btnConfirmUse() {
  return msg("control.confirm_use");
}

export function btnConfirmMenu() {
  return msg("control.confirm_menu_display");
}

export function btnConfirm() {
  return msg("control.confirm");
}

export function btnReturn() {
  return msg("control.return");
}

export function btnMaster() {
  return msg("control.create_master");
}

export function btnFinish() {
  return msg("control.finish");
}

export function btnConfirmWD() {
  return msg("control.confirm_withdraw");
}

export function btnImport() {
  return msg("control.import");
}

export function btnReport() {
  return msg("control.report");
}
export function btnPrint() {
  return msg("control.print");
}
export function btnRejected() {
  return msg("control.rejected");
}
export function btnBom() {
  return msg("control.create_bom");
}
export function btnConfirmReturn() {
  return msg("control.confirm_return");
}


/* 
export function msgSuccessAction(action: 'created' | 'updated' | 'deleted', translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.${action}_successfully`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgSuccessfulFormat(translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.successful`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorFormat(translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.error_msg`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorAction(action: 'creating' | 'updating' | 'deleting' | 'searching' | 'getting' | 'uploading', translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.error_${action}`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgErrorFunction(operation: string, errorMessage: string): string {
  const { t } = useTranslation();
  return msgFormat('message.error_function', [operation, errorMessage]);
}

export function msgFound(translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.found`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgNotFound(translationKey: string): string {
  const { t } = useTranslation();
  const key = `message.not_found`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgRequired(translationKey: string): string {
  const { t } = useTranslation();
  const key = `validation.required`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgRequiredData(translationKey: string): string {
  const { t } = useTranslation();
  const key = `validation.required_data`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgRequiredCreateby(): string {
  const { t } = useTranslation();
  return msg('validation.required_createby');
}

export function msgRequiredUpdateby(): string {
  const { t } = useTranslation();
  return msg('validation.required_updateby');
}

export function msgRequiredSavedataby(): string {
  const { t } = useTranslation();
  return msg('validation.required_savedataby');
}

export function msgRequiredUsername(): string {
  const { t } = useTranslation();
  return msg('validation.required_username');
}

export function msgAlreadyExists(translationKey: string): string {
  const { t } = useTranslation();
  const key = `validation.already_exists`;
  const itemValue = msg(translationKey);
  return msgFormat(key, [itemValue]);
}

export function msgInvalidParameter(): string {
  const { t } = useTranslation();
  return msg('validation.invalid_parameter');
}
 */