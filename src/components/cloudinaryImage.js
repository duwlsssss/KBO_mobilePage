import api from "../api/axios";
  
  //클라우디너리 이미지 가져오기
  const cloudinaryImage = async (tags) => {
    try {
      const response = await api.get('/images', {
        params: {
          tags: tags
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching images by tag:', error);
      return null;
    }
  };

  export default cloudinaryImage;