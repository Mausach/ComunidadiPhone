import axios from "axios";
//http://localhost:4008 //test local
//linck server en render
//https://comunidadiphone-backend.onrender.com

export const authApi=axios.create({
    baseURL: "https://comunidadiphone-backend.onrender.com",   
});


authApi.interceptors.request.use((config) => {
	config.headers = {
		'x-token': localStorage.getItem('token'),
	};
	return config;
});

export default authApi;