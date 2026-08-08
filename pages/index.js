import React, { useState, useEffect } from 'react';

export default function Home() {
  const [groceries, setGroceries] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [mounted, setMounted] = useState(false);

  // Load groceries from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('groceries');
    if (saved) {
      try {
        setGroceries(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading groceries:', e);
      }
    }
  }, []);

  // Save groceries to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('groceries', JSON.stringify(groceries));
    }
  }, [groceries, mounted]);

  const handleAddGrocery = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !quantity.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newGrocery = {
      id: Date.now(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      dateAdded: new Date().toLocaleDateString('en-GB'),
      dateAddedFull: new Date().toISOString()
    };

    setGroceries([newGrocery, ...groceries]);
    setName('');
    setQuantity('');
    setUnit('kg');
  };

  const handleDeleteGrocery = (id) => {
    setGroceries(groceries.filter(item => item.id !== id));
  };

  const handleEditQuantity = (id, newQuantity) => {
    setGroceries(groceries.map(item =>
      item.id === id ? { ...item, quantity: parseFloat(newQuantity) || 0 } : item
    ));
  };

  const handleExport = () => {
    const data = JSON.stringify(groceries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groceries-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setGroceries(imported);
          alert('Groceries imported successfully!');
        } else {
          alert('Invalid file format. Should be an array of groceries.');
        }
      } catch (error) {
        alert('Error importing file. Make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  if (!mounted) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <head>
        <title>Family Grocery Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <div style={styles.header}>
        <h1 style={styles.title}>🛒 Family Grocery Tracker</h1>
        <p style={styles.subtitle}>Never forget what's in your pantry!</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddGrocery} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Grocery Name</label>
          <input
            type="text"
            placeholder="e.g., Rice, Milk, Apples, Spinach..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            autoFocus
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity</label>
            <input
              type="number"
              placeholder="Amount"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.1"
              min="0"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={styles.select}>
              <option value="kg">kg</option>
              <option value="g">grams</option>
              <option value="liters">liters</option>
              <option value="ml">ml</option>
              <option value="packets">packets</option>
              <option value="pieces">pieces</option>
              <option value="boxes">boxes</option>
              <option value="bottles">bottles</option>
              <option value="cans">cans</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Date Added</label>
          <input
            type="text"
            value={new Date().toLocaleDateString('en-GB')}
            disabled
            style={{ ...styles.input, ...styles.disabledInput }}
          />
          <small style={styles.hint}>✓ Auto-filled with today's date</small>
        </div>

        <button type="submit" style={styles.button}>
          ➕ Add Grocery
        </button>
      </form>

      {/* Export/Import Actions */}
      <div style={styles.actions}>
        <button 
          onClick={handleExport} 
          style={styles.secondaryButton}
          title="Download your grocery list as JSON"
        >
          📥 Export
        </button>
        <label style={styles.secondaryButton} title="Import a previously exported list">
          📤 Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={styles.hiddenInput}
          />
        </label>
      </div>

      {/* Grocery List */}
      <div style={styles.listContainer}>
        <h2 style={styles.listTitle}>
          📋 Current Groceries ({groceries.length})
        </h2>

        {groceries.length === 0 ? (
          <div style={styles.emptyState}>
            <p>📭 No groceries yet!</p>
            <p style={styles.emptyHint}>Add your first item above to get started.</p>
          </div>
        ) : (
          <div>
            {groceries.map((item) => (
              <div key={item.id} style={styles.groceryItem}>
                <div style={styles.groceryInfo}>
                  <h3 style={styles.groceryName}>{item.name}</h3>
                  <p style={styles.groceryMeta}>
                    📅 Added: {item.dateAdded}
                  </p>
                </div>

                <div style={styles.groceryControls}>
                  <div style={styles.quantityControl}>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleEditQuantity(item.id, e.target.value)}
                      step="0.1"
                      min="0"
                      style={styles.quantityInput}
                    />
                    <span style={styles.unit}>{item.unit}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteGrocery(item.id)}
                    style={styles.deleteButton}
                    title="Remove this item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div style={styles.footer}>
        <h3 style={styles.footerTitle}>💡 How to Use:</h3>
        <ul style={styles.footerList}>
          <li>Add items as soon as you buy groceries</li>
          <li>Update quantities when you use items</li>
          <li>Delete when items run out or expire</li>
          <li>Use Export to backup your list</li>
        </ul>
      </div>

      <div style={styles.shareFooter}>
        <p>
          <strong>📱 Share this link with your family:</strong>
        </p>
        <p style={styles.shareUrl}>{typeof window !== 'undefined' ? window.location.href : ''}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
  },
  title: {
    color: '#2d3436',
    fontSize: '32px',
    marginBottom: '5px',
    fontWeight: '700',
  },
  subtitle: {
    color: '#636e72',
    fontSize: '16px',
    marginBottom: '0',
  },
  form: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2d3436',
    fontSize: '14px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    color: '#666',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '15px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    cursor: 'pointer',
    outline: 'none',
  },
  hint: {
    fontSize: '13px',
    color: '#27ae60',
    display: 'block',
    marginTop: '6px',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  buttonHover: {
    backgroundColor: '#229954',
  },
  secondaryButton: {
    padding: '11px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '10px',
    marginBottom: '10px',
    transition: 'background-color 0.2s',
    display: 'inline-block',
  },
  hiddenInput: {
    display: 'none',
  },
  actions: {
    marginBottom: '20px',
  },
  listContainer: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  listTitle: {
    color: '#2d3436',
    marginTop: '0',
    marginBottom: '18px',
    fontSize: '20px',
    fontWeight: '700',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    padding: '30px 20px',
  },
  emptyHint: {
    margin: '10px 0 0 0',
    fontSize: '14px',
    color: '#bbb',
  },
  groceryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s',
  },
  groceryInfo: {
    flex: 1,
  },
  groceryName: {
    margin: '0 0 6px 0',
    color: '#2d3436',
    fontSize: '17px',
    fontWeight: '600',
  },
  groceryMeta: {
    margin: '0',
    color: '#999',
    fontSize: '13px',
  },
  groceryControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f5f5f5',
    padding: '6px 10px',
    borderRadius: '6px',
  },
  quantityInput: {
    width: '60px',
    padding: '6px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
  },
  unit: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
    minWidth: '55px',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  footer: {
    backgroundColor: '#fff3cd',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #ffc107',
    marginBottom: '20px',
  },
  footerTitle: {
    margin: '0 0 12px 0',
    color: '#856404',
    fontSize: '16px',
  },
  footerList: {
    margin: '0',
    paddingLeft: '20px',
    color: '#856404',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  shareFooter: {
    backgroundColor: '#d4edda',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #28a745',
    textAlign: 'center',
  },
  shareUrl: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#155724',
    wordBreak: 'break-all',
    backgroundColor: 'white',
    padding: '8px',
    borderRadius: '4px',
    margin: '8px 0 0 0',
  },
};
