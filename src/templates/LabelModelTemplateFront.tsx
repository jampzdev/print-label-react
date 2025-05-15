import React from 'react';
import { LabelData } from '../types';

type Props = {
  data: LabelData;
};

const LabelModelTemplateFront: React.FC<Props> = ({ data }) => {
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
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection : 'column',
        padding: '20px',
        fontFamily: 'Arial',
        color: '#000',
        textAlign: 'center', // Center text inside
      }}
    >
      <h2 style={{ fontSize: '5.5rem', marginBottom: '0px' }}>
        {data.productName}
      </h2>
      <p style={{ fontSize: '5.5rem', marginBottom: '50px' }}>{data.modelName}</p>

      <p style={{ fontSize: '4rem' }}>{data.brandName}</p>
    </div>
  </div>

  );
};

export default LabelModelTemplateFront;
