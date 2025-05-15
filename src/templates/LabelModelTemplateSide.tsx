import React from 'react';
import { LabelData } from '../types';

type Props = {
  data: LabelData;
};

const LabelModelTemplateSide: React.FC<Props> = ({ data }) => {
  return (
  <div
    style={{
      height: '100vh', // Full screen height
      background : '#fff'
    }}
  >
    <div
      style={{
        width: '100%',
        height : '100%',
        display: 'flex',
        justifyContent: 'flex-start', // 👈 Align items to the left
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Arial',
        color: '#000',
        textAlign: 'left', // Center text inside
      }}
    >
    <p style={{ fontSize: '3rem' }}>
        读写汉字 - 学中文 {data.categoryName} 读写汉字 - 学中文<br></br>
        读写汉字 - 学中文: {data.brandName},{data.modelName}<br></br>
    </p>
    </div>
  </div>

  );
};

export default LabelModelTemplateSide;
