import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'lightblue', padding: '10px', textAlign: 'center' }}>
      <p>aparecComponent is rendering!</p>
    </div>
  );
};

export { TestComponent };
