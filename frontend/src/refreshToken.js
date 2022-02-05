// for multiple requests
import axios from 'axios'
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(success);
        }
    })

    failedQueue = [];
}

export const EmptyVariable = () => {
    isRefreshing = false
    failedQueue=[]
}
export const interceptor = (axiosInstance) => (error) => {
    const _axios = axiosInstance;
    const originalRequest = error.config;

    if (error.response.status === 401 || error.response.status === 403) {
        console.log('lets refresh token')
        console.log("retry",originalRequest._retry)
        console.log(isRefreshing)
        console.log('faf',failedQueue)
        if (!originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return _axios.request(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }
            console.log("true nay")
            originalRequest._retry = true;
            isRefreshing = true;
            return new Promise((resolve, reject) => {
                axios.get('/auth/refresh')
                    .then((accessToken) => {
                        console.log(accessToken)
                        processQueue(null, true);
                        resolve(_axios(originalRequest));
                        isRefreshing = false
                    })
                    .catch((err) => {
                        console.log("ER",err)
                        processQueue(err, false);
                        reject(err);
                        isRefreshing = false
                    })
                    
            })
        }
    }

    return Promise.reject(error);
};

