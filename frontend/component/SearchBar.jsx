import React, { useState, useEffect } from 'react';
import './searchBar.css';

function SearchBar({ onStockSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [stocks, setStocks] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.length > 1) {
                searchStocks(searchTerm);
            } else {
                setStocks([]);
                setShowDropdown(false);
            }
        }, 300); // Wait 300ms after user stops typing

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const searchStocks = async (query) => {
        console.log('Searching for:', query);
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/stocks/search?q=${query}`);
            console.log('Response status:', response.status);
            const results = await response.json();
            console.log('Results:', results);
            
            if (Array.isArray(results)) {
                setStocks(results.slice(0, 20)); // Limit to 10 results
                setShowDropdown(true);
            } else {
                setStocks([]);
                setShowDropdown(false);
            }
        } catch (error) {
            setStocks([]);
            setShowDropdown(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value.toUpperCase());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // If there are suggestions, select the first one
            if (stocks.length > 0) {
                handleStockSelect(stocks[0]);
            } else if (searchTerm.length > 0) {
                // If no suggestions but user typed something, treat it as a direct symbol search
                handleStockSelect({ symbol: searchTerm.trim() });
            }
        }
    };

    const handleStockSelect = (stock) => {
        console.log('Stock selected:', stock); // Debug log
        setSearchTerm('');
        setStocks([]);
        setShowDropdown(false);
        
        // Call parent component's callback if provided
        if (onStockSelect) {
            onStockSelect(stock);
        }
    };

    const handleInputFocus = () => {
        if (stocks.length > 0) {
            setShowDropdown(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow clicks on items
        setTimeout(() => {
            setShowDropdown(false);
        }, 300);
    };
    
    return (
        <div className="search-bar">
            <input 
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                autoComplete="chrome-off"
            />
            
            {showDropdown && stocks.length > 0 && (
                <div className="suggestions-dropdown">
                    {stocks.map((stock, index) => (
                        <div 
                            key={index}
                            className="suggestion-item"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                handleStockSelect(stock);
                            }}
                        >
                            <span className="symbol">{stock.symbol}</span>
                        </div>
                    ))}
                </div>
            )}
            
        </div>
    );
}

export default SearchBar;