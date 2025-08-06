import axios from 'axios';
import * as Constants from 'common/constants';

export const fetchCompanies = async () => {
    try {
        const response = await axios.get(Constants.BASE_URL + '/labform/get-ddl-company');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchCompanyInfo = async (companyId) => {
    try {
        const response = await axios.get(Constants.BASE_URL + `/labform/get-company-info?id=${companyId}`);
        return response.data[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
};
