import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import api from '../../api/axios'
import html2canvas from 'html2canvas';
import saveAs from "file-saver";
import styles from './CardInfo.module.css';

function CardInfo() {

  const [userEmail, setUserEmail] = useState('');
  const [cards, setCards] = useState([]); //카드 저장용
  const [isSaving, setIsSaving] = useState(false);//사진 저장 상태 추적
  const [isFlipped, setIsFlipped] = useState(false);

  
}

export default CardInfo;