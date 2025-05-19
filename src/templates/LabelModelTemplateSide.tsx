import React from 'react';
import { LabelData } from '../types';

type Props = {
  data: LabelData;
};

const LabelModelTemplateSide: React.FC<Props> = ({ data }) => {
  return (
<div
  style={{
    height: '100%',
    background: '#aaa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '40px',
  }}
>
  <div
    style={{
      textAlign: 'center',
      padding: '40px',
    }}
  >
    <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
      读写汉字 - 学中文
    </h1>

    <div style={{ marginBottom: '15px', fontSize: '1.5rem' }}>
      <strong>类别 (Category):</strong> {data?.categoryName}
    </div>

    <div style={{ marginBottom: '15px', fontSize: '1.5rem' }}>
      <strong>品牌 (Brand):</strong> {data?.brandName}
    </div>

    <div style={{ marginBottom: '15px', fontSize: '1.5rem' }}>
      <strong>型号 (Model):</strong> {data?.modelName}
    </div>

    <div style={{ marginBottom: '15px', fontSize: '2.5rem' }}>
      <strong>1 PC</strong>
    </div>

    <div style={{ marginBottom: '15px', fontSize: '1.5rem' }}>
      <strong>型号 (Model):</strong> {data?.modelName}
    </div>

    <div style={{ borderTop: '1px solid #000', marginTop: '30px', paddingTop: '20px', fontSize: '1rem' }}>
      这是一个中文学习标签，用于展示产品信息，例如类别、品牌和型号。
    </div>
  </div>
</div>


  );
};

export default LabelModelTemplateSide;
