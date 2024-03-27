import axios from 'axios';
//DB 에 qr코드의 파라미터인 userEmail에 해당하는 카드 정보들을 가져오기 위해 이 api 를 사용합니다.

const host = window.location.hostname === "localhost" ? 'http://localhost:8000' : 'http://kimmyungsa.us-east-2.elasticbeanstalk.com';
//axios 인스턴스 생성

const api = axios.create({
    //개발용
    baseURL: host,//API baseURL
    timeout:5000,
    headers:{
        'Content-Type': 'application/json', //응답헤더, json 형식
    }

})

// 요청 인터셉터 추가
api.interceptors.request.use(
    (config) => {
      console.log('Request Interceptor - Config:', config);
      return config;
    },
    (error) => {
      console.error('Request Interceptor - Error:', error);
      return Promise.reject(error);
    }
  );
  
  // 응답 인터셉터 추가
 api.interceptors.response.use(
    (response) => {
      console.log('Response Interceptor - Response:', response);
      return response;
    },
    (error) => {
        console.error('Response Interceptor - Error:', error);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        return Promise.reject(error);
    }
  );


export default api;