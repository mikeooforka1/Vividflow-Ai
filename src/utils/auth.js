export const getAuthHeaders = () => {
    const token =
        localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };
};