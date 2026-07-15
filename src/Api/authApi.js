import axios from "axios";
//http://localhost:4008 //test local
//linck server en render
//https://comunidad-ahorro-backend-2.onrender.com

export const authApi=axios.create({
    baseURL: "http://localhost:4008",   
});


authApi.interceptors.request.use((config) => {
	config.headers = {
		'x-token': localStorage.getItem('token'),
	};
	return config;
});

export default authApi;