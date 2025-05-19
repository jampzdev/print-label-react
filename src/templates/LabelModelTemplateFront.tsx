import React from 'react';
import { LabelData } from '../types';

type Props = {
  data: LabelData;
};

const LabelModelTemplateFront: React.FC<Props> = ({ data }) => {
  return (
    
  <div
    style={{
      height: '100%', // Full screen height
      background: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial',
      color: '#000',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <h1
        style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          margin: '0',
        }}
      >
        {data.productName}
      </h1>
      <p
        style={{
          fontSize: '4.5rem',
          fontWeight: 'normal',
          margin: '20px 0',
        }}
      >
        {data.modelName}
      </p>
      <p
        style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          margin: '0',
        }}
      >
        {data.brandName}
      </p>
    </div>
  </div>


  );
};

export default LabelModelTemplateFront;
