import React, { useState, useEffect } from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({  progressDuration, totalBlocks }) => {
  // 블록들의 가시성을 배열로 관리
  const [blocksVisibility, setBlocksVisibility] = useState(
    new Array(totalBlocks).fill(false)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocksVisibility((oldBlocks) => {
        const index = oldBlocks.indexOf(false);
        // 모든 블록이 보이면 인터벌을 정리
        if (index === -1) {
          clearInterval(interval);
          return oldBlocks;
        }
        // 복사본을 만들어 해당 인덱스의 블록을 보이게 설정
        const newBlocks = [...oldBlocks];
        newBlocks[index] = true;
        return newBlocks;
      });
    }, progressDuration / totalBlocks);

    return () => {
      clearInterval(interval);
    };
  }, [progressDuration, totalBlocks]);

  return (
    <div className={styles.progressContainer}>
      {blocksVisibility.map((visible, index) => (
        <div
          key={index}
          className={`${styles.block} ${visible ? styles.visible : ''}`}
        ></div>
      ))}
    </div>
  );
};

export default ProgressBar;
