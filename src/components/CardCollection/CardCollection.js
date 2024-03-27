import React, { useState } from 'react';
import styles from './CardCollection.module.css';
import { Link } from 'react-router-dom';
import useUserEmailStore from '../../store/userEmail'

function CardCollection() {
  const {userEmail,setUserEmail} = useUserEmailStore();

  const [categories, setCategories] = useState([
    { id: 1, name: '기본 카테고리', cards: [] }
  ]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardUrl, setNewCardUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  //카테고리 추가
  const addCategory = () => {
    const newCategory = {
      id: Date.now(),
      name: newCategoryName,
      cards: []
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName('') //입력 필드 초기화
  };

  //카테고리 삭제
  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  //명함 추가
  const addCardToCategory = () => {
    setCategories(categories.map(category => {
      if (category.id ===Number(selectedCategoryId)) {
        const newCard = { id: Date.now(), name: newCardName, url: newCardUrl };
        return { ...category, cards: [...category.cards, newCard] };
      }
      return category;
    }));
    setNewCardName(''); // 입력 필드 초기화
  };
  
  //명함 삭제
  const deleteCardFromCategory = (categoryId, cardId) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        const filteredCards = category.cards.filter(card => card.id !== cardId);
        return { ...category, cards: filteredCards };
      }
      return category;
    }));
  };




  return (
    <div>
      {/*카테고리 추가*/}
      <input
        type="text"
        placeholder="새 카테고리 이름"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
      />
      <button onClick={addCategory}>카테고리 추가</button>
      {/* 명함 추가 폼 */}
      <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
        <option value="">카테고리 선택</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="명함 이름"
        value={newCardName}
        onChange={(e) => setNewCardName(e.target.value)}
      />
      <input
        type="text"
        placeholder="명함 URL"
        value={newCardUrl}
        onChange={(e) => setNewCardUrl(e.target.value)}
      />
      <button onClick={addCardToCategory}>명함 추가</button>
      {categories.map(category => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          {category.cards.map(card => (
            <div key={card.id}>
              <p>{card.name}: <a href={card.url} target="_blank">{card.url}</a></p>
              <button onClick={() => deleteCardFromCategory(category.id, card.id)}>명함 삭제</button>
            </div>
          ))}
          <button onClick={() => deleteCategory(category.id)}>카테고리 삭제</button>
        </div>
      ))}
     <Link to={`/my-card?userEmail=${userEmail}`}>나의 명함</Link>
  </div>
  );
}

export default CardCollection;
