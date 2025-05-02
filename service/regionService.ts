import api from "./api";

export const getListProvinsie = async (keyword: string) => {
    try {
        const response = await api.post("/Regions/get-list-page-provinsie",{keyword});
        return response.data
    } catch (error : any) {
        throw error.response?.data?.message || "Get list province failed"
    }
}

export const getListDistrict = async (matp: string,keyword: string) => {
    try {
        const response = await api.post("/Regions/get-list-page-district-by-provinsie",{matp,keyword});
        return response.data    
    } catch (error : any) {
        throw error.response?.data?.message || "Get list district failed"
    }
}

export const getListWard = async (maqh: string,keyword: string) => {
    try {
        const response = await api.post("/Regions/get-list-page-commune-by-district",{maqh,keyword});
        return response.data
    } catch (error : any) {
        throw error.response?.data?.message || "Get list ward failed"
    }
}