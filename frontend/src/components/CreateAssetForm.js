import React, { useState } from 'react';
import axios from 'axios';

const CreateAssetForm = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [rarity, setRarity] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/assets/create-asset', { name, category, rarity });
      alert('Asset created successfully!');
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create New Asset</h3>
      <input type="text" placeholder="Asset Name" value={name} onChange={e => setName(e.target.value)} required />
      <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
      <input type="number" placeholder="Rarity" value={rarity} onChange={e => setRarity(e.target.value)} min="1" required />
      <button type="submit">Create Asset</button>
    </form>
  );
};

export default CreateAssetForm; 